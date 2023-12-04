import z from "zod";

export const create = z.object({
  url: z.string().url(),
  branch: z.string(),
  buildCommand: z.string().min(4),
  startCommand: z.string().min(4),
  rootDirectory: z.string().min(1),
  port: z.string(),
});
