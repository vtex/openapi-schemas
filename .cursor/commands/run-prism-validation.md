# Run Prism validation

Validates an OpenAPI specification file using Prism mock server by testing all endpoints and documenting results.

## Usage

```bash
/run-prism-validation {filename}
```

**Example:**

```bash
/run-prism-validation VTEX - License Manager API.json
```

---

## Instructions

You are an expert API testing assistant. Your task is to validate an OpenAPI specification file by running Prism mock server and testing all endpoints systematically.

### Step 1: Parse input and locate file

1. Extract the filename from the command: `{filename}`
2. Locate the file in the workspace.
3. Verify the file exists and is valid JSON.
4. Read the OpenAPI specification to identify:
   - Total number of endpoints.
   - HTTP methods for each endpoint.
   - Required parameters and security schemes.
   - Request/response schemas.
   - **Expected success response codes** (200, 201, 204, etc.) for each endpoint from the `responses` section.

### Step 2: Initialize Prism mock server

1. Choose an available port (start with 4010, increment if occupied).
2. Start Prism in the background with the `--errors` flag:

   **PowerShell:**

   ```powershell
   cd "{directory-where-openapi-file-is-located}"; npx --yes @stoplight/prism-cli mock "{filename}" -p {port} --errors
   ```

   **Important:**
   - Replace `{directory-where-openapi-file-is-located}` with the actual path where the OpenAPI file is stored
   - The `--errors` flag allows Prism to return documented error responses instead of blocking requests with security validation errors
   - Use `;` as command separator in PowerShell (not `&&` which is bash syntax)

3. Wait 5-8 seconds for Prism to initialize.
4. Verify Prism is running by making a test request to the base URL.
5. Document the Prism server details:
   - Port number.
   - Base URL (http://127.0.0.1:{port}).
   - Prism flags used: `--errors`

### Step 3: Test all endpoints

For each endpoint discovered in the OpenAPI specification:

#### 3.1 Prepare request

1. Determine the correct HTTP method (GET, POST, PUT, PATCH, DELETE).
2. Construct the full endpoint URL with the Prism base URL.
3. **CRITICAL - Determine Expected Success Response Code:**
   - Read the OpenAPI spec's `responses` section for the endpoint
   - Identify the first 2xx success response code (200, 201, 204, etc.)
   - Common success codes:
     - `200` - OK (most common)
     - `201` - Created (for POST endpoints that create resources)
     - `204` - No Content (for DELETE, PUT, PATCH endpoints that don't return data)
   - **If multiple 2xx codes exist, use the first one or the most appropriate**
   - Store this code for use in the `Prefer` header
4. Identify required parameters:
   - Path parameters (replace with test values).
   - Query parameters (add test values).
   - Request body (create minimal valid payload based on schema).
5. Set appropriate headers:

   **Always include:**
   - `Prefer: code={success-code}` - Requests the specific success response from Prism (e.g., `code=200`, `code=204`, `code=201`)
     - **IMPORTANT:** Use the actual success code from the OpenAPI spec, not always `200`
     - If endpoint returns `204 No Content`, use `Prefer: code=204`
     - If endpoint returns `201 Created`, use `Prefer: code=201`
     - If endpoint returns `200 OK`, use `Prefer: code=200`
   - `Accept: application/json` (or appropriate content type)
   - `Content-Type: application/json` (for POST/PUT/PATCH with body)

   **Security headers (optional with --errors flag, but recommended):**
   - **VTEX API Keys:** `X-VTEX-API-AppKey` and `X-VTEX-API-AppToken`
   - **User Token:** `VtexIdclientAutCookie`
   - **Cookies:** `Cookie: cookieName=cookieValue`
   - **Query params:** Add authentication parameters to URL query string

   **Important:** Use exact header names as defined in the OpenAPI spec's `securitySchemes` section. VTEX APIs use `X-VTEX-API-AppKey` and `X-VTEX-API-AppToken` (not `appKey`/`appToken`).

#### 3.2 Execute request

Use PowerShell's `Invoke-WebRequest` with proper error handling:

```powershell
# Example: Determine expected success code from OpenAPI spec
# Read the endpoint's responses section and find the first 2xx code
# For this example, assume the endpoint returns 204 No Content
$expectedSuccessCode = "204"  # Get this from OpenAPI spec: responses.204 or responses.200, etc.

$body = '{"field":"value"}' # If needed
try {
    $response = Invoke-WebRequest -Uri "{endpoint-url}" -Method {METHOD} `
        -Headers @{
            "Content-Type"="application/json";
            "Accept"="application/json";
            "X-VTEX-API-AppKey"="vtexappkey-example";
            "X-VTEX-API-AppToken"="test-token";
            "Prefer"="code=$expectedSuccessCode"  # Use the actual success code from spec
        } `
        -Body $body `
        -ErrorAction SilentlyContinue
    
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Body: $($response.Content)"
} catch {
    $status = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { "Error" }
    Write-Host "Status: $status"
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Body: $($reader.ReadToEnd())"
    } catch {
        Write-Host "Error: $($_.Exception.Message)"
    }
}
```

**Prism `Prefer` header options:**

- `Prefer: code={status-code}` - Request a specific response code (e.g., `code=200`, `code=204`, `code=201`)
  - **CRITICAL:** Must match an actual response code defined in the OpenAPI spec
  - If you request `code=200` but the endpoint only has `204`, Prism will return 404
  - Always check the OpenAPI spec's `responses` section to determine the correct code
- `Prefer: example=exampleName` - Select a specific example if multiple exist
- `Prefer: dynamic=true` - Generate dynamic mock data instead of static examples

**How to determine the correct `Prefer` code:**

1. Look at the endpoint's `responses` object in the OpenAPI spec
2. Find the first 2xx status code (200, 201, 204, etc.)
3. Use that code in the `Prefer` header: `Prefer: code={that-code}`
4. Common patterns:
   - GET endpoints usually return `200`
   - POST endpoints that create resources often return `201`
   - DELETE/PUT/PATCH endpoints often return `204` (No Content)

**PowerShell example to extract response code from OpenAPI spec:**

```powershell
# Read OpenAPI spec (use -AsHashtable for safer dynamic property access)
$openApiSpec = Get-Content "path/to/openapi.json" | ConvertFrom-Json -AsHashtable

