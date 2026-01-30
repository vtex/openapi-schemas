# Agent Batched Generation Setup Instructions (experimental)

Generate comprehensive OpenAPI 3.0 documentation from source code using the `/generate-openapi-batched` Cursor Command. This command is similar to `/generate-openapi`, but should be used with large codebases with agents in MAX mode.

The key difference in how the batched command works is that it divides the work into independent batches and merges the pieces in a final OpenAPI file. Since there is a lot more work to analyze the code and document the endpoints with all the data (parameters, descriptions, request/response bodies), this command should take several minutes to complete.

> ⚠️ This command is experimental. Some issues might occur, including:
>
> - Execution will not complete automatically. The agent might ask to choose on a list of possible approaches to execute the task. E.g., process all endpoints systematically or focus on the most relevant ones.
> - The generated OpenAPI file might be missing information, such as missing endpoints or parameters, missing or incomplete `info.description`, and empty/irrelevant request/response bodies. Always verify the generated schema.
> - The agent might think the task is too complex and take shortcuts, such as:
>   - Find another schema from the same codebase and use it as a base for the generation instead of only the code analysis.
>   - Generate a barebone schema and a plan to manually document the endpoints.

## What This Does

Analyzes API source code repositories and creates:

- Complete OpenAPI 3.0 JSON schemas
- Embedded markdown overviews in `info.description`
- Lists of analyzed source files

## Files Used

### Command

- `.cursor/commands/generate-openapi-batched.md` - Executable instructions

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
2. **Configuration**: `config.json` is pre-configured with VTEX APIs
3. **Repository Access**: The command will automatically clone repositories from GitHub

## Execution

Since this command is designed to run with large codebases, the recommendation is to use it for one codebase at a time.

1. In `config.json`, check if the desired codebase is properly configured. If not, add it.
2. Open a new chat in the Cursor AI panel.
3. Select Agent mode.
4. Choose the desired model (recommendation: `claude-4.5-sonnet`)
5. Switch to MAX mode to increase the token limit to 1 million.
6. Execute the command with the codebase name. Example:

    ```
    /generate-openapi-batched orders
    ```

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
