import { loadEnvConfig } from "@next/env";
import { defaultSiteContent } from "../src/lib/default-site-content";
import { services } from "../src/lib/marketing-content";
import { serviceIconNames } from "../src/lib/service-icons";
import {
  createServiceRecord,
  readServiceRecords,
  readSiteContentRecord,
  writeSiteContentRecord,
} from "../src/lib/data-store";
import { createLocalId } from "../src/lib/local-json-store";
import { DuplicateRecordError } from "../src/lib/duplicate-record";

loadEnvConfig(process.cwd());

async function main() {
  const existingServices = await readServiceRecords();
  for (const [index, service] of services.entries()) {
    if (existingServices.some((item) => item.slug === service.slug)) {
      continue;
    }
    const icon = serviceIconNames.find(
      (iconName) => iconName === service.iconName,
    );
    if (!icon) {
      throw new Error(`Unknown service icon for "${service.slug}".`);
    }
    try {
      await createServiceRecord({
        _id: createLocalId(),
        title: service.title,
        description: service.description,
        slug: service.slug,
        icon,
        isActive: true,
        createdAt: new Date(Date.now() + index),
        updatedAt: new Date(),
      });
    } catch (error) {
      if (!(error instanceof DuplicateRecordError)) {
        throw error;
      }
    }
  }
  if (!(await readSiteContentRecord())) {
    await writeSiteContentRecord({
      _id: "public",
      ...defaultSiteContent,
      updatedAt: new Date(),
    });
  }
  console.info("Default service and site-content records are ready.");
}

main()
  .catch((error: unknown) => {
    console.error(
      "Could not seed admin content:",
      error instanceof Error ? error.name : "Unknown error",
    );
    process.exitCode = 1;
  });
