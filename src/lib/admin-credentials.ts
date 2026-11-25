import { z } from "zod";
import { adminRoles } from "@/types/admin";

export const createAdminSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
    role: z.enum(adminRoles),
    password: z.string().min(12).max(128),
  })
  .strict();
