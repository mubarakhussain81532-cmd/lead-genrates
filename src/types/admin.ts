export const adminRoles = ["superadmin", "admin", "support"] as const;

export type AdminRole = (typeof adminRoles)[number];

export type AdminIdentity = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
};
