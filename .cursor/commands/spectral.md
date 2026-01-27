# Spectral Lint OpenAPI Schema

## Purpose

Validate OpenAPI schema files against VTEX quality rules defined in `.spectral.yml` using Context7 MCP server to simulate Spectral behavior.

## Usage

The user will specify the file path after `/spectral` command, like:

```
/spectral {schema-file-path}
```

**Examples:**
```
/spectral generated-docs/2025-10-28-Claude-4-Sonnet-Cursor/session/session-openapi.json
/spectral VTEX - Session Manager API.json
/spectral path/to/your-schema.json
```

## Instructions

> **PRIMARY METHOD**: Use real Spectral CLI for accurate linting results. Context7 simulation cannot perfectly replicate Spectral's complex rule engine, JSONPath expressions, and custom functions.

**CRITICAL RULE**: Custom Spectral rules are ALWAYS correct. Never assume rules are wrong or misconfigured. If a rule flags an issue, the OpenAPI schema must be fixed to comply with the rule, not the other way around. If you cannot fix an issue programmatically, provide specific manual fix instructions.

### Process

1. **Run Real Spectral CLI** (Primary Method)
   - Execute: `spectral lint "{file-path}" --ruleset .spectral.yml --format json`
   - Parse the JSON output for exact line numbers and rule violations
   - This is the ONLY way to get 100% accurate results

2. **Parse Spectral Output**
   - Extract exact line numbers, rule names, and violation details
   - **IMPORTANT**: Understand Spectral severity levels:
     - **Severity 0 = ERROR** (must be fixed)
     - **Severity 1 = WARNING** (should be addressed)
     - **Severity 2 = INFO** (informational only)
   - Group by severity: errors (0), warnings (1), info (2)
   - Identify specific JSONPath locations for each violation

3. **Iterative Fix Process** (Maximum 3 attempts)
   - **Attempt 1-3**: For each attempt:
     - Report ALL issues with **exact line numbers**
     - **ALWAYS assume the rule is correct** - fix the OpenAPI schema to comply
     - Fix identified issues in the OpenAPI file
     - Re-run Spectral simulation immediately
     - Continue until NO errors remain OR max attempts reached
   - **If max attempts reached**: Provide detailed manual fix instructions
   - **NEVER suggest the rule is wrong** - only provide schema fixes

4. **Final Report** with comprehensive results

### **Spectral Report Format**

Use this standardized format for all Spectral reports. **ALWAYS provide detailed reports for ALL retry attempts:**

```
## 🔍 SPECTRAL LINT RESULTS

### Attempt 1/3 - Initial Scan:
- **Errors**: X
- **Warnings**: Y  
- **Info**: Z
- **Total Issues**: N

### Issues Found (Attempt 1):

#### ❌ ERROR: `rule-name`
**Location**: Line X (exact line number in file)
**Path**: `$.path.to.issue`  
**Issue**: Brief description  
**Fix**: What needs to be changed

#### ⚠️ WARNING: `rule-name`
**Location**: Line X (exact line number in file)
**Path**: `$.path.to.issue`  
**Issue**: Brief description  
**Fix**: What needs to be changed

### Fixes Applied (Attempt 1):
✅ Fixed [brief description] at line X
✅ Fixed [brief description] at line Y

### Attempt 2/3 - Re-scan After Fixes:
- **Errors**: X (remaining)
- **Warnings**: Y (remaining)
- **Total Issues**: N (remaining)

### Issues Found (Attempt 2):
[List remaining issues with same format as Attempt 1]

### Fixes Applied (Attempt 2):
[List fixes made in this attempt]

### Attempt 3/3 - Re-scan After Fixes:
- **Errors**: X (remaining)
- **Warnings**: Y (remaining)
- **Total Issues**: N (remaining)

### Issues Found (Attempt 3):
[List remaining issues with same format as previous attempts]

### Fixes Applied (Attempt 3):
[List fixes made in this attempt]

### Final Results:
- **Initial Issues**: N
- **Final Issues**: 0 OR remaining count
- **Issues Fixed**: N
- **Pass Rate**: X%
- **Attempts Used**: X/3

✅ SPECTRAL PASSED - All issues resolved!
OR
⚠️ SPECTRAL INCOMPLETE - Manual fixes needed (see below)

### Manual Fix Instructions (if max attempts reached):
**Remaining Issues Requiring Manual Attention:**

1. **Line X**: [Specific instruction]
2. **Line Y**: [Specific instruction]

**Recommendation**: Apply the above fixes manually and re-run `/spectral {file-path}` to verify.
```

## Rule Configuration

The `.spectral.yml` file:
- **Extends**: `spectral:oas` (standard OpenAPI rules)
- **Disables**: `path-params`, `operation-operationId`, `oas3-examples-value-or-externalValue`, `oas3-unused-component`, `info-contact`
- **Sets Custom VTEX-specific rules**


## Fallback Method

If Spectral CLI is unavailable in the current environment:
1. **Context7 Simulation** (Less Accurate):
   - Use Context7 MCP to access Spectral documentation
   - Manually analyze rules against OpenAPI content
   - **WARNING**: This method cannot perfectly replicate Spectral's behavior
   - Results may differ from actual Spectral CLI output
2. **Manual Analysis**: Read `.spectral.yml` and manually check each rule
3. **External Terminal**: Run `spectral lint "{file-path}" --ruleset .spectral.yml` and copy results

## Critical Requirements

- **Rules Are Always Correct**: NEVER question or suggest rules are misconfigured
- **Schema Must Comply**: Always fix the OpenAPI schema to match rule requirements
- **Exact Line Numbers**: MUST provide precise line numbers for every issue found
- **Iterative Process**: MUST attempt fixes and re-run up to 3 times automatically
- **No Premature Success**: NEVER report success until ALL errors are resolved
- **Complete Fix Tracking**: Track every fix attempt with line numbers
- **Manual Instructions**: If max attempts reached, provide specific line-by-line instructions

## Notes

- **Real Spectral CLI**: Primary method for 100% accurate results
- **Context7 Simulation**: Fallback method with limited accuracy
- **Rule Hierarchy**: Base `spectral:oas` rules + custom `.spectral.yml` overrides
- **Standardized Reporting**: All reports must follow the exact format specified
- **VTEX Standards**: The `.spectral.yml` ruleset includes VTEX-specific OpenAPI standards
- **Command format**: `/spectral {schema-file-name}` where you replace `{schema-file-name}` with your actual file path
- **Limitation**: Perfect simulation of Spectral's JSONPath engine and custom functions is not possible without the actual CLI