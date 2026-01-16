# Review API Documentation

Compare existing OpenAPI documentation with source code, identify gaps, and generate updated version. After generating the updated OpenAPI schema, Prism validation will run automatically to validate the schema and test all endpoints.

## Steps

1. **Load Configuration**
   - Read: `config.json`
   - Replace `{{model_name}}` with your model name (e.g., "Claude-4-Sonnet")
   - Replace `{{yyyy-mm-dd}}` with current date

2. **For Each Codebase in `codebases[]` Array**

   **Clone/Update Source Repository:**
   - Skip entries where `name` is empty (no source code available)
   - Check if `api-repos/{{codebase_name}}` exists
   - If not, run: `git clone "https://github.com/{{organization}}/{{codebase_name}}.git" api-repos/{{codebase_name}}`

   **Discover API Files:**
   - Scan `api-repos/{{codebase_name}}` directory
   - Identify: controllers, routes, models, DTOs
   - Save file list to: `output.review-openapi-output.api-code-files`

   **Extract Current API State:**
   - HTTP methods and endpoints
   - Request/response models
   - Parameters and types
   - Authentication requirements
   - Status codes

   **Load Existing Documentation:**
   - Read current OpenAPI from: `{{codebases[].documentation}}`
   - Example: `VTEX - Session Manager API.json`

   **Compare and Identify Gaps:**
   - Missing endpoints
   - Outdated parameters
   - Changed response structures
   - Incomplete descriptions
   - Missing examples
   - Incorrect types or formats

3. **Generate Review Report**

   Save to: `output.review-openapi-output.documentation-review`

   Structure:
   ```markdown
   ## Added Endpoints
   - Endpoint: [path], Method: [method]
   - Code: [file:line]
   - Reason: [explanation]

   ## Updated Endpoints
   - Endpoint: [path]
   - Published: [current state]
   - Updated: [new state]
   - Reason: [code change]

   ## Changed Parameters
   - Endpoint: [path], Parameter: [name]
   - Change: [old → new]
   - Reason: [explanation]

   ## Removed Endpoints
   - Endpoint: [path]
   - Reason: [no longer in code]

   ## Improved Descriptions
   - Location: [endpoint/model]
   - Current: [text]
   - Proposed: [improved text]
   - Reason: [why better]
   ```

4. **Generate Updated Schema**
   - Apply all changes from review
   - Create complete OpenAPI 3.0 schemas
   - Save to: `output.review-openapi-output.openapi_filename`
   - Must be valid OpenAPI 3.0 JSON

5. **Quality Checks**
   - All code endpoints documented
   - No outdated information
   - All changes explained in review
   - Descriptions improved
   - Examples are current

6. **Run Prism Validation (Automatic)**
   - **Automatically execute** Prism validation immediately after generating and saving the updated OpenAPI schema
   - **Invoke the Prism validation command** with the updated OpenAPI file path:
     ```
     /run-prism-validation {updated-openapi-file-path}
     ```
   - Replace `{updated-openapi-file-path}` with the actual path to the updated OpenAPI file from `output.review-openapi-output.openapi_filename`
   - **Example**: If the updated file is `reviewed-docs/2025-12-02-Claude-4-Sonnet-Cursor/audience-manager/audience-manager-openapi.json`, automatically run:
     ```
     /run-prism-validation reviewed-docs/2025-12-02-Claude-4-Sonnet-Cursor/audience-manager/audience-manager-openapi.json
     ```
   - The Prism validation will:
     1. Start Prism mock server with the updated OpenAPI spec
     2. Test all endpoints systematically with correct `Prefer` headers based on response codes
     3. Generate a validation report in `tests/prism/[prefix] {api-name} - {date}.md`. If the folder `tests/prism` doesn't exist, create it.
     4. Identify any schema issues, missing response codes, or validation errors
   - **Report prefix naming convention:**
     - **`[Dev Portal]`** - For schemas reviewed from the published repository (the source schema being reviewed comes from the root directory with published OpenAPI files)
     - **`[AI generated]`** - For schemas generated from code using `/generate-openapi` command (in `generated-docs/`)
     - **Note**: The `/review-openapi` command always uses `[Dev Portal]` prefix because it reviews existing published schemas from the repository
   - **Report path:** `tests/prism/[Dev Portal] {api-name} - {date}.md`
     - **Prefix**: Always use `[Dev Portal]` for `/review-openapi` command because it reviews published schemas from `openapi-schemas` repository
     - `{api-name}`: Use the codebase_name (e.g., "authenticator", "session") or the API name from the documentation filename (e.g., "Punchout API", "Session Manager API")
     - `{date}`: Date in YYYY-MM-DD format (use `Get-Date -Format "yyyy-MM-dd"` - never hardcode dates)
   - **Required**: This step is mandatory and ensures the updated OpenAPI spec is testable and properly structured
   - **Note**: If Prism validation reveals issues, review the validation report and fix the OpenAPI spec. The validation report will be saved automatically.

6. **Spectral Checks**
   - Read: `.spectral.yml`
   - Run `/spectral {openapi_filename}.json` against the generated OpenAPI using the rules defined in `.spectral.yml`
   - Log each correction along with the line numbers that changed in a report

7. **Spectral Correction**
   - Fix every Spectral violation in the schema
   - Re-run Spectral and repeat until the OpenAPI file passes without errors

## Output Files

Per `output.review-openapi-output`:

- `{{directory}}/{{codebase_name}}-documentation-review.md` - Review report
- `{{directory}}/{{codebase_name}}-openapi.json` - Updated schema
- `{{directory}}/{{codebase_name}}-api-code-files.json` - Code files analyzed

Example paths:

- `reviewed-docs/2025-10-07-Claude-4-Sonnet-Cursor/session/session-documentation-review.md`
- `reviewed-docs/2025-10-07-Claude-4-Sonnet-Cursor/session/session-openapi.json`
- `reviewed-docs/2025-10-07-Claude-4-Sonnet-Cursor/session/session-api-code-files.json`

**After Prism validation runs automatically**, an additional file will be created:

- `tests/prism/[Dev Portal] {api-name} - {date}.md` - Prism validation report with test results for all endpoints

**Prefix naming convention for `/review-openapi`:**
- **Always `[Dev Portal]`** - The `/review-openapi` command reviews published schemas from `openapi-schemas` repository, so it always uses `[Dev Portal]` prefix

Example paths:

- `tests/prism/[Dev Portal] Punchout API - 2025-12-08.md` (reviewed from openapi-schemas)
- `tests/prism/[Dev Portal] Session Manager API - 2025-11-24.md` (from openapi-schemas)

## Error Handling

If errors occur during review:

- **Repository clone fails**: Skip the codebase and continue with next entry
- **No API files found**: Log warning and skip review for that codebase
- **Published schema not found**: Generate new schema from code (treat as new API)
- **Invalid OpenAPI generated**: Review schema structure and fix before proceeding
- **Prism validation fails**: Review validation report (automatically generated in `tests/prism/`) and fix issues in OpenAPI spec before considering the review complete
