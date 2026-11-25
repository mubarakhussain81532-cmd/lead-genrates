import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import {
  createLocalId,
  readLocalStore,
  updateLocalStore,
} from "@/lib/local-json-store";
import type { AdminIdentity } from "@/types/admin";
import type { AdminRecord } from "@/types/local-store";

const sessionDurationSeconds = 8 * 60 * 60;

export function adminSessionCookieName(): string {
  return process.env.NODE_ENV === "production"
    ? "__Host-ecore_admin_session"
    : "ecore_admin_session";
}

function sessionTokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function toIdentity(admin: Pick<AdminRecord, "_id" | "name" | "email" | "role">): AdminIdentity {
  return {
    id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  };
}

export function sessionCookieHeader(token: string, maxAge: number): string {
  const flags = [
    `${adminSessionCookieName()}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${maxAge}`,
  ];
  if (process.env.NODE_ENV === "production") {
    flags.push("Secure");
  }
  return flags.join("; ");
}

export async function createAdminSession(
  adminId: string,
): Promise<{ token: string; identity: AdminIdentity }> {
  const token = randomBytes(32).toString("base64url");
  const identity = await updateLocalStore((store) => {
    const admin = store.admins.find(
      (item) => item._id === adminId && item.isActive,
    );
    if (!admin) {
      throw new Error("Cannot create a session for an inactive administrator.");
    }

    store.adminSessions.push({
      _id: createLocalId(),
      adminId: admin._id,
      tokenHash: sessionTokenHash(token),
      expiresAt: new Date(Date.now() + sessionDurationSeconds * 1000),
      createdAt: new Date(),
    });
    return toIdentity(admin);
  });
  return { token, identity };
}

export async function revokeAdminSession(token: string): Promise<void> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
    return;
  }
  await updateLocalStore((store) => {
    store.adminSessions = store.adminSessions.filter(
      (item) => item.tokenHash !== sessionTokenHash(token),
    );
  });
}

export async function getAdminIdentity(
  token: string | undefined,
): Promise<AdminIdentity | null> {
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
    return null;
  }

  const store = await readLocalStore();
  const session = store.adminSessions.find(
    (item) =>
      item.tokenHash === sessionTokenHash(token) &&
      item.expiresAt > new Date(),
  );
  if (!session) {
    return null;
  }

  const admin = store.admins.find(
    (item) => item._id === session.adminId && item.isActive,
  );
  if (!admin) {
    await updateLocalStore((current) => {
      current.adminSessions = current.adminSessions.filter(
        (item) => item._id !== session._id,
      );
    });
    return null;
  }

  return toIdentity(admin);
}

export function getAdminSessionToken(request: Request): string | undefined {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookieName = adminSessionCookieName();
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`))
    ?.slice(cookieName.length + 1);
}

export async function getCurrentAdmin(): Promise<AdminIdentity | null> {
  const cookieStore = await cookies();
  return getAdminIdentity(cookieStore.get(adminSessionCookieName())?.value);
}

export const adminSessionMaxAge = sessionDurationSeconds;
