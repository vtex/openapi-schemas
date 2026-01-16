# Agent Review Setup Instructions

Review existing OpenAPI documentation against current source code using the `/review-openapi` Cursor Command.

## What This Does

Compares existing OpenAPI documentation with current code to identify:

- Missing or new endpoints
- Outdated parameters or models
- Changed response structures
- Incomplete or incorrect descriptions
- Missing examples

Then generates:

- Detailed review report with all findings
- Updated OpenAPI 3.0 schema with corrections applied
- List of analyzed source files

## Files Used

### Command

- `.cursor/commands/review-openapi.md` - Executable instructions

### Rules (Applied Automatically)

- `.cursor/rules/project-structure.mdc` - Project organization
- `.cursor/rules/openapi-standards.mdc` - VTEX OpenAPI standards
- `.cursor/rules/api-patterns.mdc` - Code pattern recognition

### Configuration

- `config.json` - Central configuration with public VTEX APIs
  - `codebases[]` - Maps source repos to OpenAPI schema files
  - `templates` - OpenAPI template and overview template paths
  - `examples[]` - Reference documentation
  - `output.review-openapi-output` - Output path templates

## Prerequisites

1. **Cursor IDE** with the repository open
2. **Configuration**: `config.json` is pre-configured with VTEX APIs
3. **Source Code**: The command will automatically clone source repositories if needed

## Execution

### Review All APIs

By default, the command reviews **all codebases** in `config.json` that have a `name` value:

```
/review-openapi
```

The command will:

1. Read `config.json`
2. For each codebase with a non-empty `name`:
   - Clone source repo if needed
   - Load existing OpenAPI from the root directory
   - Analyze current code state
   - Compare and identify gaps
   - Generate review report
   - Create updated schema

> ℹ️ This processes all ~49 configured VTEX APIs. For faster execution, use selective review below.

### Review Specific APIs

You can limit review to specific APIs by passing codebase names as parameters.

**Single codebase:**

```
/review-openapi vcs.sku-binding
```

**Multiple codebases (comma-separated, with or without spaces):**

```
/review-openapi vcs.sku-binding, organization-units
```

```
/review-openapi session, audience-manager, license-manager
```

```
/review-openapi vcs.sku-binding,organization-units,session
```

> ℹ️ Codebase names must exactly match the `name` field in `config.json`. Only codebases with non-empty `name` values can be reviewed.

## Output Structure

Files are saved in: `reviewed-docs/{yyyy-mm-dd}-{model_name}-Cursor/{codebase_name}/`

Example for `session` API on 2025-10-07 using Claude-4-Sonnet:

```
reviewed-docs/2025-10-07-Claude-4-Sonnet-Cursor/session/
├── session-documentation-review.md   # Detailed review report
├── session-openapi.json              # Updated schema with fixes
└── session-api-code-files.json       # List of analyzed source files
```

## Review Report Structure

The markdown report organizes findings by change type:

- **Added Endpoints** - New APIs found in code
- **Updated Endpoints** - Changed behavior or parameters
- **Changed Parameters** - Type or requirement changes
- **Removed Endpoints** - APIs no longer in code
- **Improved Descriptions** - Better clarity or completeness

Each entry includes:

- Code location (file:line)
- Original vs. updated values
- Reason for change

## Notes

- **Automatic Updates**: The updated schema has all review findings applied
- **Version Bumping**: Schema version numbers are updated appropriately
- **Empty Names Skipped**: APIs with empty `name` fields in `config.json` are skipped
