import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import { z } from "zod";

const ParamIdentifierSchema = z.object({
  name: z.string(),
  in: z.enum(["query", "header", "path", "cookie"]).optional(),
});

const SplitEntrySchema = z.object({
  prefix: z.string(),
  outputName: z.string(),
  title: z.string().optional(),
});

const SpecEntrySchema = z.object({
  source: z.string(),
  outputName: z.string().optional(),
  title: z.string().optional(),
  openapiVersion: z.string().optional(),
  split: z.array(SplitEntrySchema).optional(),
  removeParams: z.array(ParamIdentifierSchema).optional(),
  removePaths: z.array(z.string()).optional(),
  removeFalsePathParams: z.boolean().optional(),
  ensureOperationId: z.boolean().optional(),
  descriptionNote: z.string().optional(),
});

const DefaultsSchema = z.object({
  openapiVersion: z.string().default("3.0.3"),
  removeParams: z.array(ParamIdentifierSchema).default([]),
  removeFalsePathParams: z.boolean().default(true),
  ensureOperationId: z.boolean().default(true),
  descriptionNote: z
    .string()
    .default(
      "Requests with a body must be sent with `Content-Type: application/json`.",
    ),
});

const ClientConfigSchema = z.object({
  client: z.string(),
  outputDir: z.string(),
  specsDir: z.string().default("."),
  defaults: DefaultsSchema.default({}),
  specs: z.array(SpecEntrySchema).min(1),
});

export type ParamIdentifier = z.infer<typeof ParamIdentifierSchema>;
export type SplitEntry = z.infer<typeof SplitEntrySchema>;
export type SpecEntry = z.infer<typeof SpecEntrySchema>;
export type Defaults = z.infer<typeof DefaultsSchema>;
export type ClientConfig = z.infer<typeof ClientConfigSchema>;

export function loadConfig(configPath: string): ClientConfig {
  const raw = readFileSync(configPath, "utf-8");
  const parsed = parseYaml(raw);
  return ClientConfigSchema.parse(parsed);
}
