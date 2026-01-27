# Agent Batched Review Setup Instructions (experimental)

Review existing OpenAPI documentation against current source code using the `/review-openapi-batched` Cursor Command. This command is similar to `/review-openapi`, but should be used with large codebases with agents in MAX mode.

The key differences in how the batched command works are: it divides the work into independent batches and merges the pieces in a final OpenAPI file, and it uses a Python script to merge the OpenAPI batches in the final schema. Since there is a lot more work to analyze the code and document the endpoints with all the data (parameters, descriptions, request/response bodies), this command should take several minutes to complete.

> ⚠️ This command is experimental. Some issues might occur, including:
>
> - Execution will not complete automatically. The agent might ask to choose on a list of possible approaches to execute the task. E.g., process all endpoints systematically or focus on the most relevant ones.
> - The generated OpenAPI file might be missing information, such as missing endpoints or parameters, missing or incomplete `info.description`, and empty/irrelevant request/response bodies. Always verify the generated schema.
> - The agent might think the task is too complex and take shortcuts, such as generating a barebone/simplified schema and a plan to manually document the endpoints.

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

- `.cursor/commands/review-openapi-batched.md` - Executable instructions

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

### Simple Usage

Since this command is designed to run with large codebases, the recommendation is to use it for one codebase at a time.

1. In `config.json`, check if the desired codebase is properly configured. If not, add it.
2. Open a new chat in the Cursor AI panel.
3. Select Agent mode.
4. Choose the desired model (recommendation: `claude-4.5-sonnet`)
5. Switch to MAX mode to increase the token limit to 1 million.
6. Execute the command with the codebase name. Example:

    ```
    /review-openapi-batched orders
    ```

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
