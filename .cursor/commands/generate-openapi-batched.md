# Generate API Documentation

Generate comprehensive OpenAPI 3.0 documentation from source code with intelligent batch processing for large codebases.

## What You'll Do

Analyze code repositories and create OpenAPI schemas with complete endpoint documentation including all parameters, request bodies, and response schemas. Automatically handles large codebases using batch processing to manage context efficiently.

## Automated Execution

This command runs fully automated without user interaction. All decisions are made automatically based on codebase analysis.

## Steps

1. **Load Configuration**
   - Read: `config.json`
   - Use `codebase_root` template: `https://github.com/{{organization}}/{{codebase_name}}.git`
   - Replace `{{model_name}}` with your model name (e.g., "Claude-4-Sonnet")
   - Replace `{{yyyy-mm-dd}}` with current date

2. **For Each Codebase in `codebases[]` Array**

   ### Phase 1: Repository Setup

   **Clone Repository:**
   - Skip entries where `repo` is empty (no source code available)
   - **IF `repo` is an array**: Clone all repositories in the array
     - Example: `["newtail-retail-media-api", "newtail-retail-media-adserver-api"]`
     - Clone each to: `api-repos/{{individual_codebase_name}}`
   - **IF repository already exists**: Run `git pull` to update (automatic, no prompt)
   - **IF repository doesn't exist**: Run `git clone "https://github.com/vtex/{{codebase_name}}.git" api-repos/{{codebase_name}}`

   ### Phase 2: Discovery & Analysis

   **Discover API Files:**
   - Scan all `api-repos/{{codebase_name}}` directories (handle multiple if `repo` is array)
   - Identify: controllers, routes, models, DTOs, services
   - Categorize by module/domain
   - Count total controllers/routes discovered

   **Save API Code Files Inventory:**
   - Save complete file list to: `output.generate-openapi-output.api-code-files`
   - Include: repository structure, controller groupings, DTO/model locations, estimated endpoint count
   - Format:

     ```json
     {
       "repositories": [
         {
           "name": "orders",
           "type": ".NET C# API",
           "controllers": ["OrdersController.cs", "..."],
           "models": ["Models/", "DTOs/"],
           "total_controllers": 13
         }
       ],
       "summary": {
         "total_controllers_and_routes": 13,
         "processing_mode": "batch",
         "api_categories": ["Order Management", "Invoice Management", "..."]
       }
     }
     ```

   ### Phase 3: Processing

   **Step 1: Create Processing Plan**
   - Group controllers by module/domain/directory
   - Target batch size: **3-5 controllers per batch** (keep small to maintain detail quality)
   - **IMPORTANT**: If more than 5 controllers, always use batches. Don't use single pass.
   - Order batches by complexity/size: larger controllers first
   - Create manifest:

     ```json
     {
       "codebase": "orders",
       "total_controllers": 13,
       "total_batches": 3,
       "batch_size": "3-5 controllers per batch",
       "batches": [
         {
           "batch_id": 1,
           "name": "Core Order Management",
           "controllers": ["OrdersController.cs", "OmsLegacyController.cs", "CustomerController.cs"],
           "estimated_endpoints": 53
         }
       ]
     }
     ```

   - Save to: `{{directory}}/{{codebase_name}}-batch-manifest.json`
   - **Report**: "Codebase has 13 controllers. Using batch mode with 3 batches (3-5 controllers each). Processing automatically..."

   **Step 2: Initialize Base OpenAPI Structure**
   - Create base structure with: `openapi`, `servers`, `security`, `tags`, empty `paths: {}`, empty `components: { schemas: {}, parameters: {} }`
   - **DO NOT create info.description yet** (will generate after all paths are processed)
   - Save as: `{{directory}}/{{codebase_name}}-openapi-in-progress.json`

   **Step 3: Process Each Batch Automatically (WITH COMPLETE DETAIL EXTRACTION)**

   **FOR EACH batch in manifest (NO USER INTERACTION):**

   a. **Announce Progress**
      - Report: "Processing Batch X/Y: [Batch Name] (Z controllers, ~W estimated endpoints)"

   b. **Process Controllers in Batch - COMPLETE EXTRACTION (CRITICAL)**

      **FOR EACH controller in current batch:**

      i. **Read Controller File**
         - Read the ENTIRE controller file
         - Identify ALL endpoints (routes/methods)
         - Extract HTTP method, path, route attributes/decorators
         - Extract summary/description from comments/attributes

      ii. **Extract Parameters for EACH Endpoint (MANDATORY)**

      **Path Parameters:**
         - Identify from route template (e.g., `/orders/{orderId}`)
         - Extract parameter name, type, description
         - Mark as required: true

      **Query Parameters:**
         - Look for query parameter attributes/decorators
         - Check method signatures for query binding
         - Extract: name, type, required, description, default values
         - Include all optional parameters (pagination, filters, flags)

      **Header Parameters:**
         - Authorization headers
         - Content-Type, Accept (reference from components)
         - Custom headers specific to endpoint

      iii. **Extract Request Body for POST/PUT/PATCH (CRITICAL)**
         - **Identify Request DTO/Model:** Look for `[FromBody]`, `@Body()`, request body parameters in method signature
         - **IF Request Body Exists:**
           - Identify the DTO/Model class name
           - **READ THE DTO/MODEL FILE** - do NOT skip this step
           - Extract ALL properties with:
             - Property name
             - Type (string, number, boolean, array, object)
             - Required/optional status
             - Description from comments/attributes
             - Validation rules (min/max, pattern, enum values)
             - Examples/default values
           - Create schema in `components.schemas` for the DTO
           - Reference it in `requestBody.content.application/json.schema`
         - **IF No Request Body:**
           - Verify this is correct (some POST endpoints don't have bodies)
           - Document as no request body needed

      iv. **Extract Response Schemas (COMPLETE)**
         - **For EACH status code response (200, 201, 400, 401, 403, 404, 500):**
           - Identify response DTO/Model
           - **READ THE RESPONSE DTO/MODEL FILE**
           - Extract all properties with full detail
           - Create schema in `components.schemas`
           - Add to responses section with proper content-type

      v. **Generate Complete OpenAPI Path Definition**
         - operationId: unique identifier
         - tags: category/module
         - summary: brief description
         - description: full description with permissions, notes
         - **parameters:** ALL path, query, and header parameters with complete schemas
         - **requestBody:** Complete schema with all properties (if applicable)
         - **responses:** All status codes with complete response schemas

      c. **Save All Schemas to Components**
         - Add ALL extracted DTOs/models to `components.schemas`
         - Include full property definitions
         - Preserve descriptions, examples, validation rules
         - Ensure no `$ref` references to non-existent schemas

   d. **Incremental Save**
      - Read `openapi-in-progress.json`
      - Merge new paths into existing `paths` object
      - Merge new schemas into `components.schemas` (deduplicate by name)
      - Update tags array (deduplicate)
      - Save back to `openapi-in-progress.json`
      - **Validate**: Ensure valid JSON after each save

   e. **Update Manifest**
      - Mark batch as completed
      - Record actual endpoints documented
      - Update progress counters
      - Save manifest

   f. **Progress Report**
      - Report: "✓ Batch X/Y complete. Documented N endpoints with M schemas"
      - Show statistics: paths added, schemas created, parameters documented

   g. **Context Management** (CRITICAL - But Don't Skip Detail Extraction)**
      - After documenting endpoints: clear controller SOURCE CODE from context
      - Retain: endpoint definitions (paths), schemas, manifest
      - Clear: raw file contents, intermediate processing data
      - Monitor token usage: if >85%, perform cleanup
      - **NEVER skip parameter/requestBody extraction to save tokens** - reduce batch size instead

   h. **Checkpoint Validation**
      - Validate JSON syntax of in-progress file
      - Verify all schema references are valid
      - Check for duplicate operationIds
      - **Spot check:** Verify POST/PUT/PATCH endpoints have requestBody (if expected)
      - If errors found: fix before proceeding to next batch

   i. **Continue Automatically**
      - Proceed immediately to next batch
      - **NO USER PROMPTS** - fully automated execution

   **Step 4: Final Assembly (CRITICAL FOR INDEX ACCURACY)**

   a. **Read Complete Paths Section**
      - Read entire `openapi-in-progress.json`
      - Extract ALL paths and their methods from the `paths` section
      - This is the **source of truth** for what endpoints exist

   b. **Generate Accurate Overview with Complete Index**
      - Use `templates.api_overview_template` as a guide
      - **CRITICAL**: Build the Index section by iterating through ALL paths in the `paths` object
      - For each path in `paths`:
        - Extract: HTTP method(s), path, summary, tags
        - Add to Index under appropriate category/tag
      - Format Index entries: `\r\n- ``{METHOD}``[Summary](https://developers.vtex.com/docs/api-reference/{API_NAME_LOWERCASE}-api#{METHOD_LOWERCASE}-{ENDPOINT_PATH})`. In `{ENDPOINT_PATH}`, replace `{` and `}` for `-`. Don't include the endpoint description, only the summary.
        - Example: `\r\n- ``POST`` [Create order modifications](https://developers.vtex.com/docs/api-reference/orders-api#/post-/api/order-system/orders/-changeOrderId-/changes)`.
      - Group by tags/categories
      - Include ALL endpoints found in `paths` section - DO NOT add hypothetical or missing endpoints
      - Use escaped markdown format (single backslash: `\n`, `\r\n`)
      - Create complete `info.description` with:
        - API title and overview
        - Key features and use cases
        - Authentication explanation
        - **Complete and accurate Index** (derived from actual paths)
        - Common parameters table
        - Best practices

   c. **Update Info Section**
      - Read `openapi-in-progress.json`
      - Update `info.description` with the generated overview
      - Ensure `info.version`, `info.title`, `info.contact` are set
      - Save back to file

   d. **Final Validation**
      - Cross-check manifest: verify all controllers processed
      - Count paths in Index: must match count in `paths` section
      - Verify: every path in `paths` section appears in Index
      - Verify: every endpoint in Index exists in `paths` section
      - **Parameter completeness check:**
        - POST/PUT/PATCH endpoints have requestBody (unless documented as body-less)
        - All path parameters from route are documented
        - Common query parameters are not missing
      - Validate: complete OpenAPI 3.0 schema compliance
      - Check: all $ref references resolve correctly
      - No duplicate operationIds

   e. **Save Final Schema**
      - Rename: `openapi-in-progress.json` → `{{codebase_name}}-openapi.json`
      - Save to: `output.generate-openapi-output.openapi_filename`

   f. **Cleanup**
      - Remove: `{{codebase_name}}-batch-manifest.json`
      - Keep: `{{codebase_name}}-api-code-files.json` (for reference)

   g. **Success Report**
      - Report: "✓ Complete! Generated OpenAPI schema with X endpoints from Y controllers"
      - List statistics: total paths, total HTTP operations, total schemas, total parameters documented

   ### Phase 4: Schema Generation

   **Generate Complete OpenAPI Schema:**
   - **CRITICAL**: Generate ONLY from source code analysis - DO NOT read or reference existing OpenAPI files
   - **DO NOT** read files from the root directory (published OpenAPI schemas) and `tests/` directory for this API
   - **DO NOT** use `codebases[].documentation` filename to find existing OpenAPI files
   - The `codebases[].documentation` value is ONLY for naming the output file
   - Start completely fresh - analyze source code as if no documentation exists
   - Follow template: `templates.openapi_template` (for structure/format only, not content)
   - **Structure Requirements**:
     - `info.version`: API version (e.g., "1.0.0")
     - `info.title`: API name
     - `info.description`: **Escaped markdown with complete API overview and ACCURATE Index built from actual paths**
     - `servers`: VTEX server configuration with variables
     - `security`: Include both AppKey/AppToken and VtexIdclientAutCookie
     - `paths`: ALL endpoints with complete definitions
     - `components.schemas`: ALL models referenced with complete properties
     - `components.parameters`: Common parameters (Content-Type, Accept)
     - `tags`: All categories with descriptions

   - **CRITICAL RULES**:
     - The `paths` section must include ALL endpoints discovered from controllers
     - The Index in `info.description` must list ONLY endpoints that exist in `paths` section
     - **Every endpoint must have:**
       - summary and description
       - ALL parameters (path, query, header) with complete schemas
       - requestBody with complete schema (if POST/PUT/PATCH and body expected)
       - ALL responses with complete schemas
     - **All schemas must have:**
       - type, properties, descriptions
       - required array listing mandatory fields
       - examples for properties
     - Use single backslash for escaping in JSON strings: `\n`, `\r\n` (not `\\n`)

   - **Completeness Rules (MOST IMPORTANT)**:
     - **DO NOT create placeholder/incomplete requestBody** - extract from actual DTO
     - **DO NOT skip query parameters** - extract from method signature
     - **DO NOT assume empty parameters** - read controller carefully
     - If batch size causes quality issues, reduce batch size, don't skip details

   - **Validation Requirements**:
     - Must be valid JSON syntax
     - Must conform to OpenAPI 3.0 specification
     - All `$ref` references must resolve correctly
     - No duplicate operationIds
     - Index count must match paths count
     - No endpoints with empty parameters when they should have some
     - No POST/PUT/PATCH without requestBody when they should have one

   - **Output**:
     - Save to: `output.generate-openapi-output.openapi_filename`
     - Target documentation: `codebases[].documentation` value
     - **Do NOT create a separate markdown overview file** (it's embedded in `info.description`)

3. **Quality Checks (Post-Generation)**

   **Completeness Validation:**
   - **MANDATORY**: Verify ALL endpoints from ALL controllers are documented in `paths`
   - Count HTTP operations in `paths` section
   - Count endpoint entries in Index
   - **These numbers must match**
   - Verify all controllers from api-code-files.json are represented
   - Check: no "TODO", "...", or placeholder text remains

   **Parameter & RequestBody Validation (NEW - CRITICAL):**
   - **For EACH POST/PUT/PATCH endpoint:**
     - Verify it has requestBody (or explicit note that none is needed)
     - Check requestBody schema is complete (not just `type: object`)
     - Verify all required properties are documented
   - **For ALL endpoints:**
     - Check path parameters match route template
     - Verify query parameters are documented (not just path params)
     - Check header parameters are appropriate
   - **Random spot check:** Pick 5-10 endpoints and verify completeness

   **Index Accuracy Validation:**
   - For each entry in Index: verify corresponding path exists in `paths`
   - For each path in `paths`: verify entry exists in Index
   - No hypothetical or planned endpoints in Index
   - No missing real endpoints from Index

   **Schema Quality:**
   - All models have complete schemas with all properties
   - All properties have descriptions and examples
   - All required fields are marked
   - Appropriate types and formats specified
   - No empty/placeholder schemas

   **Content Quality:**
   - Descriptions are clear, complete, and follow VTEX standards
   - Examples are realistic and valid
   - Authentication documented for all endpoints
   - Error responses included (400, 401, 403, 404, 500)

   **Technical Validation:**
   - Valid JSON syntax (no trailing commas, proper escaping)
   - Valid OpenAPI 3.0 specification
   - All references resolve correctly
   - No circular references

4. **If Documentation is Incomplete**

   **Detection:**
   - If `paths` section has fewer endpoints than discovered in api-code-files.json
   - If Index has different count than `paths` section
   - **If POST/PUT/PATCH endpoints are missing requestBody schemas**
   - **If endpoints have empty parameters arrays when they should have parameters**
   - If any controller groups are missing from tags
   - If validation reports missing schemas or broken references

   **Recovery Process:**
   - Identify incomplete endpoints
   - Report: "Found X incomplete endpoints - missing parameters or request bodies"
   - Re-read the controller files for incomplete endpoints
   - **Re-read the DTO/model files** to extract complete schemas
   - Update endpoints with complete information
   - **Regenerate Index** from complete paths section
   - Re-validate until complete
   - **Do not stop until ALL endpoints are documented completely with all parameters and request bodies**

## Reference Examples

- Check `examples[]` array in config.json for **style reference ONLY**
- Example files: `examples[].openapi` and `examples[].overview`
- **USE EXAMPLES ONLY FOR**: formatting style, structure patterns, markdown syntax
- **DO NOT USE EXAMPLES FOR**: endpoint details, schemas, or actual content
- Follow VTEX OpenAPI standards (see `.cursor/rules/openapi-standards.mdc`)
- **NEVER read root directory (published OpenAPI schemas)** and `tests/` directories - they contain existing documentation
- **NEVER use `codebases[].documentation`** to locate existing OpenAPI files to reference

## Output Files

Per `output.generate-openapi-output` configuration:

**Always Created:**

- `{{directory}}/{{codebase_name}}-api-code-files.json` - Complete inventory of analyzed source files
- `{{directory}}/{{codebase_name}}-openapi.json` - Final OpenAPI 3.0 schema with embedded overview

**Batch Mode Only (Temporary):**

- `{{directory}}/{{codebase_name}}-batch-manifest.json` - Processing plan and progress (deleted after completion)
- `{{directory}}/{{codebase_name}}-openapi-in-progress.json` - Incremental schema build (renamed to final at completion)

**Example Output Paths:**

```
generated-docs/2025-10-22-Claude-4.5-Sonnet-Cursor/orders/
  ├── orders-api-code-files.json
  └── orders-openapi.json
```

## Important Notes

### Automated Execution

- **Fully automatic**: No user prompts or interaction required
- **Continuous processing**: Batches processed sequentially without pauses
- **Error handling**: Automatic recovery from transient errors
- **Progress reporting**: Clear status updates but no blocking prompts

### Completeness Priority (CRITICAL)

- **Quality over speed**: Extract complete details even if it takes longer
- **Never skip DTOs**: Always read request/response DTO files for complete schemas
- **Never skip parameters**: Extract ALL path, query, header parameters
- **Batch size is flexible**: Reduce to 2-3 controllers per batch if needed to maintain quality
- **Token management**: Clear source code, but never skip extracting the data first

### Index Accuracy (CRITICAL)

- **Index is generated LAST**: After all paths are processed
- **Index reflects reality**: Only lists actually implemented endpoints
- **Source of truth**: The `paths` section, not controller names or assumptions
- **Validation**: Index count must match paths count exactly
- **No speculation**: Don't add endpoints that "should" exist but don't

### Processing Strategy

- **Smaller batches for complex APIs**: 3-5 controllers per batch maximum
- **No manual intervention needed**: Batch processing happens transparently
- **Progress visibility**: Clear reporting at each stage
- **Resumable**: If interrupted, can identify what's been completed and resume

### Completeness Guarantee

- **Do NOT skip controllers** even if there are many (use batch mode instead)
- **Do NOT skip DTOs/models** - they define request/response schemas
- **Do NOT abbreviate** parameters or request bodies
- **Every endpoint must have a complete OpenAPI path definition** with all methods, ALL parameters, complete request/response schemas
- **Quality over speed**: Better to process in batches correctly than rush and miss details

### Context Management

- Batch mode automatically manages context to prevent overload
- Incremental saves ensure no work is lost
- Controller contents cleared AFTER extracting data to free memory
- Only essential data retained between batches
- Extraction happens BEFORE cleanup, not after

### Multi-Repository Support

- When `codebases[].name` is an array (e.g., `["api1", "api2"]`):
  - Clone all repositories
  - Aggregate all controllers/routes
  - Generate unified OpenAPI schema
  - Use `codebases[].documentation` value for output filename
  - Tag endpoints by source repository when applicable

### Validation Philosophy

- Validate early and often (after each batch)
- Fix issues immediately before proceeding
- Final validation is comprehensive and includes parameter/requestBody checks
- Invalid or incomplete schemas are not accepted - fix until complete and valid
