import "server-only";

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const keyLength = 64;
const cost = 16_384;
const blockSize = 8;
const parallelization = 1;
const maxMemory = 64 * 1024 * 1024;
let dummyHashPromise: Promise<string> | undefined;

function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      keyLength,
      { N: cost, r: blockSize, p: parallelization, maxmem: maxMemory },
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(derivedKey);
      },
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = await deriveKey(password, salt);
  return [
    "scrypt",
    cost,
    blockSize,
    parallelization,
    salt.toString("base64url"),
    derivedKey.toString("base64url"),
  ].join("$");
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [algorithm, n, r, p, encodedSalt, encodedHash, extra] =
    storedHash.split("$");
  if (
    algorithm !== "scrypt" ||
    n !== String(cost) ||
    r !== String(blockSize) ||
    p !== String(parallelization) ||
    !encodedSalt ||
    !encodedHash ||
    extra !== undefined
  ) {
    return false;
  }

  const salt = Buffer.from(encodedSalt, "base64url");
  const expected = Buffer.from(encodedHash, "base64url");
  if (salt.length !== 16 || expected.length !== keyLength) {
    return false;
  }

  const actual = await deriveKey(password, salt);
  return timingSafeEqual(actual, expected);
}

export async function verifyPasswordOrDummy(
  password: string,
  storedHash?: string,
): Promise<boolean> {
  if (storedHash) {
    return verifyPassword(password, storedHash);
  }

  dummyHashPromise ??= hashPassword("invalid-login-dummy-secret");
  await verifyPassword(password, await dummyHashPromise);
  return false;
}
