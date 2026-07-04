import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .url("Enter a valid URL.")
  .or(z.literal(""));

const optionalToken = z.string().trim();

export const umamiSettingsFormSchema = z
  .object({
    enabled: z
      .union([z.literal("on"), z.literal("true"), z.literal("")])
      .optional()
      .transform((value) => value === "on" || value === "true"),
    scriptUrl: optionalUrl,
    websiteId: z.string().trim(),
    apiUrl: optionalUrl,
    apiToken: optionalToken,
  })
  .superRefine((data, ctx) => {
    if (!data.enabled) {
      return;
    }

    if (!data.websiteId) {
      ctx.addIssue({
        code: "custom",
        message: "Website ID is required when Umami is enabled.",
        path: ["websiteId"],
      });
    }

    if (!data.scriptUrl && !data.apiUrl) {
      ctx.addIssue({
        code: "custom",
        message: "Script URL or API URL is required when Umami is enabled.",
        path: ["scriptUrl"],
      });
    }
  });

export type UmamiSettingsFormInput = z.infer<typeof umamiSettingsFormSchema>;