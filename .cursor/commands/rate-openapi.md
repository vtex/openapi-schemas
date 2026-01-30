# Rate OpenAPI Schema Quality

## Purpose
Rate AI-generated OpenAPI schema quality by comparing it against the published official schema and running automated quality checks.

## Expected Input Format

When the user runs this command, they can provide:

**Option 1: Both schemas specified**
```
/rate-openapi
generated: generated-docs/2025-10-28-Claude-4-Sonnet-Cursor/session/session-openapi.json
published: VTEX - Session Manager API.json
```

**Option 2: Only generated schema (auto-find published)**
```
/rate-openapi tests/generation/2025-09-24 Claude 4 Sonnet Cursor/b2b-bulk-import-openapi.json
```

**Parse the input**:
1. Extract the generated schema file path
2. If published schema not provided:
   - Extract codebase name from generated file path (e.g., "b2b-bulk-import")
   - Look up corresponding published schema in `config.json` codebases array
   - Search for the file in the root directory
   - If not found, skip endpoints coverage and redistribute weights
3. Load schemas for comparison

## Auto-Discovery Logic

1. **Extract codebase name** from generated file path:
   - **Pattern 1**: `**/{{codebase-name}}-openapi.json` → extract from filename
   - **Pattern 2**: `**/{{codebase-name}}/{{codebase-name}}-openapi.json` → extract from folder name
   - Examples:
     - `b2b-bulk-import-openapi.json` → `b2b-bulk-import`
     - `tests\generation\2025-10-28-Claude-4-Sonnet-Cursor\b2b-bulk-import\b2b-bulk-import-openapi.json` → `b2b-bulk-import`

2. **Find published schema**:
   - Search `config.json` → `codebases` array for matching `name` field
   - Get corresponding `documentation` filename
   - Look for file in root directory: `{{documentation}}`

3. **Weight redistribution** (if published schema not found):
   - Remove Endpoints Coverage (25%)
   - Redistribute proportionally among remaining criteria:
     - Parameters: 15% → 20%
     - Request Bodies: 15% → 20%
     - Response Schemas: 15% → 20%
     - Spectral: 25% → 33%
     - Components: 2% → 3%
     - Metadata: 3% → 4%

## Instructions

Perform a comprehensive comparison between the generated and published OpenAPI schemas using the evaluation criteria below.

**Important**: For Spectral compliance evaluation (criterion 5), run Spectral linting exactly once with NO retries or fixes:

1. **Primary method**: Use direct terminal command: `spectral lint "{generated-schema-path}" --ruleset .spectral.yml --format json`
2. **Alternative**: Use `/spectral {generated-schema-path}` command if terminal unavailable
3. **NO RETRIES**: Accept the results as-is - do not attempt to fix issues or re-run
4. **NO FIXES**: Rate the schema in its current state - this is a quality assessment, not an improvement session

The goal is to evaluate the schema's current quality, not to improve it during rating.

**Output Requirements:**
1. **Save report using EXACT path structure from `rating-config.json`**:
   - Use `rating_output.report_filename` template: `ratings/{{yyyy-mm-dd}}-{{model_name}}-Cursor/{{codebase_name}}-rating-report.md`
   - Replace `{{yyyy-mm-dd}}` with current date (e.g., `2025-11-07`)
   - Replace `{{model_name}}` with model used (e.g., `Claude-4-Sonnet`)
   - Replace `{{codebase_name}}` with extracted codebase name (e.g., `b2b-bulk-import`)
   - **Example**: `ratings/2025-11-07-Claude-4-Sonnet-Cursor/b2b-bulk-import-rating-report.md`
   - **DO NOT** append additional dates or version numbers to filename
2. In chat, ONLY paste the final score line: "Score: XX/100 - [Grade]"
3. Do NOT add commentary, explanations, or additional text in chat
4. Let the saved report contain all the detailed analysis

### Evaluation Criteria & Scoring

> **Note**: The evaluation includes both **content completeness** (criteria 1-4, 6-7) and **structural quality** (criterion 5 - Spectral).

#### 1. **Endpoints Coverage** (Weight: 25% or SKIP if no published schema)

Compare `paths` objects:

