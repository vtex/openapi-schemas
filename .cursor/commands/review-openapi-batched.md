# Review API Documentation (Script-Assisted)

**Single command that generates complete OpenAPI documentation using AI for analysis and Python script for merging.**

## Overview

This command reviews existing OpenAPI documentation against source code and generates a complete, updated OpenAPI schema. The AI analyzes code and generates batch documentation files, then a Python script merges everything into the final schema.

## Execution Mode

**Hybrid: AI Analysis + Script Merging** - Run once, get complete output. No confirmations needed.

---

## Steps

### 1. Load Configuration

- Read: `config.json`
- Clone openapi-schemas repo if needed: `git clone https://github.com/vtex/openapi-schemas.git`
- Use `codebase_root` template: `https://github.com/{{organization}}/{{codebase_name}}.git`
- Replace `{{model_name}}` with your model name (e.g., "Claude-4-Sonnet")
- Replace `{{yyyy-mm-dd}}` with current date
- Report: `📋 Configuration loaded`

### 2. Clone/Update Source Repository

For each codebase in `codebases[]` array:

- Skip entries where `repo` is empty
- Check if `api-repos/{{codebase_name}}` exists
- If not: `git clone "https://github.com/{{organization}}/{{codebase_name}}.git" api-repos/{{codebase_name}}`
- Report: `📦 Repository ready: {{codebase_name}}`

### 3. Discovery Phase

**Discover API Files:**

- Scan `api-repos/{{codebase_name}}` directory
- Identify: controllers, routes, models, DTOs
- Extract all HTTP endpoints from code
- Report: `🔍 Found {N} API files with {M} endpoints`

**Load Existing OpenAPI:**

- Read: `{{codebases[].documentation}}`
- Count existing documented endpoints
- Report: `📄 Existing schema: {N} endpoints documented`

**Compare and Identify Gaps:**

- Missing endpoints (in code but not in docs)
- Updated endpoints (changed in code)
- Removed endpoints (in docs but not in code)
- Report: `📊 Analysis: {A} to add, {U} to update, {R} to remove`

**Create Work Plan:**

- Group endpoints into batches of **3-5 endpoints each**
- For complex endpoints with many parameters/schemas: **2-3 endpoints per batch**
- Prioritize keeping related endpoints together (same resource CRUD operations)
- Group by path prefix or tag for logical grouping
- Identify shared schemas for each batch
- Calculate total batches needed
- Report: `📝 Work plan: {N} batches to process`

**Save Discovery Files:**

- Write: `{{directory}}/{{codebase_name}}-api-code-files.json`
- Write: `{{directory}}/{{codebase_name}}-work-plan.json` with structure:

    ```json
    {
      "totalEndpoints": 100,
      "totalBatches": 15,
      "batches": [
        {
          "id": 1,
          "name": "Core Order Operations",
          "endpoints": [
            {"method": "GET", "path": "/api/orders/pvt/document/{id}", "controller": "OrdersController.ts"},
            {"method": "POST", "path": "/api/orders/pvt/document", "controller": "OrdersController.ts"}
          ],
          "schemas": ["OrderDocument", "CreateOrderRequest"]
        }
      ]
    }
    ```

### 4. Generate Review Report

Create comprehensive markdown review:

- File: `{{directory}}/{{codebase_name}}-documentation-review.md`
- Include: all changes organized by type
- Report: `✅ Review report created`

### 5. Generate Merge Script

**Use Python script for merging batch files:**

Write to `{{directory}}/merge-openapi-batches.py`:

Get the script from `.cursor/commands/openapi-scripts/merge-batches.py`. **Don't move, edit or delete this file. Make a copy.**

Report: `🐍 Merge script created`

### 6. Initialize Base OpenAPI Structure

**Create base structure file:**

Write to `{{directory}}/{{codebase_name}}-base.json`:

