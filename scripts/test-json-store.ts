import assert from "node:assert/strict";
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  unlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

async function main() {
  const originalDirectory = process.cwd();
  const testDirectory = await mkdtemp(join(tmpdir(), "ecore-json-store-"));

  try {
    process.chdir(testDirectory);
    const dataDirectory = join(testDirectory, "data");
    await mkdir(dataDirectory, { recursive: true });
    await writeFile(join(dataDirectory, "newsletter.json"), "", "utf8");

    const { createLocalId, readLocalStore, updateLocalStore } = await import(
      "../src/lib/local-json-store"
    );
    const {
      createSubmissionId,
      readSubmissionRecords,
      updateSubmissionRecords,
    } = await import("../src/lib/submission-json-store");
    const writes = 24;
    await Promise.all(
      Array.from({ length: writes }, (_, index) =>
        updateLocalStore((store) => {
          store.rateLimits.push({
            key: `test-${index}`,
            hits: 1,
            expiresAt: new Date(Date.now() + 60_000),
          });
        }),
      ),
    );

    const store = await readLocalStore();
    assert.equal(store.rateLimits.length, writes);
    assert.ok(store.rateLimits[0].expiresAt instanceof Date);

    const persisted = JSON.parse(
      await readFile(join(testDirectory, ".local-data", "store.json"), "utf8"),
    ) as { rateLimits: unknown[] };
    assert.equal(persisted.rateLimits.length, writes);

    const legacyEnquiryId = createLocalId();
    const legacyDownloadId = createLocalId();
    const legacyProductId = createLocalId();
    await updateLocalStore((store) => {
      store.enquiries.push({
        _id: legacyEnquiryId,
        name: "Legacy Enquiry Test",
        email: "legacy-enquiry@example.invalid",
        phone: "+1 202 555 0102",
        company: "Example Company",
        service: "Lead Generation",
        message: "This enquiry verifies the legacy migration.",
        status: "new",
        createdAt: new Date(),
      });
      store.downloadRequests.push({
        _id: legacyDownloadId,
        name: "Legacy Download Test",
        email: "legacy-download@example.invalid",
        phone: "+1 202 555 0103",
        company: "Example Company",
        productId: legacyProductId,
        createdAt: new Date(),
      });
    });

    process.env.SMTP_HOST = "";
    const { POST: postEnquiry } = await import(
      "../src/app/api/enquiries/route"
    );
    const { POST: postContact } = await import(
      "../src/app/api/contact/route"
    );
    const { POST: postNewsletter } = await import(
      "../src/app/api/newsletter/route"
    );
    const { POST: postDownloadRequest } = await import(
      "../src/app/api/download-requests/route"
    );
    const originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      if (
        typeof args[0] !== "string" ||
        !args[0].includes("SMTP notification delivery failed")
      ) {
        originalConsoleError(...args);
      }
    };
    try {
      const makeEnquiryRequest = (url: string, values: object) =>
        new Request(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(values),
        });
      const validEnquiry = {
        name: "Local JSON Test",
        email: "local-json@example.invalid",
        phone: "+1 202 555 0100",
        company: "Example Company",
        service: "Lead Generation",
        message: "This enquiry verifies local JSON persistence.",
        website: "",
      };

      const invalidContact = await postContact(
        makeEnquiryRequest("http://localhost/api/contact", { name: "Invalid" }),
      );
      assert.equal(invalidContact.status, 400);
      assert.equal((await readSubmissionRecords("contact")).length, 0);

      const enquiryResponse = await postEnquiry(
        makeEnquiryRequest("http://localhost/api/enquiries", validEnquiry),
      );
      assert.equal(enquiryResponse.status, 201);
      const savedEnquiryResponse = (await enquiryResponse.json()) as {
        emailNotificationSent: boolean;
      };
      assert.equal(savedEnquiryResponse.emailNotificationSent, false);

      const contactValues = {
        ...validEnquiry,
        name: "Contact Form Test",
        email: "contact-form@example.invalid",
      };
      const contactResponse = await postContact(
        makeEnquiryRequest("http://localhost/api/contact", contactValues),
      );
      assert.equal(contactResponse.status, 201);
      await postContact(
        makeEnquiryRequest("http://localhost/api/contact", {
          ...contactValues,
          name: "Second Contact Test",
          email: "second-contact@example.invalid",
        }),
      );

      const newsletterRequest = (email: string) =>
        new Request("http://localhost/api/newsletter", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email }),
        });
      assert.equal(
        (await postNewsletter(newsletterRequest("News@example.invalid"))).status,
        201,
      );
      assert.equal(
        (await postNewsletter(newsletterRequest("news@example.invalid"))).status,
        201,
      );

      const productId = createLocalId();
      await updateLocalStore((store) => {
        store.products.push({
          _id: productId,
          name: "Test Product",
          description: "A local test product for the sample request API.",
          category: "Testing",
          image: "/images/test-product.png",
          sampleFile: null,
          isActive: true,
          createdAt: new Date(),
        });
      });
      const downloadResponse = await postDownloadRequest(
        new Request("http://localhost/api/download-requests", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: "Download Form Test",
            email: "download-form@example.invalid",
            phone: "+1 202 555 0101",
            company: "Example",
            productId,
            website: "",
          }),
        }),
      );
      assert.equal(downloadResponse.status, 201);
      const downloadResult = (await downloadResponse.json()) as {
        downloadUrl: string | null;
      };
      assert.equal(downloadResult.downloadUrl, null);

      const { GET: getEnquiries } = await import(
        "../src/app/api/enquiries/route"
      );
      const { DELETE: deleteEnquiry, GET: getEnquiry, PATCH: patchEnquiry } =
        await import("../src/app/api/enquiries/[id]/route");
      const { GET: getDownloads } = await import(
        "../src/app/api/download-requests/route"
      );
      const { GET: getDashboard } = await import(
        "../src/app/api/admin/dashboard/route"
      );
      assert.equal(
        (
          await getEnquiries(
            new Request("http://localhost/api/enquiries"),
          )
        ).status,
        401,
      );
      assert.equal(
        (
          await getDashboard(
            new Request("http://localhost/api/admin/dashboard"),
          )
        ).status,
        401,
      );

      const adminId = createLocalId();
      await updateLocalStore((store) => {
        store.admins.push({
          _id: adminId,
          name: "Test Admin",
          email: "test-admin@example.invalid",
          passwordHash: "not-used-by-session-test",
          role: "superadmin",
          isActive: true,
          createdAt: new Date(),
        });
      });
      const { adminSessionCookieName, createAdminSession } = await import(
        "../src/lib/admin-session"
      );
      const { token } = await createAdminSession(adminId);
      const cookie = `${adminSessionCookieName()}=${token}`;
      const authenticatedGet = (url: string) =>
        new Request(url, { headers: { cookie } });

      const enquiriesResponse = await getEnquiries(
        authenticatedGet("http://localhost/api/enquiries"),
      );
      assert.equal(enquiriesResponse.status, 200);
      const enquiriesResult = (await enquiriesResponse.json()) as {
        items: Array<{ id: string }>;
        pagination: { total: number };
      };
      assert.equal(enquiriesResult.pagination.total, 4);

      const dashboardResponse = await getDashboard(
        authenticatedGet("http://localhost/api/admin/dashboard"),
      );
      assert.equal(dashboardResponse.status, 200);
      const dashboardResult = (await dashboardResponse.json()) as {
        stats: { totalEnquiries: number; contactSubmissions: number; totalDownloads: number; newsletterSubscriptions: number };
        latestSubmissions: Array<{ type: string }>;
      };
      assert.equal(dashboardResult.stats.totalEnquiries, 4);
      assert.equal(dashboardResult.stats.contactSubmissions, 2);
      assert.equal(dashboardResult.stats.totalDownloads, 2);
      assert.equal(dashboardResult.stats.newsletterSubscriptions, 1);
      assert.ok(dashboardResult.latestSubmissions.length > 0);

      const downloadsResponse = await getDownloads(
        authenticatedGet("http://localhost/api/download-requests"),
      );
      assert.equal(downloadsResponse.status, 200);

      const currentContacts = await readSubmissionRecords("contact");
      const contactId = enquiriesResult.items.find(
        (item) => item.id === currentContacts[0].id,
      )?.id;
      assert.ok(contactId);
      const patchResponse = await patchEnquiry(
        new Request(`http://localhost/api/enquiries/${contactId}`, {
          method: "PATCH",
          headers: {
            cookie,
            origin: "http://localhost",
            "content-type": "application/json",
          },
          body: JSON.stringify({ status: "qualified" }),
        }),
        { params: Promise.resolve({ id: contactId }) },
      );
      assert.equal(patchResponse.status, 200);

      const detailResponse = await getEnquiry(
        authenticatedGet(`http://localhost/api/enquiries/${contactId}`),
        { params: Promise.resolve({ id: contactId }) },
      );
      assert.equal(detailResponse.status, 200);

      const deleteResponse = await deleteEnquiry(
        new Request(`http://localhost/api/enquiries/${contactId}`, {
          method: "DELETE",
          headers: { cookie, origin: "http://localhost" },
        }),
        { params: Promise.resolve({ id: contactId }) },
      );
      assert.equal(deleteResponse.status, 204);
      assert.equal((await readSubmissionRecords("contact")).length, 1);
    } finally {
      console.error = originalConsoleError;
    }

    const savedEnquiries = await readSubmissionRecords("enquiries");
    const savedContacts = await readSubmissionRecords("contact");
    const savedDownloads = await readSubmissionRecords("download-requests");
    const savedNewsletter = await readSubmissionRecords("newsletter");
    assert.equal(savedEnquiries.length, 2);
    assert.ok(
      savedEnquiries.some((item) => item.email === "local-json@example.invalid"),
    );
    assert.ok(savedEnquiries.some((item) => item.id === legacyEnquiryId));
    assert.equal(savedContacts.length, 1);
    assert.equal(savedDownloads.length, 2);
    assert.ok(savedDownloads.some((item) => item.id === legacyDownloadId));
    assert.equal(savedNewsletter.length, 1);
    assert.ok(savedEnquiries[0].id);
    assert.ok(savedEnquiries[0].createdAt instanceof Date);

    const newsletterFile = join(dataDirectory, "newsletter.json");
    const validNewsletterFile = await readFile(newsletterFile, "utf8");
    await writeFile(newsletterFile, "{malformed", "utf8");
    await assert.rejects(() => readSubmissionRecords("newsletter"));
    assert.equal(await readFile(newsletterFile, "utf8"), "{malformed");
    await writeFile(newsletterFile, validNewsletterFile, "utf8");

    const expectedFiles = [
      "enquiries.json",
      "contact.json",
      "download-requests.json",
      "newsletter.json",
    ];
    for (const filename of expectedFiles) {
      await readFile(join(dataDirectory, filename), "utf8");
    }

    const parallelRecords = Array.from({ length: 8 }, (_, index) =>
      updateSubmissionRecords("newsletter", (records) => {
        records.push({
          id: createSubmissionId(),
          email: `parallel-${index}@example.invalid`,
          createdAt: new Date(),
        });
      }),
    );
    await Promise.all(parallelRecords);
    assert.equal((await readSubmissionRecords("newsletter")).length, 9);
    await unlink(newsletterFile);
    assert.deepEqual(await readSubmissionRecords("newsletter"), []);
    assert.deepEqual(JSON.parse(await readFile(newsletterFile, "utf8")), []);

    console.info(
      "Form APIs, per-file persistence, validation, duplicate newsletter handling, and safe writes passed.",
    );
  } finally {
    process.chdir(originalDirectory);
    await rm(testDirectory, {
      recursive: true,
      force: true,
      maxRetries: 40,
      retryDelay: 500,
    });
  }
}

main().catch((error: unknown) => {
  console.error("Local JSON storage test failed.", error);
  process.exitCode = 1;
});