# For a specific endpoint (e.g., POST /api/b2b/import/buyer-orgs/{importId})
$path = "/api/b2b/import/buyer-orgs/{importId}"
$method = "post"
# Use bracket notation to access properties with special characters
$responses = $openApiSpec['paths'][$path][$method]['responses']

# Find first 2xx response code
$successCode = ($responses.Keys | Where-Object { $_ -match '^2\d{2}$' } | Select-Object -First 1)
# Result: "204" (if endpoint returns 204 No Content)

# Use in Prefer header
$preferHeader = "code=$successCode"  # "code=204"
```

#### 3.3 Capture response

For each request, capture:

- HTTP status code
- Response headers (especially `sl-violations` for validation errors)
- Response body (JSON or error message)
- Execution time
- Any Prism validation warnings or errors

#### 3.4 Classify result

Classify each endpoint test result:

- ✅ **SUCCESS**: 200-299 status codes with valid mock response matching the schema
- ⚠️ **WARNING**: Request completed but with issues:
  - **422 Unprocessable Entity**: Missing required parameters or invalid request schema
  - **500 Internal Server Error**: Prism couldn't generate a valid response (check schema definitions)
- ❌ **FAILED**: Indicates OpenAPI spec issues:
  - Missing response schemas
  - Invalid example data
  - Malformed security definitions
  - Response doesn't match ANY response defined in the spec
- ✅ **EXPECTED ERROR**: 401/403 responses that are properly defined in the spec
  - These are VALID results - they show error responses are properly documented

**Note:** With `--errors` flag, Prism returns error responses (401, 422, 500) defined in your OpenAPI spec. This validates that error responses are properly documented. Use `Prefer: code={success-code}` to request success responses for schema validation, where `{success-code}` is the actual 2xx response code defined in the spec (not always 200).

### Step 4: Generate validation report

**CRITICAL - Date Handling:**
Before generating the report, get the current date using PowerShell:

```powershell
$testDate = Get-Date -Format "yyyy-MM-dd"
```
Use this `$testDate` value to replace `{current-date}` in the report template. **DO NOT hardcode dates** - always use the actual current date.

**CRITICAL - Report Prefix Selection:**
Determine the correct prefix based on the source of the OpenAPI file:

1. **`[Dev Portal]`** - Use when the OpenAPI file comes from:
   - Root directory (published schemas like `VTEX - *.json`)
   - Files reviewed by `/review-openapi` command (which reviews published schemas)
   - Any schema that originates from the published repository

2. **`[AI generated]`** - Use when the OpenAPI file comes from:
   - `generated-docs/` directory (schemas generated by `/generate-openapi` command)

**How to determine:**

- Check the file path first:
  - If it's in the root directory (published schemas) or was reviewed from published schemas → use `[Dev Portal]`
  - If it's in `generated-docs/` or `reviewed-docs/`:
    - Use `[Dev Portal]` if the API has a corresponding published schema in the root directory (indicated by `codebases[].documentation` field in config.json)
  - Use `[AI generated]` if the API does NOT have a corresponding published schema (new API being documented for the first time)
- For `/review-openapi` command: Always use `[Dev Portal]` because it reviews published schemas
- For `/generate-openapi` command: Check if `codebases[].documentation` exists - if yes, use `[Dev Portal]`, otherwise use `[AI generated]`

Create a markdown report in `tests/prism/[prefix] {api-name} - {current-date}.md` where:

- `{prefix}` is `[Dev Portal]` or `[AI generated]` based on the source (see logic above)
- `{api-name}` is the API name (e.g., "Punchout API", "Session Manager API", "session")
- `{current-date}` is the actual date from `Get-Date -Format "yyyy-MM-dd"` (never hardcode dates)

#### Report Structure

```markdown
# {API Name} - Prism Validation Report

