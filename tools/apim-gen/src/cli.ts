#!/usr/bin/env node

import { Command } from "commander";
import { resolve, dirname } from "node:path";
import { loadConfig } from "./config.js";
import { runPipeline } from "./pipeline.js";

const program = new Command();

program
  .name("apim-gen")
  .description(
    "Generate Azure APIM-compatible OpenAPI specs from VTEX originals",
  )
  .version("1.0.0");

program
  .command("generate")
  .description("Generate transformed OpenAPI specs from a client config")
  .argument("<config>", "Path to the client config YAML file")
  .option("--dry-run", "Show what would be generated without writing files")
  .action((configPath: string, options: { dryRun?: boolean }) => {
    const resolvedPath = resolve(configPath);
    const configDir = dirname(resolvedPath);

    const config = loadConfig(resolvedPath);
    console.log(`Generating specs for client: ${config.client}`);

    if (options.dryRun) {
      console.log(`  Specs dir: ${resolve(configDir, config.specsDir)}`);
      console.log(`  Output dir: ${resolve(configDir, config.outputDir)}`);
      console.log(`  Specs to process: ${config.specs.length}`);
      for (const entry of config.specs) {
        if (entry.split) {
          for (const s of entry.split) {
            console.log(`    ${entry.source} → ${s.outputName}.json (split: ${s.prefix})`);
          }
        } else {
          const out = entry.outputName ?? entry.source.replace(/\.json$/i, "");
          console.log(`    ${entry.source} → ${out}.json`);
        }
      }
      return;
    }

    const results = runPipeline(config, configDir);

    console.log(`\nGenerated ${results.length} spec(s):\n`);
    for (const r of results) {
      console.log(`  ✓ ${r.title}`);
      console.log(`    ${r.outputPath} (${r.pathCount} paths)`);
    }
  });

program.parse();
