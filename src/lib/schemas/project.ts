import { z } from "zod";

export const projectStatusSchema = z.enum(["draft", "published"]);

export const projectFormSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().optional(),
  url: z.string().url("URL must be valid."),
  iconUrl: z.union([z.literal(""), z.string().url("Icon URL must be valid.")]),
  language: z.string().optional(),
  languageColor: z.union([
    z.literal(""),
    z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use a hex color like #3DD9EB."),
  ]),
  sortOrder: z.coerce.number().int().min(0).default(0),
  status: projectStatusSchema,
});

export type ProjectFormInput = z.infer<typeof projectFormSchema>;

export type ProjectActionFailure = ProjectFormInput & { error: string };