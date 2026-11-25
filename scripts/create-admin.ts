import { loadEnvConfig } from "@next/env";
import { hashPassword } from "../src/lib/password";
import { createAdminSchema } from "../src/lib/admin-credentials";
import { adminRoles } from "../src/types/admin";
import { createAdminRecord } from "../src/lib/data-store";
import { createLocalId } from "../src/lib/local-json-store";
import { DuplicateRecordError } from "../src/lib/duplicate-record";

loadEnvConfig(process.cwd());

function readHidden(prompt: string): Promise<string> {
  const input = process.stdin;
  const output = process.stdout;
  if (!input.isTTY || !output.isTTY || typeof input.setRawMode !== "function") {
    throw new Error("Run this command in an interactive terminal to enter the password securely.");
  }

  output.write(prompt);
  input.setRawMode(true);
  input.resume();
  return new Promise((resolve, reject) => {
    let value = "";
    const finish = (error?: Error) => {
      input.setRawMode(false);
      input.pause();
      input.removeListener("data", onData);
      output.write("\n");
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    };
    const onData = (chunk: Buffer) => {
      for (const character of chunk.toString("utf8")) {
        if (character === "\u0003") {
          finish(new Error("Admin setup was cancelled."));
          return;
        }
        if (character === "\r" || character === "\n") {
          finish();
          return;
        }
        if (character === "\u007f" || character === "\b") {
          value = value.slice(0, -1);
          continue;
        }
        if (character >= " " && character !== "\u007f") {
          value += character;
        }
      }
    };
    input.on("data", onData);
  });
}

async function main() {
  const [email, name, role = "superadmin"] = process.argv.slice(2);
  const parsedRole = adminRoles.find((item) => item === role);
  const input = createAdminSchema.safeParse({
    email,
    name,
    role: parsedRole,
    password: "A-placeholder-password-that-is-not-used",
  });
  if (!email || !name || !parsedRole || !input.success) {
    throw new Error(
      `Usage: npm run create:admin -- <email> <name> [${adminRoles.join("|")}]`,
    );
  }

  const password = await readHidden("Create a password (12–128 characters): ");
  const confirmedPassword = await readHidden("Confirm password: ");
  const validated = createAdminSchema.safeParse({
    email,
    name,
    role: parsedRole,
    password,
  });
  if (!validated.success) {
    throw new Error("Password must contain between 12 and 128 characters.");
  }
  if (password !== confirmedPassword) {
    throw new Error("The passwords do not match.");
  }

  const passwordHash = await hashPassword(validated.data.password);
  await createAdminRecord({
    _id: createLocalId(),
    name: validated.data.name,
    email: validated.data.email,
    role: validated.data.role,
    passwordHash,
    isActive: true,
    createdAt: new Date(),
  });
  console.info(`Created ${validated.data.role} account for ${validated.data.email}.`);
}

main()
  .catch((error: unknown) => {
    console.error(
      error instanceof DuplicateRecordError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Admin setup failed.",
    );
    process.exitCode = 1;
  });