```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "[Copy from existing or generate]",
    "version": "[Increment from existing, e.g., 1.0.0 → 1.1.0]",
    "description": ""
  },
  "servers": [
    {
      "url": "https://{accountName}.{environment}.com.br",
      "variables": {
        "accountName": {
          "default": "apiexamples",
          "description": "Name of the VTEX account."
        },
        "environment": {
          "enum": ["vtexcommercestable"],
          "default": "vtexcommercestable"
        }
      }
    }
  ],
  "security": [
    {"appKey": [], "appToken": []},
    {"VtexIdclientAutCookie": []}
  ],
  "paths": {},
  "components": {
    "securitySchemes": {
      "appKey": {
        "type": "apiKey",
        "in": "header",
        "name": "X-VTEX-API-AppKey"
      },
      "appToken": {
        "type": "apiKey",
        "in": "header",
        "name": "X-VTEX-API-AppToken"
      },
      "VtexIdclientAutCookie": {
        "type": "apiKey",
        "in": "header",
        "name": "VtexIdclientAutCookie"
      }
    },
    "schemas": {},
    "parameters": {
      "Content-Type": {
        "name": "Content-Type",
        "in": "header",
        "required": true,
        "schema": {"type": "string"},
        "example": "application/json"
      },
      "Accept": {
        "name": "Accept",
        "in": "header",
        "required": true,
        "schema": {"type": "string"},
        "example": "application/json"
      }
    },
    "responses": {}
  },
  "tags": []
}
```

Report: `🏗️ Base schema created`

### 7. Generate Batch OpenAPI Files

⚠️ **CRITICAL: AI-Generated Batches Only. YOU MUST PERSONALLY GENERATE EACH BATCH FILE**

**PROHIBITED ACTIONS:**

- ❌ Creating a Python script to generate batch files
- ❌ Creating a loop or automation to "fill in" batches
- ❌ Generating skeleton/template batch files
- ❌ Delegating batch generation to any script
- ❌ Creating placeholder batch files

**REQUIRED ACTIONS:**

- ✅ Personally analyze source code for EACH batch
- ✅ Extract actual parameters, types, schemas from code
- ✅ Write complete OpenAPI definitions for EACH endpoint
- ✅ Generate realistic examples based on code analysis
- ✅ Create one complete batch file at a time

**IF YOU FIND YOURSELF THINKING:**

- "This will take too long..." → STOP. Smaller batches (2-3 endpoints) are manageable
- "I should automate this..." → NO. Each batch needs code analysis
- "I'll create a script to..." → NO. Only the merge script is allowed
- "Let me generate templates..." → NO. Generate complete definitions

**RATIONALE:**
The value of this command is YOUR code analysis and understanding.
A script cannot understand the codebase - only you can.
Each batch file must be the result of actual code analysis, not automation.

---

**Batch Processing Strategy:**

**Load work plan:**

- Read: `{{directory}}/{{codebase_name}}-work-plan.json`
- Extract total number of batches
- Note: With 3-5 endpoints per batch, expect 15-30 batches for most APIs

**Process each batch (1 through N):**

For **EACH** batch, you must:

1. **Read batch definition from work plan**
   - Get endpoints assigned to this batch
   - Get associated controller files
   - Get expected schemas

2. **Analyze source code for this batch:**
   - Read the relevant controller/route files
   - Identify HTTP methods, paths, parameters
   - Extract request body structures
   - Extract response structures
   - Identify validation rules, types, formats
   - Find realistic example values from code

