# Generate API Documentation

Generate comprehensive OpenAPI 3.0 documentation from source code.

## What You'll Do

Analyze code repositories and create OpenAPI schemas with complete endpoint documentation. After generating the OpenAPI schema, Prism validation will run automatically to validate the schema and test all endpoints.

## Steps

1. **Load Configuration**
   - Read: `config.json`
   - Use `codebase_root` template: `https://github.com/{{organization}}/{{codebase_name}}.git`
   - Replace `{{model_name}}` with your model name (e.g., "Claude-4-Sonnet")
   - Replace `{{yyyy-mm-dd}}` with **current date from system context** (check `user_info.Current Date`)

2. **For Each Codebase in `codebases[]` Array**

   **Clone Repository:**
   - Skip entries where `name` is empty (no source code available)
   - Check if `api-repos/{{codebase_name}}` already exists
   - If not, run: `git clone "https://github.com/{{organization}}/{{codebase_name}}.git" api-repos/{{codebase_name}}`
   - If exists, optionally run: `git pull` to update to latest

   **Determine Codebase Structure:**
   - Check if `repo` is an object (single repository) or array (multi-repository)
   - **Single repository**: `repo` is an object with `organization` and `codebase_name`
   - **Multi-repository**: `repo` is an array of objects, each with `organization` and `codebase_name`
   - **Skip if**: All `codebase_name` values are empty strings (no source code available)

   **Derive Variables:**
   - `{{codebase_name}}`: 
     - Single repo: Use `repo.codebase_name`
     - Multi-repo: Derive from `documentation` filename (remove "VTEX - " prefix and ".json" suffix, convert to lowercase with hyphens)
     - Example: "VTEX - Ads API.json" → "ads-api"
   - `{{organization}}`: 
     - Single repo: Use `repo.organization`
     - Multi-repo: Use first repo's `organization` (typically all repos share same org)

   **Discover API Files:**
   - **Single repository**: Scan `api-repos/{{codebase_name}}` directory
   - **Multi-repository**: Scan all `api-repos/{{repo.codebase_name}}` directories
   - Identify: controllers, routes, models, DTOs
   - Save file list to: `output.generate-openapi-output.api-code-files`
   - Include all files from all repositories (for multi-repo APIs)

   **Extract API Data:**
   - HTTP methods and endpoints
   - Request/response models
   - Parameters (path, query, header, body)
   - **Authentication requirements** (analyze from code):
      - Controller/method attributes (`[VtexAuthorize]`, `[Authorize]`, `[AllowAnonymous]`)
      - Middleware configurations
      - Header validation logic
      - Security filters or interceptors
      - Per-endpoint security overrides
   - Status codes and errors

   **Generate OpenAPI Schema:**
   - Create schemas for all models
   - Follow template: `templates.openapi_template`
   - **IMPORTANT**: Use single backslash for escaping (e.g., `\n`, `\r\n`) not double backslashes (`\\n`)
   - **Security schemes**: Generate based on discovered authentication:
      - If `[VtexAuthorize]` found → Use standard VTEX schemes (appKey/appToken + VtexIdclientAutCookie)
      - If `[Authorize]` found → Check for bearer/JWT/basic auth
      - If `[AllowAnonymous]` on specific endpoints → Set `"security": []` for those endpoints only
      - If no auth attributes → Analyze middleware and configuration
      - Include only schemes actually used by the API
   - Save to: `output.generate-openapi-output.openapi_filename`
   - Target documentation: `codebases[].documentation` (reference filename from openapi-schemas repo for comparison, if available)
   - **Validate**: Must be valid OpenAPI 3.0 JSON
   - **Do NOT create a separate markdown overview file**

   **Generate markdown overview of the OpenAPI Schema:**
   - Generate escaped markdown overview in `info.description` of the generated OpenAPI schema file `output.generate-openapi-output.openapi_filename`
   - Generate the overview only after `paths` is ready with all the endpoints
   - Use the `templates.api_overview_template` as a structure reference
   
   **Build the Index section:**
   - Iterate through ALL paths in the `paths` object
   - For each path in `paths`:
     - Extract: HTTP method(s), path, summary, tags
     - Add to Index under appropriate category/tag
   
   **Index Entry Format:**
   - Template: `\r\n- ``{METHOD}``[Summary](https://developers.vtex.com/docs/api-reference/{API_NAME_LOWERCASE}#{METHOD_LOWERCASE}-{ENDPOINT_PATH})`
   - Note: The double backticks ``{METHOD}`` are literal markdown formatting characters that will appear in the output
   - Variables:
     - `{METHOD}`: HTTP method in uppercase (GET, POST, PUT, PATCH, DELETE)
     - `{API_NAME_LOWERCASE}`: Derived from `documentation` filename (remove "VTEX - " prefix and ".json" suffix, convert to lowercase, replace spaces with hyphens)
       - Example: "VTEX - Session Manager API.json" → "session-manager-api"
       - **Important**: The `{API_NAME_LOWERCASE}` already includes the "-api" suffix, so do NOT add "-api" again in the template
     - `{METHOD_LOWERCASE}`: HTTP method in lowercase (get, post, put, patch, delete)
     - `{ENDPOINT_PATH}`: Full endpoint path with path parameters replaced:
       - Replace `{` with `-`
       - Replace `}` with `-`
       - Example: `/api/sessions/{token}` → `/api/sessions/-token-`
   - **Important**: Use only the summary, not the full description
   - **Examples**:
     - GET endpoint: `\r\n- ``GET`` [Get session](https://developers.vtex.com/docs/api-reference/session-manager-api#get-/api/sessions/-token-)`
     - POST endpoint: `\r\n- ``POST`` [Create order modifications](https://developers.vtex.com/docs/api-reference/orders-api#post-/api/order-system/orders/-changeOrderId-/changes)`
     - PATCH endpoint: `\r\n- ``PATCH`` [Update session](https://developers.vtex.com/docs/api-reference/session-manager-api#patch-/api/sessions/-token-)`
   
   **Complete Overview Structure:**
   - Group Index entries by tags/categories
   - Include ALL endpoints found in `paths` section - DO NOT add hypothetical or missing endpoints
   - Use escaped markdown format (single backslash: `\n`, `\r\n`)
   - Create complete `info.description` with:
     - API title and overview
     - Key features and use cases
     - Authentication explanation
     - **Complete and accurate Index** (derived from actual paths)
     - Common parameters table
     - Best practices

