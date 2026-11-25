import assert from "node:assert/strict";
import { createServer, type Server } from "node:net";
import { sendEnquiryNotification } from "@/lib/enquiry-email";
import { getSmtpEnv } from "@/lib/env";

let server: Server | null = null;
let message = "";

async function startSmtpStub(): Promise<number> {
  server = createServer((socket) => {
    socket.setEncoding("utf8");
    socket.write("220 localhost ESMTP ready\r\n");
    let input = "";
    let receivingMessage = false;
    let authStage = 0;

    socket.on("data", (chunk) => {
      input += chunk;
      const lines = input.split("\r\n");
      input = lines.pop() ?? "";

      for (const line of lines) {
        if (receivingMessage) {
          if (line === ".") {
            receivingMessage = false;
            socket.write("250 2.0.0 Message accepted\r\n");
          } else {
            message += `${line}\n`;
          }
          continue;
        }

        const command = line.split(" ", 1)[0].toUpperCase();
        if (command === "EHLO" || command === "HELO") {
          socket.write("250-localhost\r\n250-AUTH PLAIN LOGIN\r\n250 SIZE 52428800\r\n");
        } else if (command === "AUTH" && line.toUpperCase().startsWith("AUTH PLAIN")) {
          socket.write("235 2.7.0 Authentication successful\r\n");
        } else if (command === "AUTH" && line.toUpperCase() === "AUTH LOGIN") {
          authStage = 1;
          socket.write("334 VXNlcm5hbWU6\r\n");
        } else if (authStage === 1) {
          authStage = 2;
          socket.write("334 UGFzc3dvcmQ6\r\n");
        } else if (authStage === 2) {
          authStage = 0;
          socket.write("235 2.7.0 Authentication successful\r\n");
        } else if (command === "DATA") {
          receivingMessage = true;
          socket.write("354 End data with <CRLF>.<CRLF>\r\n");
        } else if (command === "QUIT") {
          socket.write("221 2.0.0 Bye\r\n");
          socket.end();
        } else {
          socket.write("250 2.0.0 OK\r\n");
        }
      }
    });
  });

  await new Promise<void>((resolve, reject) => {
    server?.once("error", reject);
    server?.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Could not start the local SMTP test stub.");
  }
  return address.port;
}

async function run(): Promise<void> {
  try {
    const port = await startSmtpStub();
    Object.assign(process.env, {
      SMTP_HOST: "127.0.0.1",
      SMTP_PORT: String(port),
      SMTP_SECURE: "false",
      SMTP_REQUIRE_TLS: "false",
      SMTP_USER: "local-test-user",
      SMTP_PASSWORD: "local-test-password",
      SMTP_FROM: "notifications@example.invalid",
      ENQUIRY_NOTIFICATION_TO: "team@example.invalid",
    });
    const smtp = getSmtpEnv();

    await sendEnquiryNotification(
      {
        name: "Test Customer",
        email: "customer@example.invalid",
        phone: "+1 202 555 0100",
        company: "Example Company",
        service: "Lead Generation",
        message: "Please contact me about the service.",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      },
      smtp,
    );

    assert.match(message, /Subject: New eCore Business website enquiry/i);
    assert.match(message, /Reply-To: customer@example\.invalid/i);
    assert.match(message, /Please contact me about the service\./);
    console.info("SMTP notification test passed using a local-only mail stub.");
  } finally {
    if (server) {
      await new Promise<void>((resolve) => server?.close(() => resolve()));
    }
  }
}

run().catch((error: unknown) => {
  console.error("SMTP notification test failed", error);
  process.exitCode = 1;
});