3. **Generate complete batch file:**

   **File:** `{{directory}}/batch-{N}.json`

   **Content structure:**

   ```json
   {
     "paths": {
       "/api/endpoint/path": {
         "get": {
           "summary": "Clear summary from code analysis",
           "description": "Detailed description based on code behavior",
           "operationId": "operationName",
           "tags": ["TagName"],
           "parameters": [
             {"$ref": "#/components/parameters/Content-Type"},
             {"$ref": "#/components/parameters/Accept"},
             {
               "name": "id",
               "in": "path",
               "required": true,
               "description": "Extracted from code",
               "schema": {"type": "string"},
               "example": "realistic-value-from-code"
             }
           ],
           "requestBody": {
             "required": true,
             "content": {
               "application/json": {
                 "schema": {"$ref": "#/components/schemas/RequestSchema"},
                 "example": { /* realistic example from code */ }
               }
             }
           },
           "responses": {
             "200": {
               "description": "Success - based on code",
               "content": {
                 "application/json": {
                   "schema": {"$ref": "#/components/schemas/ResponseSchema"},
                   "example": { /* realistic example */ }
                 }
               }
             },
             "400": {"description": "Bad Request - validation errors from code"},
             "401": {"description": "Unauthorized"},
             "403": {"description": "Forbidden"},
             "404": {"description": "Not Found"},
             "500": {"description": "Internal Server Error"}
           }
         }
       }
     },
     "components": {
       "schemas": {
         "RequestSchema": {
           "type": "object",
           "description": "Based on code analysis",
           "required": ["field1", "field2"],
           "properties": {
             "field1": {
               "type": "string",
               "description": "From code comments/usage",
               "example": "realistic-value"
             },
             "field2": {
               "type": "integer",
               "description": "From code",
               "example": 123
             }
           }
         },
         "ResponseSchema": {
           "type": "object",
           "description": "Based on code return types",
           "properties": {
             "id": {"type": "string", "example": "abc123"},
             "status": {"type": "string", "example": "success"}
           }
         }
       }
     },
     "tags": [
       {"name": "TagName", "description": "Tag description"}
     ]
   }
   ```

4. **Write batch file:**
   - Save to: `{{directory}}/batch-{N}.json`
   - Verify JSON is valid
   - Verify schemas reference real types from code

5. **Report progress:**

   ```
   📝 Batch {N}/{Total}: ✅ Generated
      File: batch-{N}.json
      Endpoints: {count} (e.g., GET /api/orders/{id}, POST /api/orders)
      Schemas: {count} (e.g., OrderDocument, CreateOrderRequest)
      Source: {controller files analyzed}
   ```

6. **Continue to next batch immediately**

---

**Batch Generation Requirements:**

Each batch file MUST include:

- ✅ Valid JSON syntax
- ✅ Complete path definitions (all HTTP methods)
- ✅ All parameters with correct types (extracted from code)
- ✅ Request body schemas (if endpoint accepts body)
- ✅ All response codes (200, 400, 401, 403, 404, 500+)
- ✅ Complete schema definitions in components.schemas
- ✅ All required properties marked
- ✅ Realistic examples (based on code, not placeholder values)
- ✅ Proper descriptions (from code analysis)
- ✅ All $ref references valid

---

**Time Management:**

With 3-5 endpoints per batch:

- Each batch takes ~2-3 minutes to generate properly
- For 20 batches: ~40-60 minutes total
- For 30 batches: ~60-90 minutes total

This is acceptable processing time for complete, accurate documentation.

**If you feel rushed or overwhelmed:**

1. Take your time with each batch
2. Focus on quality over speed
3. Each batch is independent - do it right
4. The merge script will handle the rest

**Progress checkpoints:**

- After every 5 batches: Report "Checkpoint: {N}/Total batches complete"
- Continue without waiting for confirmation
- The command runs until ALL batches are complete

### 7.5. Verify All Batches Generated

**Before running merge script:**

**Count batch files:**

```bash
ls {{directory}}/batch-*.json | wc -l
```

**Compare with work plan:**

- Expected batches: {N} (from work plan)
- Generated batches: {M} (from file count)

**If M < N:**

```
⚠️ INCOMPLETE: Only {M} of {N} batches generated!
   Missing batches: {list of missing batch numbers}

   ACTION REQUIRED:
   - Identify which batches are missing
   - Generate the missing batches
   - DO NOT proceed to merge until ALL batches exist
```

**If M == N:**

```
✅ All batches verified present
   Proceeding to merge step...
```

**Verify batch file sizes:**

- Each batch file should be >50 lines (minimum for complete content)
- If any batch-{N}.json < 50 lines:

  ```
  ⚠️ Batch {N} appears incomplete ({lines} lines)
      This batch likely needs regeneration
      A complete batch with 3-5 endpoints should be 150-500 lines
  ```

**Only proceed to merge if:**

- ✅ All {N} batches exist
- ✅ Each batch > 50 lines
- ✅ All batches are valid JSON

### 8. Merge All Batches with Script

**After all batch files are generated:**

**Execute merge script:**

Run in terminal:

```bash
cd {{directory}}
python merge-openapi-batches.py \
  {{codebase_name}}-base.json \
  "batch-*.json" \
  {{codebase_name}}-openapi.json \
  {{codebase_name}}
```

