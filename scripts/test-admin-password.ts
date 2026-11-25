import assert from "node:assert/strict";
import { hashPassword, verifyPassword, verifyPasswordOrDummy } from "../src/lib/password";

async function main() {
  const password = "correct horse battery staple";
  const firstHash = await hashPassword(password);
  const secondHash = await hashPassword(password);

  assert.notEqual(firstHash, secondHash, "Password hashes use independent salts.");
  assert.equal(await verifyPassword(password, firstHash), true);
  assert.equal(await verifyPassword("incorrect password", firstHash), false);
  assert.equal(await verifyPassword(password, "invalid-hash"), false);
  assert.equal(await verifyPasswordOrDummy(password), false);
  console.info("Admin password hashing checks passed.");
}

main().catch((error: unknown) => {
  console.error(
    "Admin password checks failed:",
    error instanceof Error ? error.message : "Unknown error",
  );
  process.exitCode = 1;
});
