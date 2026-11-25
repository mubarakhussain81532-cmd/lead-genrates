import { loadEnvConfig } from "@next/env";
import { databaseProducts } from "@/lib/marketing-content";
import { createLocalId, updateLocalStore } from "@/lib/local-json-store";

loadEnvConfig(process.cwd());

async function seedProducts() {
  const inserted = await updateLocalStore((store) => {
    let count = 0;
    for (const product of databaseProducts) {
      if (store.products.some((item) => item.name === product.title)) {
        continue;
      }
      store.products.push({
        _id: createLocalId(),
        name: product.title,
        description: product.description,
        category: product.eyebrow,
        image: "/images/research-partnership.svg",
        sampleFile: null,
        isActive: true,
        createdAt: new Date(),
      });
      count += 1;
    }
    return count;
  });
  console.info(`Product seed complete: ${inserted} inserted.`);
}

seedProducts()
  .catch((error: unknown) => {
    console.error("Product seed failed.", error);
    process.exitCode = 1;
  });
