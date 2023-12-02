import z from "zod";

export const create = z.object({
  url: z.string().url(),
  branch: z.string()
});