**Test Date:** {current-date} (MUST use actual current date from Get-Date -Format "yyyy-MM-dd")
**Testing Tool:** Prism Mock Server
**OpenAPI Spec:** {filename}
**Base URL:** http://127.0.0.1:{port}
**Total Endpoints:** {count}

---

## Executive Summary

### Validation Statistics
- **Total Endpoints Tested:** {count}
- **Successful Mock Responses (2xx):** {count} ({percentage}%)
- **Documented Error Responses (4xx/5xx):** {count} ({percentage}%)
- **Validation Errors:** {count} ({percentage}%)
- **Schema Issues:** {count} ({percentage}%)

### Validation Mode
- **Prism Flags Used:** `--errors` (returns documented error responses)
- **Security Validation:** Relaxed (accepts requests without valid credentials)
- **Response Preference:** `Prefer: code={success-code}` header used to request success responses, where the code matches the actual 2xx response defined in the OpenAPI spec (e.g., `code=200`, `code=204`, `code=201`)

### Critical Issues Found
{List of critical issues that need immediate attention - only include issues where Prism couldn't generate ANY valid response}

### Overall Health Score: {score}/100

---

## Detailed Test Results

{For each endpoint, include:}
- Endpoint path and HTTP method
- Description from OpenAPI spec
- **Authentication Method**: Which security scheme was used/required (API Keys, User Token, or None)
- **Test Command**: The exact curl command used to test this endpoint
- Request details (headers, parameters, body)
- Response status code and body
- Observations about behavior and any issues found

**Format for test commands:**
```bash
curl -X {METHOD} "{endpoint-url}" \
  -H "Header1: value1" \
  -H "Header2: value2" \
  -d '{request-body}'
```

---

## Issues Identified

### Critical Issues (Must Fix)
{Issues that break the API or spec}

### Warnings (Should Fix)
{Issues that may cause problems}

### Informational (Nice to Fix)
{Minor improvements}

---

## Recommendations

{Actionable recommendations based on test results}
```

### Step 5: Analyze issues and suggest fixes

For each failed or problematic endpoint:

1. **Identify Root Cause:**
   - Missing required properties in schema
   - Invalid example data
   - Incorrect security schemes
   - Missing response definitions
   - Schema validation errors

2. **Categorize by Severity:**
   - **Critical**: Prevents endpoint from working
   - **High**: Causes unexpected behavior
   - **Medium**: Incomplete documentation
   - **Low**: Minor inconsistencies

3. **Generate Fix Suggestions:**

   ```md
   ### Issue: {endpoint} - {issue-description}
   
   **Severity:** {Critical/High/Medium/Low}
   
   **Current State:**
   ```json
   {current schema or example}
   ```

   **Problem:** {detailed explanation}

   **Suggested Fix:**

   ```json
   {corrected schema or example}
   ```

   **Location in OpenAPI file:** {path in JSON structure}
   ```

### Step 6: Cleanup and summary

1. Stop the Prism mock server (if still running).
2. Generate final summary output:

```
✅ Prism Validation Complete

API: {api-name}
Endpoints Tested: {count}
Success Rate: {percentage}%
Report: tests/prism/[Dev Portal] {api-name}.md

Issues Found:
  • Critical: {count}
  • Warnings: {count}
  • Info: {count}

Next Steps:
{Provide specific recommendations}
```

---

## Troubleshooting

### Prism Won't Start
- Check if port is available
- Verify OpenAPI file is valid JSON
- Ensure file path is correct
- Check for syntax errors in the OpenAPI spec

### All Tests Return 401 Unauthorized
**Solution:**
1. Ensure you're using `--errors` flag when starting Prism
2. Add `Prefer: code={success-code}` header to requests, where `{success-code}` matches the actual 2xx response code in the spec
3. 401 responses are valid if they're defined in the spec - don't treat them as failures

### Endpoints Return 404 Instead of Expected Response
**Cause:** The `Prefer: code={code}` header doesn't match any response code defined in the OpenAPI spec.

**Solution:**
1. Check the OpenAPI spec's `responses` section for the endpoint
2. Identify the actual success response code (200, 201, 204, etc.)
3. Update the `Prefer` header to match: `Prefer: code=204` (if endpoint returns 204), `Prefer: code=201` (if endpoint returns 201), etc.
4. Common issue: Using `Prefer: code=200` for endpoints that return `204 No Content`

### All Tests Return 422 Unprocessable Entity
**Causes:**
- Missing required parameters in the request
- Request body doesn't match the schema
- Query parameters not provided

**Solution:**
- Review the endpoint's parameters in the OpenAPI spec
- Ensure all required parameters are included
- Validate request body against the request schema

### All Tests Fail with Connection Error
- Confirm Prism is running: `curl http://127.0.0.1:{port}`
- Check firewall settings
- Verify port number matches
- Wait longer for Prism to initialize (try 10 seconds)

### Getting 500 Errors from Prism
**Cause:** Prism can't generate a valid response based on the schema

**Solution:**
- Check if response schema is properly defined
- Verify examples match the schema
- Add more complete schema definitions
- Check for circular references in schemas

---

## Notes

- Always save the validation report in `tests/prism/` folder
- **CRITICAL - Prefix Selection:**
  - **`[Dev Portal]`** - For schemas from `openapi-schemas` repository (published schemas), reviewed by `/review-openapi` command, or generated by `/generate-openapi` when the API has a corresponding published schema (indicated by `codebases[].documentation` field)
  - **`[AI generated]`** - For schemas generated by `/generate-openapi` command from source code when the API does NOT have a corresponding published schema (new API being documented for the first time)
- **CRITICAL - Date Handling:** Always use `Get-Date -Format "yyyy-MM-dd"` to get the current date. NEVER hardcode dates in reports.
- **Prism with `--errors` flag:** Bypasses security validation to test schema correctness
- **`Prefer: code={success-code}` header:** Requests specific success responses for schema validation
  - **CRITICAL:** Must match an actual 2xx response code in the OpenAPI spec
  - Common codes: `code=200` (OK), `code=201` (Created), `code=204` (No Content)
  - If the code doesn't match, Prism returns 404
  - Always check the spec's `responses` section to determine the correct code
- 401/403 responses are VALID if they're documented in the OpenAPI spec
- Prism generates mock data based on schemas and examples
- Real endpoint testing requires actual VTEX credentials and endpoints

### Security Header Names

**VTEX API Keys:**
- Header name: `X-VTEX-API-AppKey` (NOT `appKey` or `appkey`)
- Header name: `X-VTEX-API-AppToken` (NOT `appToken` or `apptoken`)
- Example values: `vtexappkey-example`, `test-token`

**User Token:**
- Header name: `VtexIdclientAutCookie` (exact capitalization)
- Example value: `test-cookie`

**Always use the exact header names as defined in the OpenAPI spec's `securitySchemes` section.**

### Understanding Prism Responses

**Success Indicators:**
- 200-299 responses with valid JSON matching the schema = ✅ Schema is correct
- 401/403 responses matching spec definitions = ✅ Error responses are documented
- Mock data generated successfully = ✅ Schema is complete

**Problem Indicators:**
- 422 responses = ⚠️ Missing required parameters or invalid request schema
- 500 responses = ❌ Prism can't generate response (incomplete/invalid response schema)
- No response definition = ❌ Missing response documentation in spec
