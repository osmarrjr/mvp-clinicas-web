import { z } from "zod";

import { AppRole } from "@/lib/auth/types";

export const staffListFilterSchema = z.object({
  name: z.string().trim().optional(),
  email: z.string().trim().optional(),
  role: z.nativeEnum(AppRole).optional(),
});

export type StaffListFilterValues = z.infer<typeof staffListFilterSchema>;
