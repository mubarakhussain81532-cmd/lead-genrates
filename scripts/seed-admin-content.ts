import { loadEnvConfig } from "@next/env";
import { defaultSiteContent } from "../src/lib/default-site-content";
import { services } from "../src/lib/marketing-content";
import { serviceIconNames } from "../src/lib/service-icons";
import {
  createLocalId,
  updateLocalStore,
} from "../src/lib/local-json-store";

loadEnvConfig(process.cwd());

async function main() {
  await updateLocalStore((store) => {
    services.forEach((service, index) => {
      if (!store.services.some((item) => item.slug === service.slug)) {
        const icon = serviceIconNames.find(
          (iconName) => iconName === service.iconName,
        );
        if (!icon) {
          throw new Error(`Unknown service icon for "${service.slug}".`);
        }
        store.services.push({
          _id: createLocalId(),
          title: service.title,
          description: service.description,
          slug: service.slug,
          icon,
          isActive: true,
          createdAt: new Date(Date.now() + index),
          updatedAt: new Date(),
        });
      }
    });
    if (!store.siteContent) {
      store.siteContent = {
        _id: "public",
        ...defaultSiteContent,
        updatedAt: new Date(),
      };
    }
  });
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
