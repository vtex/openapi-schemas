# Analyze PR for API Changes

Analyze a pull request to identify API changes and update OpenAPI schemas.

## Usage

```
/analyze-pr-changes-openapi https://github.com/organization/repository-name/pull/123
```

## What You'll Do

1. Analyze code changes in a PR
2. **Verify changes in the PR against final state** (critical step to avoid false positives)
3. Identify impact on APIs
4. Update corresponding OpenAPI schema **if there are changes**
5. Generate analysis report with migration notes

## ⚠️ Common Pitfalls to Avoid

### Git Diffs Can Be Misleading!

Always verify:
- **Method reordering** can appear as removal + addition when both methods still exist
- **Unrelated changes** in different parts of a file can appear adjacent in diffs
- **A `-` block followed by a `+` block does NOT always mean replacement**
- **Always check the final state** of the code in the PR branch before concluding removals

**Example of false positive:**
- Diff shows `CancelOrderAsync` removed and `NotifyPayment` added
- But `CancelOrderAsync` still exists in the final code
- And `NotifyPayment` is in a different controller file
- This is NOT a replacement - it's unrelated changes appearing together in the diff

### ⚠️ CRITICAL: Model Changes ≠ API Contract Changes!

**The most common mistake is assuming model class changes automatically mean API breaking changes.**