- **Score Calculation**:
  - Base score: `(matching_endpoints / total_published_endpoints) × 100`
  - Cap at 100 (extra endpoints don't reduce score)
  - Missing critical endpoints: -10 points each
- **Identify**:
  - ✅ Matching endpoints (same path + method)
  - ❌ Missing endpoints (in published but not in generated)
  - ⚠️ Extra endpoints (in generated but not in published) - **NO PENALTY**
  - 🔄 Endpoints with path differences (similar but different paths)

**Example Output:**
```
Endpoints Coverage: 85/100 (85%)
- Total in Published: 45
- Total in Generated: 42
- Matching: 38
- Missing: 7 (15.5%)
- Extra: 4 (9.5%)
```

#### 2. **Parameters Completeness** (Weight: 15%)

For each endpoint, compare all parameters (path, query, header, cookie):

- **Score Calculation**: Average of `(params_in_generated / params_in_published) × 100` across all matching endpoints
- **Check**:
  - ✅ Matching parameters (name + location + type + required status)
  - ❌ Missing parameters
  - ⚠️ Parameter type mismatches
  - ⚠️ Required/optional mismatches
  - 📝 Description quality differences

**Example Output:**
```
Parameters Completeness: 78/100 (78%)
- Endpoints with 100% params: 25
- Endpoints with missing params: 13
- Critical missing params: 5 (required params missing)
```

#### 3. **Request Bodies Accuracy** (Weight: 15%)

For endpoints with request bodies:

- **Score Calculation**: `(matching_request_body_fields / total_request_body_fields) × 100`
- **Compare**:
  - ✅ Schema structure (properties, types, required fields)
  - ❌ Missing properties
  - ⚠️ Type mismatches
  - 📊 Nested object completeness
  - 🔢 Array items definitions
  - 📝 Examples provided
  - 📄 Description completeness

**Example Output:**
```
Request Bodies Accuracy: 82/100 (82%)
- Endpoints with request body: 18
- Fully matching schemas: 12
- Schemas with missing fields: 6
- Average field coverage: 82%
```

#### 4. **Response Schemas Accuracy** (Weight: 15%)

For all response codes (200, 201, 400, 401, 403, 404, 500, etc.):

- **Score Calculation**: `(matching_response_fields / total_response_fields) × 100`
- **Compare**:
  - ✅ Status codes present
  - ✅ Schema structure completeness
  - ❌ Missing response codes
  - ❌ Missing properties in response objects
  - ⚠️ Type mismatches
  - 📊 Nested object completeness
  - 🔢 Array items definitions
  - 📝 Examples provided
  - 📄 Description completeness

**Example Output:**
```
Response Schemas Accuracy: 75/100 (75%)
- Total response schemas: 156 (across all endpoints)
- Fully matching: 98
- Partially matching: 45
- Missing response codes: 13
- Average field coverage: 75%
```

#### 5. **Spectral Compliance** (Weight: 25%)

Run Spectral linting ONCE to validate schema quality and standards compliance:

- **Execution Rules**:
  - **Single run only** - no retries, no fixes, no iterations
  - **Assessment mode** - evaluate current state, don't improve it
  - **Accept results as-is** - this measures the schema's production readiness
- **Score Calculation**:
  - Primary: `spectral lint "{generated-schema}" --ruleset .spectral.yml --format json`
  - Alternative: `/spectral {generated-schema-path}` command if terminal unavailable
  - Calculate: Start at 100, deduct points based on severity:
    - **Error: -5 points each** (High Impact - Critical standards violations)
    - **Warning: -2 points each** (Medium Impact - Best practice violations)
    - **Info: -0.5 points each** (Low Impact - Suggestions)
  - Minimum score: 0
- **Pass Status Rules**:
  - ✅ **PASSED**: 0 errors (info allowed)
  - ⚠️ **NEEDS ATTENTION**: 1+ warnings but 0 errors
  - ❌ **FAILED**: 1+ errors (critical standards violations)
- **Check**:
  - ✅ No errors (critical standards violations)
  - ✅ No warnings (best practice violations)
  - ✅ No info issues (suggestions)
  - 📋 VTEX-specific rules compliance
- **Common Issues to Address**:
  - **Root object descriptions**: Request/response body root objects must have descriptions
  - **Property descriptions**: All nested properties must have descriptions
  - **Status code format**: Must follow "Title Case" or "Title Case\n\nSentence with period." format
  - **Examples placement**: Must be at schema level, not property level
  - 📝 Description quality standards
  - 🏗️ Schema structure standards

**Example Output:**
```
Spectral Compliance: 85/100 (85%)
- Command used: `/spectral {generated-schema-path}`
- Errors: 2 (-10 points)
- Warnings: 3 (-6 points)
- Info: 2 (-1 point)
- Total issues: 7
- Pass rate: 0 issues = 100%, 1-5 issues = 80-99%, 6-10 issues = 60-79%

Critical Issues:
❌ Error: no-empty-descriptions (3 instances)
⚠️ Warning: endpoint-permissions (2 instances)
```

**Spectral Rules Validated** (from `.spectral.yml`):
- Operation summaries required
- Response examples required
- Response schemas required
- No empty descriptions
- Parameters descriptions required
- Properties descriptions required
- Array items defined
- Descriptions end with period
- Status code format
- Tags in sentence case
- Endpoint permissions documentation
- Request/response body examples placement
- And more...

#### 6. **Schema Components** (Weight: 2%)

Compare reusable schemas in `components`:

- **Score Calculation**: `(matching_components / total_components) × 100`
- **Check**:
  - ✅ Shared schemas defined
  - ✅ Parameters definitions
  - ✅ Security schemes
  - ❌ Missing component schemas
  - 🔄 Component usage ($ref references)

**Example Output:**
```
Schema Components: 60/100 (60%)
- Components in published: 24
- Components in generated: 15
- Matching: 14
- Missing: 10
- Properly reused via $ref: 70%
```

#### 7. **Metadata & Documentation** (Weight: 3%)

Compare API-level information:

- **Score**: Binary or weighted based on completeness
- **Check**:
  - ✅ API title, description, version
  - ✅ Server configurations
  - ✅ Tags and organization
  - ✅ Security schemes definitions
  - ✅ External documentation links
  - 📝 Description quality and completeness

**Example Output:**
```
Metadata & Documentation: 90/100 (90%)
- Title: ✅ Match
- Version: ⚠️ Different (generated: 1.0.0, published: 2.1.0)
- Description: ✅ Present and comprehensive
- Servers: ✅ Match
- Tags: ⚠️ 8/10 tags present
- Security: ✅ Match
```

### Overall Score Calculation

```
Overall Score =
  (Endpoints × 0.25) +
  (Parameters × 0.15) +
  (Request Bodies × 0.15) +
  (Response Schemas × 0.15) +
  (Spectral Compliance × 0.25) +
  (Components × 0.02) +
  (Metadata × 0.03)
```

**Weight Rationale:**
- **Endpoints & Spectral (25% each)**: Critical foundation - highest priority, must have all endpoints AND pass quality checks
- **Parameters, Request Bodies, Response Schemas (15% each)**: Core API contract - equal importance for usability
- **Components (2%) & Metadata (3%)**: Minimal weight - nice to have but not critical

### Output Format

**IMPORTANT**: Keep the main report concise and actionable, with detailed analysis sections linked at the end.

```markdown
# OpenAPI Schema Rating Report

**Generated**: `[path]` | **Published**: `[path or "Auto-discovered" or "Not found"]` | **Date**: [date]

## 📊 Score: XX/100 - [Grade]

| Criteria | Weight | Score | Points | Details |
|----------|--------|-------|--------|---------|
| Endpoints Coverage | 25% | XX/100 | XX.X | [→ Analysis](#endpoints-analysis) |
| Parameters | 15% | XX/100 | XX.X | [→ Analysis](#parameters-analysis) |
| Request Bodies | 15% | XX/100 | XX.X | [→ Analysis](#request-bodies-analysis) |
| Response Schemas | 15% | XX/100 | XX.X | [→ Analysis](#response-schemas-analysis) |
| Spectral Compliance | 25% | XX/100 | XX.X | [→ Analysis](#spectral-analysis) |
| Components | 2% | XX/100 | XX.X | [→ Analysis](#components-analysis) |
| Metadata | 3% | XX/100 | XX.X | [→ Analysis](#metadata-analysis) |

**Grade Scale**: 90-100 Excellent | 80-89 Good | 70-79 Fair | 60-69 Poor | <60 Failing

---

## 🎯 Key Findings

### ✅ Strengths
- [Top 2-3 positive findings only]

### ❌ Critical Issues
1. **[Issue]** - [Impact] - [Quick fix]
2. **[Issue]** - [Impact] - [Quick fix]
3. **[Issue]** - [Impact] - [Quick fix]

### 📊 Spectral Issues: XX total (Errors: X | Warnings: X | Info: X)
**Top 3 Rules Violated:**
1. `rule-name` (X instances) - [Fix]
2. `rule-name` (X instances) - [Fix]
3. `rule-name` (X instances) - [Fix]

---

## 📋 Action Plan

### 🔥 High Priority
1. [Action with specific fix]
2. [Action with specific fix]

### ⚠️ Medium Priority
1. [Action with specific fix]
2. [Action with specific fix]

### 💡 Improvements
1. [Action with specific fix]

---

## 📈 Comparison Summary

| Aspect | Published | Generated | Status |
|--------|-----------|-----------|--------|
| Endpoints | X | X | ✅/⚠️/❌ |
| Parameters | X% match | X% coverage | ✅/⚠️/❌ |
| Request Bodies | X schemas | X% accurate | ✅/⚠️/❌ |
| Response Schemas | X schemas | X% accurate | ✅/⚠️/❌ |
| Components | X | X | ✅/⚠️/❌ |

**Missing Endpoints**: [List if any]
**Extra Endpoints**: [Count only - no penalty]

---

## 🎓 AI Generation Insights

**What worked well**: [1-2 patterns]
**Common issues**: [1-2 patterns]
**Recommendation for future**: [1 key insight]

---

# 📋 Detailed Analysis

## Endpoints Analysis

### Statistics
- Total endpoints in published: XX
- Total endpoints in generated: XX
- Matching endpoints: XX (XX%)
- Missing endpoints: XX (XX%)
- Extra endpoints: XX (XX%)

### ❌ Missing Endpoints
[Only if any missing]

| Method | Path | Description | Impact |
|--------|------|-------------|--------|
| GET | /api/example | [purpose] | High/Medium/Low |

### ⚠️ Extra Endpoints
[List with brief explanation]

| Method | Path | Reason | Value |
|--------|------|--------|-------|
| POST | /api/extra | [why it exists] | Positive/Neutral |

---

## Parameters Analysis

### Statistics
- Endpoints analyzed: XX
- Endpoints with 100% parameter match: XX
- Endpoints with missing parameters: XX
- Critical missing parameters (required): XX

### Critical Issues
[Only if significant issues]

**Endpoint**: `[METHOD] [PATH]`
- ❌ Missing required parameters: [list]
- ⚠️ Type mismatches: [list]
- 📝 Missing descriptions: [count]

---

## Request Bodies Analysis

### Statistics
- Endpoints with request body: XX
- Fully matching schemas: XX (XX%)
- Partially matching schemas: XX (XX%)
- Average field coverage: XX%

### Detailed Findings
[Only for endpoints with significant issues]

**Endpoint**: `[METHOD] [PATH]`
- Missing fields: [count] - [list main ones]
- Type mismatches: [list]
- Missing nested objects: [list]
- Example provided: ✅/❌

---

## Response Schemas Analysis

### Statistics
- Total response schemas: XX
- Fully matching: XX (XX%)
- Partially matching: XX (XX%)
- Missing response codes: XX
- Average field coverage: XX%

### Critical Issues
[Only for significant gaps]

**Endpoint**: `[METHOD] [PATH]`

| Status Code | Published | Generated | Issue |
|-------------|-----------|-----------|-------|
| 200 | ✅ | ✅ | Missing 5 fields: [list] |
| 404 | ✅ | ❌ | Response not defined |

---

## Spectral Analysis

### Spectral Lint Results

**Command**: `spectral lint "{generated-schema}" --ruleset .spectral.yml --format json`
**Execution**: Single run, no retries, no fixes applied
**Purpose**: Quality assessment of schema in current state

**Common Issues to Identify:**
- **`properties-description`**: Root objects in request/response bodies missing descriptions
- **`must-end-descriptions-with-period`**: Descriptions not ending with periods
- **`status-code-descriptions-format`**: Status descriptions not in proper format
- **`must-include-response-examples`**: Missing examples at schema level
- **`endpoint-permissions`**: Missing "## Permissions" sections in descriptions

### Statistics
- Total issues: XX
  - **Errors: XX (-5 points each)** - High Impact (Critical standards violations)
  - **Warnings: XX (-2 points each)** - Medium Impact (Best practice violations)
  - **Info: XX (-0.5 points each)** - Low Impact (Suggestions)
- Score: 100 - penalties = XX/100
- Pass status: ✅ PASSED (0 errors) / ⚠️ NEEDS ATTENTION (warnings only) / ❌ FAILED (1+ errors)

### Issues Breakdown

#### ❌ Errors (Critical - High Impact)
[Only if errors exist]

**All error-severity rules have HIGH IMPACT on the Spectral grade (-5 points each)**

| Rule | Count | Impact | Fix |
|------|-------|--------|-----|
| no-empty-descriptions | 5 | **High** | Add meaningful descriptions |
| properties-description | 8 | **High** | Add descriptions to root objects and all properties |
| status-code-descriptions-format | 3 | **High** | Fix status code description format |
| must-include-response-examples | 2 | **High** | Add examples at schema level |

#### ⚠️ Warnings (Best Practices - Medium Impact)
[Only if warnings exist]

**All warning-severity rules have MEDIUM IMPACT on the Spectral grade (-2 points each)**

| Rule | Count | Impact | Fix |
|------|-------|--------|-----|
| endpoint-permissions | 3 | **Medium** | Add permissions sections |
| summaries-sentence-case | 2 | **Medium** | Fix sentence case |

#### ℹ️ Info (Suggestions - Low Impact)
[Only top issues if many]

**All info-severity rules have LOW IMPACT on the Spectral grade (-0.5 points each)**

| Rule | Count | Impact | Fix |
|------|-------|--------|-----|
| must-end-descriptions-with-period | XX | **Low** | Add periods to descriptions |

---

## Components Analysis

### Statistics
- Components in published: XX
- Components in generated: XX
- Matching: XX
- Missing: XX

### Missing Components
[Only if significant impact]

| Component Name | Type | Usage Count | Impact |
|----------------|------|-------------|--------|
| UserSchema | schema | 5 endpoints | High |

### $ref Usage Analysis
- Appropriate $ref usage: XX%
- Duplicated schemas (should use $ref): [list if any]

---

## Metadata Analysis

| Element | Published | Generated | Match | Notes |
|---------|-----------|-----------|-------|-------|
| Title | [value] | [value] | ✅/❌ | [difference if any] |
| Version | [value] | [value] | ✅/❌ | [difference if any] |
| Description | [length] | [length] | ✅/❌ | [quality assessment] |
| Servers | [count] | [count] | ✅/❌ | [difference if any] |
| Tags | [count] | [count] | ✅/❌ | [organization quality] |
| Security Schemes | [count] | [count] | ✅/❌ | [completeness] |
```

---

## Scoring Philosophy

### Objective Scoring Principles

1. **Extra functionality is NOT penalized** - Generated schemas with additional endpoints/features get bonus consideration
2. **Missing critical elements ARE penalized** - Core functionality gaps reduce scores significantly
3. **Quality over quantity** - A well-documented subset beats a poorly documented superset
4. **Standards compliance matters** - Spectral issues directly impact production readiness

### Grade Interpretation

**Grades reflect production readiness, NOT comparison to published schema:**

- **90-100 Excellent**: Ready for tech writing review and publication
- **80-89 Good**: Minor fixes needed, mostly standards compliance
- **70-79 Fair**: Several quality issues, needs development iteration
- **60-69 Poor**: Significant gaps in core functionality or quality
- **<60 Failing**: Major structural problems, requires substantial rework

### When Generated > Published

If generated schema is more comprehensive than published:
- **Endpoints**: Score based on coverage of published + bonus for extras
- **Overall**: Higher scores possible when generated adds value
- **Grade**: Can exceed published schema quality grade

### Weight Redistribution (No Published Schema)

When published schema unavailable:
- **Skip**: Endpoints Coverage (25%)
- **Redistribute proportionally**:
  - Parameters: 15% → 20%
  - Request Bodies: 15% → 20%
  - Response Schemas: 15% → 20%
  - Spectral: 25% → 33%
  - Components: 2% → 3%
  - Metadata: 3% → 4%

## Implementation Notes

- Use `rating-config.json` for consistent scoring parameters
- Auto-discover published schemas via `config.json` mapping
- Focus on actionable feedback over verbose analysis
- Prioritize Spectral compliance and functional completeness
