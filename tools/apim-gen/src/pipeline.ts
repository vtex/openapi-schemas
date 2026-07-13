import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import type { ClientConfig, SpecEntry, Defaults, ParamIdentifier } from "./config.js";
import type { OpenAPISpec } from "./types.js";
import { deepClone } from "./types.js";
import {
  splitByPrefix,
  removeParams,
  removeFalsePathParams,
  removePaths,
  setOpenapiVersion,
  ensureOperationId,
  addDescriptionNote,
  cleanupComponents,
} from "./transforms/index.js";

export interface PipelineResult {
  outputPath: string;
  title: string;
  pathCount: number;
}

function loadSpec(specsDir: string, source: string): OpenAPISpec {
  const filePath = resolve(specsDir, source);
  const raw = readFileSync(filePath, "utf-8");
  try {
    return JSON.parse(raw) as OpenAPISpec;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse ${filePath}: ${message}`);
  }
}

function mergeParams(
  defaults: ParamIdentifier[],
  perSpec: ParamIdentifier[] | undefined,
): ParamIdentifier[] {
  if (!perSpec || perSpec.length === 0) return defaults;
  const seen = new Set<string>();
  const result: ParamIdentifier[] = [];
  for (const list of [defaults, perSpec]) {
    for (const p of list) {
      const key = `${p.name.toLowerCase()}:${p.in ?? "*"}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(p);
      }
    }
  }
  return result;
}

function resolveOption<T>(perSpec: T | undefined, defaultVal: T): T {
  return perSpec !== undefined ? perSpec : defaultVal;
}

function applyTransforms(
  spec: OpenAPISpec,
  entry: SpecEntry,
  defaults: Defaults,
): OpenAPISpec {
  // 1. Remove specific params (merge defaults + per-spec)
  const paramMatchers = mergeParams(defaults.removeParams, entry.removeParams);
  if (paramMatchers.length > 0) {
    removeParams(spec, paramMatchers);
  }

  // 2. Remove false path params
  if (resolveOption(entry.removeFalsePathParams, defaults.removeFalsePathParams)) {
    removeFalsePathParams(spec);
  }

  // 3. Remove specific paths
  if (entry.removePaths && entry.removePaths.length > 0) {
    removePaths(spec, entry.removePaths);
  }

  // 4. Set OpenAPI version
  const version = resolveOption(entry.openapiVersion, defaults.openapiVersion);
  setOpenapiVersion(spec, version);

  // 5. Ensure operation IDs
  if (resolveOption(entry.ensureOperationId, defaults.ensureOperationId)) {
    ensureOperationId(spec);
  }

  // 6. Add description note
  const note = resolveOption(entry.descriptionNote, defaults.descriptionNote);
  if (note) {
    addDescriptionNote(spec, note);
  }

  // 7. Cleanup unused components (always last)
  cleanupComponents(spec);

  return spec;
}

function writeSpec(outputDir: string, outputName: string, spec: OpenAPISpec): string {
  const outputPath = resolve(outputDir, `${outputName}.json`);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(spec, null, 2) + "\n", "utf-8");
  return outputPath;
}

export function runPipeline(
  config: ClientConfig,
  configDir: string,
): PipelineResult[] {
  const specsDir = resolve(configDir, config.specsDir);
  const outputDir = resolve(configDir, config.outputDir);
  const results: PipelineResult[] = [];

  for (const entry of config.specs) {
    const original = loadSpec(specsDir, entry.source);

    if (entry.split && entry.split.length > 0) {
      const splitSpecs = splitByPrefix(original, entry.split);

      for (const [outputName, subSpec] of splitSpecs) {
        const splitEntry = entry.split.find((s) => s.outputName === outputName);
        if (splitEntry?.title) {
          subSpec.info.title = splitEntry.title;
        }
        applyTransforms(subSpec, entry, config.defaults);

        const outputPath = writeSpec(outputDir, outputName, subSpec);
        results.push({
          outputPath,
          title: subSpec.info.title,
          pathCount: Object.keys(subSpec.paths).length,
        });
      }
    } else {
      const spec = deepClone(original);

      if (entry.title) {
        spec.info.title = entry.title;
      }

      applyTransforms(spec, entry, config.defaults);

      const outputName =
        entry.outputName ??
        entry.source.replace(/\.json$/i, "").replace(/\s+/g, "-").toLowerCase();

      const outputPath = writeSpec(outputDir, outputName, spec);
      results.push({
        outputPath,
        title: spec.info.title,
        pathCount: Object.keys(spec.paths).length,
      });
    }
  }

  return results;
}