3. **Quality Checks**
   - All endpoints documented
   - Cross-check manifest: verify all controllers processed
   - Count paths in Index: must match count in `paths` section
   - Verify: every path in `paths` section appears in Index
   - Verify: every endpoint in Index exists in `paths` section
   - Validate: complete OpenAPI 3.0 schema compliance
   - Check: all `$ref` references resolve correctly
   - No duplicate operationIds
   - All models have complete schemas
   - Descriptions are clear and complete
   - Examples are realistic
   - Valid JSON syntax
   - **Do NOT create a generation summary document or any additional markdown files**

4. **Spectral Checks**
   - Read: `.spectral.yml`
   - Run `/spectral {openapi_filename}.json` against the generated OpenAPI using the rules defined in `.spectral.yml`
   - Log each correction along with the line numbers that changed in a report

5. **Spectral Correction**
   - Fix every Spectral violation in the schema
   - Re-run Spectral and repeat until the OpenAPI file passes without errors

## Reference Examples

- Check `examples[]` array for reference documentation
- Example files: `examples[].openapi` and `examples[].overview`
- Follow VTEX OpenAPI standards (see project rules)

## Output Files

Per `output.generate-openapi-output`:

- `{{directory}}/{{codebase_name}}-api-code-files.json` - List of analyzed source files
- `{{directory}}/{{codebase_name}}-openapi.json` - OpenAPI 3.0 schema with embedded overview

**Template Variables:**
- `{{directory}}`: `generated-docs/{{yyyy-mm-dd}}-{{model_name}}-Cursor/{{codebase_name}}`
- `{{codebase_name}}`: 
  - Single repo: `repo.codebase_name` from config
  - Multi-repo: Derived from `documentation` filename (e.g., "VTEX - Ads API.json" → "ads-api")

**Example paths (single repository):**

- `generated-docs/{{yyyy-mm-dd}}-Claude-4-Sonnet-Cursor/session/session-api-code-files.json`
- `generated-docs/{{yyyy-mm-dd}}-Claude-4-Sonnet-Cursor/session/session-openapi.json`

**Example paths (multi-repository):**

- `generated-docs/{{yyyy-mm-dd}}-Claude-4-Sonnet-Cursor/ads-api/ads-api-api-code-files.json`
  - Note: The double "api" in the filename is expected when `codebase_name` is "ads-api" (derived from "VTEX - Ads API.json")
- `generated-docs/{{yyyy-mm-dd}}-Claude-4-Sonnet-Cursor/ads-api/ads-api-openapi.json`

> **Important**: Replace `{{yyyy-mm-dd}}` with the **current date** from system context. Never hardcode dates.

**After Prism validation runs automatically**, an additional file will be created:

- `tests/prism/[prefix] {api-name} - {date}.md` - Prism validation report with test results for all endpoints
  - **Prefix**: 
    - Use `[Dev Portal]` if the API has a corresponding published schema in `openapi-schemas` (indicated by `codebases[].documentation` field in config.json)
    - Use `[AI generated]` if the API does NOT have a corresponding published schema (no `documentation` field or empty `documentation` field)
  - `{api-name}`: Use the codebase_name (e.g., "session", "ads-api") or the API name from the documentation filename (e.g., "Session Manager API", "Ads API")
  - `{date}`: Date in YYYY-MM-DD format (use `Get-Date -Format "yyyy-MM-dd"` - never hardcode dates)

Example paths:

- `tests/prism/[Dev Portal] Session Manager API - {{yyyy-mm-dd}}.md` (API with published schema in openapi-schemas)
- `tests/prism/[AI generated] new-api - {{yyyy-mm-dd}}.md` (new API without published schema)

## Error Handling

If errors occur during generation:

- **Repository clone fails**: Skip the codebase and continue with next entry
- **No API files found**: Log warning and skip OpenAPI generation for that codebase
- **Invalid OpenAPI generated**: Review schema structure and fix before proceeding
- **Prism validation fails**: Review validation report (automatically generated in `tests/prism/`) and fix issues in OpenAPI spec before considering the generation complete