**Monitor script output:**

- Script will report merge progress
- Script will generate endpoint index
- Script will validate final schema

Report: `🔀 Merge script executed`

### 9. Validation & Cleanup

**Validate merged file:**

- Read: `{{directory}}/{{codebase_name}}-openapi.json`
- Verify JSON is valid
- Count paths and schemas
- Report validation status

**Clean up batch files:**

- Delete: `{{directory}}/batch-*.json`
- Delete: `{{directory}}/{{codebase_name}}-base.json`
- Keep: `{{directory}}/merge-openapi-batches.py` (for reference/reuse)

Report: `🧹 Cleanup complete`

### 10. Completion Report

```
🎉 OpenAPI Schema Generation Complete!

📁 Output Files:
    ✅ {{directory}}/{{codebase_name}}-openapi.json
    ✅ {{directory}}/{{codebase_name}}-documentation-review.md
    ✅ {{directory}}/{{codebase_name}}-api-code-files.json
    ✅ {{directory}}/{{codebase_name}}-work-plan.json
    ✅ {{directory}}/merge-openapi-batches.py

📊 Statistics:
    - Endpoints Documented: {count}
    - Schemas Defined: {count}
    - Batches Processed: {count}

🔗 Next Steps:
    - Review the documentation-review.md for change details
    - Validate schema in Swagger UI: https://editor.swagger.io
    - Compare with original: {{documentation}}
```

---

## Output Files

| File | Description |
|------|-------------|
| `{{codebase_name}}-openapi.json` | **Complete merged OpenAPI 3.0 schema** |
| `{{codebase_name}}-documentation-review.md` | Detailed review report |
| `{{codebase_name}}-api-code-files.json` | Discovered API files |
| `{{codebase_name}}-work-plan.json` | Batch processing plan |
| `merge-openapi-batches.py` | Merge script (reusable) |

**Temporary files (deleted after merge):**

- `batch-1.json`, `batch-2.json`, ... `batch-N.json`
- `{{codebase_name}}-base.json`

**Output Directory:** `reviewed-docs/{{yyyy-mm-dd}}-{{model_name}}-Cursor/{{codebase_name}}/`

---

## Technical Implementation Notes

### Why This Approach Works

✅ **AI focuses on analysis** - What it's good at (understanding code)
✅ **Script handles merging** - What it's good at (file manipulation)
✅ **No token limits** - AI generates small batch files
✅ **No complexity concerns** - Script doesn't care about size
✅ **Deterministic merging** - Script behavior is predictable
✅ **Easy debugging** - Can inspect batch files individually
✅ **Resumable** - If AI fails partway, existing batches are kept

### Batch File Generation Strategy

The AI should focus on making each batch file **complete and correct**, not worrying about the overall size. The Python script will handle the merging automatically.

**Each batch file is independent** - can be generated, reviewed, and fixed separately.

### Error Recovery

If batch generation fails:

1. Existing batch files are preserved
2. Can manually fix problematic batch file
3. Re-run just the merge script
4. Or regenerate specific batch numbers

---

## Constraints & Requirements

### MUST DO

✅ Generate complete, valid batch JSON files
✅ Each batch file must be standalone and valid
✅ Generate Python merge script
✅ Execute merge script after all batches are generated
✅ Include all required fields in each batch
✅ Clean up temporary files after merge
✅ Validate final merged output

### MUST NOT

❌ Try to merge batches manually in AI responses
❌ Generate incomplete batch files
❌ Skip the script execution step
❌ Create placeholder or template content
❌ Worry about final file size during batch generation
❌ Create Python scripts to auto-generate batch files
❌ Generate more than 5 endpoints per batch (keep batches small)
❌ Proceed to merge if any batches are missing or incomplete
❌ Use automation to "fill in" batch files

---

## Execution Philosophy

**Division of Labor:**

**AI Agent Role:**

- Analyze source code
- Understand API structure
- Generate accurate OpenAPI definitions
- Create small, manageable batch files
- Execute merge script

**Python Script Role:**

- Merge JSON files
- Handle large file operations
- Generate endpoint index
- Validate final output
- Fast and deterministic processing