**Model classes are NOT the API contract!** The API contract is defined by:
- The **OpenAPI schema** (what's documented)
- What clients **actually send/receive**
- What the API **accepts/returns** in practice

**Before declaring ANY model change as a breaking API change, you MUST:**

1. **Check the OpenAPI schema first** - Is the field actually documented?
   ```bash
   # Search the OpenAPI schema for the field
   grep -i "fieldName" "VTEX - API Name.json"
   ```

2. **Verify field is part of public API, not just an internal field**:
   - Internal fields may exist in models but not be part of the API contract
   - Fields may be unused/deprecated internally
   - Fields may have been removed from API contract earlier but left in code

3. **Be conservative** - When in doubt, assume internal changes unless proven otherwise:
   - ❌ **Wrong**: "Field removed from model = breaking API change"
   - ✅ **Correct**: "Field removed from model, but verified it's not in OpenAPI schema = internal refactoring"

4. **Distinguish internal vs. public**:
   - Internal model refactoring: Changes to how data is processed internally
   - API contract change: Changes to what clients send/receive (documented in OpenAPI schema)

**Example of false positive:**
- Model class `CancellationRequest` has field `CancellationRequestDate` removed
- But checking OpenAPI schema shows this field was never documented
- This is an **internal refactoring**, NOT an API breaking change

## Steps

### 1. Setup Repositories

```bash
# Clone target repository
cd api-repos
git clone https://github.com/{organization}/{repository}.git
cd {repository}

# Fetch PR and checkout PR branch to verify final state
git fetch origin pull/{pr_number}/head:pr-{pr_number}
git checkout pr-{pr_number}

# Generate diff for analysis (but verify against final state)
git diff master..pr-{pr_number} > pr_changes.diff
```

### 2. Find Matching Configuration

- Extract `{repository}` name from PR URL
- Search `config.json` `codebases[]` array for matching `name` field
- Get corresponding `documentation` field (target OpenAPI schema filename)
- Example: `"session"` → `"VTEX - Session Manager API.json"`

### 3. Create Output Directory

```bash
# Use output.pr-changes-output.directory template
mkdir -p pr-changes-suggestions/{{yyyy-mm-dd}}-{{model_name}}-Cursor/{{repository}}
```

### 4. Analyze Changes

**Identify API-Impacting Changes:**

- Controllers, routes, models, DTOs
- Field changes: additions, removals, renames, type changes
- Serialization changes: casing, attributes
- Endpoint changes: new, modified, removed
- Parameter changes
- Authentication changes

**For Each Change:**

- Note the code diff for the files in the PR
- Identify affected endpoints/models in the files of the PR
- **CRITICAL: Verify against OpenAPI schema before determining schema impact**

**⚠️ Model Field Changes - Verification Required:**

Before declaring a model field change as an API breaking change:

1. **Check OpenAPI Schema** - Is the field documented?
   ```bash
   # Search for the field in the OpenAPI schema
   grep -i "fieldName" "{{documentation_filename}}"
   ```

2. **Verify Public API Contract**:
   - If field is NOT in OpenAPI schema → Likely internal refactoring, NOT API change
   - If field IS in OpenAPI schema → Potential API breaking change, verify further

3. **Check if field was ever part of public API**:
   - Search OpenAPI schema for the field name
   - Check if field appears in request/response examples
   - Verify if field is in required/optional properties lists

4. **When in doubt**: Assume internal change unless field is clearly documented in OpenAPI schema

**CRITICAL: Verify Changes Against Final State**

Before concluding that an endpoint/method was removed or replaced:

1. **Check Final State**: Read the actual file in the PR branch (`pr-{pr_number}`) to verify what exists after the PR
2. **Verify Method Existence**: Use `grep` or file reading to confirm if methods/endpoints still exist in the final code
3. **Check File Locations**: Ensure changes are in the same file - diffs can show unrelated changes side-by-side
4. **Avoid Diff Misinterpretation**: 
   - A `-` block followed by a `+` block does NOT always mean replacement
   - Methods might be reordered (appearing as removed/added but both exist)
   - Unrelated changes in different parts of the file can appear adjacent in diffs
   - Always verify by reading the actual final state of the code

**Verification Checklist for Each Suspected Change:**

- [ ] Read the final state of the file in the PR branch
- [ ] Verify if the "removed" method/endpoint still exists (check all files, not just the diff)
- [ ] Check if "added" methods are in the same file or different files
- [ ] Confirm method signatures match (not just similar names)
- [ ] For endpoint removals: Search the entire codebase for the route pattern
- [ ] For method renames: Verify old method doesn't exist and new one does

**⚠️ CRITICAL: For Model Field Changes:**

- [ ] **Check OpenAPI schema** - Is the field actually documented in the schema?
- [ ] **Verify field exists in schema** - Search for field name in OpenAPI JSON
- [ ] **Check if field is in request/response** - Is it part of the public API contract?
- [ ] **Distinguish internal vs. public** - Is this an internal refactoring or API change?
- [ ] **When in doubt** - Assume internal change unless field is clearly in OpenAPI schema

### 5. Verify Analysis Before Proceeding

**⚠️ CRITICAL STEP: Verify Against OpenAPI Schema First**

**Before declaring ANY change as an API breaking change, you MUST verify it against the OpenAPI schema:**

```bash
# Get the OpenAPI schema file
SCHEMA_FILE="{{codebases[].documentation}}"

# For each field you think was added/removed, check if it's in the schema
grep -i "fieldName" "$SCHEMA_FILE"

# For each endpoint you think changed, verify it in the schema
grep -A 20 "/api/path/to/endpoint" "$SCHEMA_FILE"
```

**Rules for Model Field Changes:**

1. **If field is NOT in OpenAPI schema**:
   - This is likely an **internal refactoring**, NOT an API change
   - Do NOT update the OpenAPI schema or generate a new OpenAPI schema file
   - Document as "internal backend change" in the report
   - Provide a **brief analysis report**

2. **If field IS in OpenAPI schema**:
   - This MAY be an API breaking change
   - Verify further: Is it in request body? Response? Is it required?
   - **Locate exact position** in schema (line numbers or JSON path)
   - Update schema only if confirmed to be part of public API contract
   - **Make targeted edits** - only modify the specific section, not the entire file

3. **Conservative approach**:
   - When uncertain, assume internal change
   - Only declare breaking changes when field is clearly documented in OpenAPI schema
   - Better to miss an internal change than to incorrectly declare a breaking change

**Before updating the schema, verify all suspected changes:**

For each endpoint/method you identified as removed, added, or modified:

```bash
# Example: Verify if a method still exists in the PR branch
cd api-repos/{repository}
git checkout pr-{pr_number}
grep -r "CancelOrderAsync" src/  # Check if method exists
grep -r "HttpPost.*cancel" src/  # Check if route exists
```

**Verification Rules:**

1. **For "Removed" Endpoints:**
   - Search the entire codebase **in the PR branch** for the route pattern
   - Search for the method name
   - If found, it was NOT removed - update your analysis

2. **For "Added" Endpoints:**
   - Verify the method exists **in the PR branch**
   - Check if it's in the same file as the diff suggests
   - Confirm it's not just moved from another location

3. **For "Modified" Endpoints:**
   - Read the final state of the method
   - Compare actual signature vs. what the diff suggests
   - Verify parameter changes are real, not just formatting

4. **For Method "Replacements":**
   - Check if BOTH methods exist (old and new)
   - Verify they're in the same file
   - If both exist, it's NOT a replacement - it's an addition

5. **⚠️ For Model Field Changes (CRITICAL):**
   - **First**: Check if field exists in OpenAPI schema
   - **If NOT in schema**: This is internal refactoring, NOT an API change
   - **If IN schema**: 
     - Verify if it's in request/response and if it's required
     - **Locate exact position** (line numbers, JSON path, or unique context)
     - **Note the exact location** for targeted editing
   - **Only update schema** if field is confirmed to be part of public API contract
   - **When updating**: Make targeted edits to only that section, show diff of changes only
   - **When in doubt**: Document as "internal backend change" and do NOT update schema

**Only proceed to schema updates after verification is complete AND you've confirmed the change affects the public API contract (documented in OpenAPI schema).**

### 6. Update Schema

**⚠️ CRITICAL: Only Update Schema for Confirmed API Contract Changes**

**Before updating the schema, verify:**
- The change from the PR affects the **public API contract** (documented in OpenAPI schema)
- The field/endpoint is **actually in the OpenAPI schema**
- This is NOT just an internal model refactoring

**If no API contract changes are confirmed:**
- Do NOT update the OpenAPI schema or generate a new OpenAPI schema file
- Document in report: "No API contract changes detected - all changes are internal backend refactorings"

**Get Original Schema:**

```bash
# Copy from root directory using documentation filename from config
cp "{{codebases[].documentation}}" \
   "pr-changes-suggestions/{{yyyy-mm-dd}}-{{model_name}}-Cursor/{{repository}}/{{repository}}-openapi.json"
```

**Apply Changes (ONLY if confirmed API contract changes):**

**⚠️ EFFICIENCY: Only Modify Changed Sections**

Instead of generating the entire schema, make **targeted edits** to only the sections that changed:

**⚠️ Token Efficiency:**
- Do NOT create a new OpenAPI schema file in the report
- Only show the specific sections that were modified (with context)
- Use diff format to show before/after for changed sections only
- Include line numbers or JSON paths for reference

1. **Identify exact locations** in the OpenAPI schema:
   ```bash
   # Find line numbers for the sections to modify
   grep -n "fieldName\|endpointPath" "{{documentation_filename}}" | head -10
   ```

2. **Use targeted search_replace operations**:
   - Only edit the specific properties/schemas that changed
   - Use line numbers or unique context strings to locate exact positions
   - Make minimal, precise edits

3. **Document changes as diffs** in the report:
   - Show only the changed sections, not the entire schema
   - Use diff format to show before/after for modified sections
   - Include line numbers or path context for clarity

4. **Example approach**:
   ```bash
   # Instead of outputting entire schema, create a patch file or targeted edits
   # Document changes like:
   # 
   # Line 5070-5076: Added field to request body
   # Line 13395-13398: Removed field from response schema
   ```

**Guidelines for Schema Updates:**

- Modify ONLY affected sections that are confirmed in OpenAPI schema
- Do not update version number
- Maintain original formatting
- Apply ONLY changes that affect the public API contract
- **Show diffs, not full file** - Document only the changed sections in the report
- Save to: `output.pr-changes-output.openapi_filename`

**If no API changes confirmed:**
- Do not edit the schema or generate a new schema
- Document: "No schema updates required - backend-only changes"
- **Keep only the following sections: Analysis Context, Summary, Quality Checks, and Output Files.**

### 7. Generate Report

**File:** `output.pr-changes-output.pr-analysis`

**Example:** `pr-changes-suggestions/2025-10-07-Claude-4-Sonnet-Cursor/session/session-pr-135-analysis.md`

**Structure:**

```markdown
# API Change Analysis Report - {Repository} PR #{PR_Number}

## Analysis Context
- PR: {url}
- Analysis Date: {date}
- Updated Schema: {schema_file}

## Summary
- Total files analyzed: X
- Files with API changes: Y
- Affected endpoints: Z

## Detailed Changes

**If no API changes:** State "No changes that affect API documentation were detected."

### {File Path}

**If no API changes:** Suppress this field.

#### Code Changes
```diff
{diff}
```

**If no API changes:** Suppress this field.

#### Impact Analysis

- Affected: [endpoints/models]
- Changes: [description]

**If no API changes:** Suppress this field.

#### Verification

- ✓ Verified final state: [Checked PR branch - method exists/doesn't exist]
- ✓ File location: [Same file / Different file]
- ✓ Method search: [Found/Not found in codebase]

**If no API changes:** Suppress this field.

#### Required OpenAPI Schema Updates

**⚠️ Show only changed sections, not entire schema:**

```diff
# Example: Show only the modified section with context
# Path: paths./api/oms/pvt/orders/{orderId}/cancel.post.requestBody.content.application/json.schema.properties

{
  "properties": {
    "reason": {
      "type": "string",
      "description": "Reason for cancelling the order."
    },
+   "cancellationRequestId": {
+     "type": "string",
+     "description": "ID that identifies the cancellation request.",
+     "nullable": true
+   },
+   "requestedByUser": {
+     "type": "boolean",
+     "description": "Indicates if the order cancellation was requested by the user.",
+     "nullable": true
+   }
-   "cancellationRequestDate": {
-     "type": "string",
-     "description": "Date of when the order cancellation request was processed."
-   }
  }
}
```

**Include:**
- JSON path to the modified section
- Line numbers (if available)
- Only the changed properties/schemas, not the entire file
- Context lines (2-3 lines before/after) for clarity

**If no API changes:** Suppress this field.

## Migration Notes

- Breaking changes: [list]
- Client impact: [description]

**If no API changes:** Suppress this field.

**Important Notes on Diff Interpretation:**

- Git diffs can be misleading when methods are reordered or unrelated changes appear adjacent
- Always verify removals by checking the final state of the code in the PR branch
- Don't assume a `-` block followed by a `+` block means replacement - they might be unrelated
- When in doubt, read the actual files in the PR branch rather than relying solely on the diff

## Quality Checks

- ✓ All code changes analyzed
- ✓ **Verified final state**: Checked PR branch to confirm what actually exists after changes
- ✓ **Verified removals**: Confirmed removed endpoints/methods don't exist in final codebase
- ✓ **Verified additions**: Confirmed new endpoints/methods exist in final codebase
- ✓ **File location verified**: Confirmed changes are in the same file (not unrelated changes)
- ✓ **⚠️ Verified against OpenAPI schema**: Confirmed model changes are actually in the schema before declaring API breaking changes
- ✓ **Distinguished internal vs. public**: Separated internal refactorings from API contract changes
- ✓ Schema updates match analysis (only for confirmed API contract changes)
- ✓ Breaking changes documented (only if confirmed in OpenAPI schema)
- ✓ Original formatting preserved

## Output Files

Per `output.pr-changes-output`:

- `{{directory}}/{{codebase_name}}-pr-{pr_number}-analysis.md` - Analysis report
- `{{directory}}/{{codebase_name}}-openapi.json` - Updated schema (only if API changes confirmed)

**⚠️ Important:**
- The analysis report should document schema changes using **diffs of only the changed sections**
- Do NOT include the entire OpenAPI schema in the report or generate the entire OpenAPI schema file
- Only show the specific properties/schemas that were modified, with context
- The updated schema file should be saved separately **(only if changes were made)**

Example paths:

- `pr-changes-suggestions/2025-10-07-Claude-4-Sonnet-Cursor/session/session-pr-135-analysis.md`
- `pr-changes-suggestions/2025-10-07-Claude-4-Sonnet-Cursor/session/session-openapi.json` (only if changes are made)
