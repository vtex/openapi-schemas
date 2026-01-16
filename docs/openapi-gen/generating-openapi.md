# Agent Generation Setup Instructions

Generate comprehensive OpenAPI 3.0 documentation from source code using the `/generate-openapi` Cursor Command.

## What This Does

Analyzes API source code repositories and creates:

- Complete OpenAPI 3.0 JSON schemas
- Embedded markdown overviews in `info.description`
- Lists of analyzed source files

## Files Used

### Command

- `.cursor/commands/generate-openapi.md` - Executable instructions

### Rules (Applied Automatically)

- `.cursor/rules/project-structure.mdc` - Project organization
- `.cursor/rules/openapi-standards.mdc` - VTEX OpenAPI standards
- `.cursor/rules/api-patterns.mdc` - Code pattern recognition

### Configuration

- `config.json` - Central configuration with public VTEX APIs
  - `codebases[]` - Array of APIs to document (only those with `name` filled)
  - `templates` - OpenAPI template and overview template paths
  - `examples[]` - Reference documentation
  - `output.generate-openapi-output` - Output path templates

## Prerequisites

1. **Cursor IDE** with the repository open
2. **Configuration**: `config.json` is pre-configured with 49 VTEX APIs
3. **Repository Access**: The command will automatically clone repositories from GitHub

## Execution

### Generate All APIs

By default, the command processes **all codebases** in `config.json` that have a `name` value:

```
/generate-openapi
```

The command will:

1. Read `config.json`
2. For each codebase with a non-empty `name`:
   - Clone from `https://github.com/vtex/{codebase_name}.git` into `api-repos/`
   - Analyze API code files
   - Generate OpenAPI schema with embedded overview
   - Save outputs in timestamped directory

> ℹ️ This processes all ~49 configured VTEX APIs. For faster execution, use selective generation below.

### Generate Specific APIs

You can limit generation to specific APIs by passing codebase names as parameters.

**Single API:**
```
/generate-openapi vcs.sku-binding
```

**Multiple APIs (comma-separated):**
```
/generate-openapi b2b-bulk-import, audience-manager
```

### Multi-Repository APIs

Some APIs are documented from multiple source repositories. The command automatically handles this:

**Example: VTEX Ads API**
- Uses both `newtail-retail-media-api` (campaign management) and `newtail-retail-media-adserver-api` (ad serving)
- Both repositories are cloned and analyzed together
- Single unified OpenAPI schema is generated combining endpoints from both
- Configuration in `config.json`:
  ```json
  {
    "repo": [
      {
        "organization": "vtex",
        "codebase_name": "newtail-retail-media-api"
      },
      {
        "organization": "vtex",
        "codebase_name": "newtail-retail-media-adserver-api"
      }
    ],
    "documentation": "VTEX - Ads API.json"
  }
  ```

> ℹ️ Codebase names must exactly match the `name` field in `config.json`. Only codebases with non-empty `name` values can be generated.

## Output Structure

Files are saved in: `generated-docs/{yyyy-mm-dd}-{model_name}-Cursor/{codebase_name}/`

Example for `session` API on 2025-10-07 using Claude-4-Sonnet:

```
generated-docs/2025-10-07-Claude-4-Sonnet-Cursor/session/
├── session-api-code-files.json       # List of analyzed source files
└── session-openapi.json              # OpenAPI 3.0 schema with embedded overview
```

## Notes

- **Automatic Cloning**: The command clones repositories automatically if they don't exist
- **Single Backslash Escaping**: Markdown in `info.description` uses `\n`, not `\\n`
- **No Separate Markdown File**: Overview is embedded in the JSON, not saved separately
- **Empty Names Skipped**: APIs in `config.json` with empty `name` fields are automatically skipped (no source code available)
