import { loadEnvConfig } from "@next/env";
import { databaseProducts } from "@/lib/marketing-content";
import { createProductRecord, readProductRecords } from "@/lib/data-store";
import { createLocalId } from "@/lib/local-json-store";
import { DuplicateRecordError } from "@/lib/duplicate-record";

loadEnvConfig(process.cwd());

async function seedProducts() {
  const existing = await readProductRecords();
  let inserted = 0;
  for (const product of databaseProducts) {
    if (existing.some((item) => item.name === product.title)) {
      continue;
    }
    try {
      await createProductRecord({
        _id: createLocalId(),
        name: product.title,
        description: product.description,
        category: product.eyebrow,
        image: "/images/research-partnership.svg",
        sampleFile: null,
        isActive: true,
        createdAt: new Date(),
      });
      inserted += 1;
    } catch (error) {
      if (!(error instanceof DuplicateRecordError)) {
        throw error;
      }
    }
  }
  console.info(`Product seed complete: ${inserted} inserted.`);
}

seedProducts()
  .catch((error: unknown) => {
    console.error("Product seed failed.", error);
    process.exitCode = 1;
  });
