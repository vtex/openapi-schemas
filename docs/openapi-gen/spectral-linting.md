# Spectral Linting for OpenAPI Schemas

## Overview

**Spectral** is an automated OpenAPI linter that validates schemas against quality rules and standards. This project uses **Context7 MCP server** to simulate Spectral behavior directly in Cursor, providing consistent results for all team members without external dependencies.

---

## Quick Start

### Command

```
/spectral {schema-file-name}
```

### Examples

```bash
# Lint a generated schema
/spectral generated-docs/2025-10-28-Claude-4-Sonnet-Cursor/session/session-openapi.json

# Lint a published schema
/spectral VTEX - Session Manager API.json

# Lint any schema file
/spectral path/to/your-schema.json
```

### What It Does

1. **Simulates Spectral** - Uses Context7 MCP to access Spectral documentation and simulate linting
2. **Identifies issues** - Systematically checks all custom rules against OpenAPI content  
3. **Auto-fixes issues** - Automatically corrects descriptions, formatting, etc.
4. **Re-validates** - Simulates Spectral again to verify all fixes
5. **Reports results** - Shows standardized pass rate and remaining issues

---

### Spectral rules

- **Base Rules**: `spectral:oas` (standard OpenAPI 3.0 validation rules)
- **Custom Configuration**: `.spectral.yml` (VTEX-specific overrides and additions)
- **Rule Processing**:
  1. Start with all standard Spectral OpenAPI rules
  2. Apply `.spectral.yml` overrides (some rules disabled, others added/modified)
  3. Final ruleset combines standard rules with VTEX-specific customizations
- **Focus**: Descriptions, examples, schemas, formatting, VTEX standards
- **Severity Levels**: 
  - **Error** (critical) - Must fix before publication
  - **Warning** (best practice) - Should fix for quality
  - **Info** (suggestion) - Nice to have

---

## Why Use Spectral?

### 1. Automated Quality Validation
- No manual checking of descriptions, examples, formats
- Consistent enforcement across all schemas
- Catches issues humans might miss

### 2. VTEX-Specific Standards
- Enforces company conventions (sentence case, permissions docs)
- Validates required sections (## Permissions)
- Ensures professional documentation quality

### 3. Quick Fixes
- Auto-fixes many common issues
- Saves time compared to manual editing
- Reduces review iterations

### 4. Common AI Generation Issues

Spectral catches issues AI-generated schemas frequently have:
- ❌ Empty or invalid descriptions
- ❌ Missing property descriptions
- ❌ Missing response examples
- ❌ Incorrect formatting (descriptions not ending with period)
- ❌ Missing permissions documentation
- ❌ Inconsistent naming conventions

---

## Using the Spectral Command

1. **Generate or locate your schema**
   ```
   /generate-openapi session
   ```

2. **Run Spectral**
   ```
   /spectral generated-docs/2025-10-31-Claude-4-Sonnet-Cursor/session/session-openapi.json
   ```

3. **Review iterative results**
   ```
   ## 🔍 SPECTRAL LINT RESULTS

   ### Attempt 1/3 - Initial Scan:
   - **Errors**: 10
   - **Warnings**: 12  
   - **Info**: 3
   - **Total Issues**: 25

   ### Issues Found:
   #### ❌ ERROR: `must-end-descriptions-with-period`
   **Location**: Line 1775 (exact line number in file)
   **Issue**: Description doesn't end with period  
   **Fix**: Add missing period to description

   ### Fixes Applied (Attempt 1):
   ✅ Fixed empty descriptions (10) at lines 45, 67, 89...
   ✅ Fixed missing property descriptions (8) at lines 123, 156...

   ### Attempt 2/3 - Re-scan After Fixes:
   - **Errors**: 2 (remaining)
   - **Warnings**: 0 (remaining)
   - **Total Issues**: 2 (remaining)

   ### Attempt 3/3 - Final Fixes:
   ✅ Fixed remaining issues at lines 234, 456

   ### Final Results:
   - **Initial Issues**: 25
   - **Final Issues**: 0
   - **Issues Fixed**: 25
   - **Pass Rate**: 100%
   - **Attempts Used**: 3/3

   ✅ SPECTRAL PASSED - All issues resolved!
   ```

4. **Manual fixes (if max attempts reached)**
   ```
   ⚠️ SPECTRAL INCOMPLETE - Manual fixes needed (see below)

   ### Manual Fix Instructions:
   **Remaining Issues Requiring Manual Attention:**

   1. **Line 567**: Add example field parallel to schema in response content
   2. **Line 789**: Fix description ending - add period after "data"
   3. **Line 1023**: Remove empty title field from schema property

   **Recommendation**: Apply the above fixes manually and re-run `/spectral {file-path}` to verify.
   ```

---

## Spectral Scoring

```
Spectral Score = 100 - (errors × 5) - (warnings × 2) - (info × 0.5)

Where:
- Errors = -5 points each (critical issues)
- Warnings = -2 points each (best practices)
- Info = -0.5 points each (suggestions)
- Minimum score = 0
- Maximum score = 100
```

### Score Examples

| Errors | Warnings | Info | Calculation | Score | Grade |
|--------|----------|------|-------------|-------|-------|
| 0 | 0 | 0 | 100 - 0 | **100** | ✅ Perfect |
| 1 | 2 | 4 | 100 - 5 - 4 - 2 | **89** | ✅ Good |
| 3 | 5 | 10 | 100 - 15 - 10 - 5 | **70** | ⚠️ Fair |
| 5 | 8 | 0 | 100 - 25 - 16 | **59** | ❌ Poor |
| 10 | 10 | 10 | 100 - 50 - 20 - 5 | **25** | ❌ Failing |
| 20+ | - | - | - | **0** | ❌ Critical |

### Target Metrics

- **Errors**: 0 (zero tolerance for critical issues)
- **Warnings**: ≤5 (minimal best practice violations)
- **Overall Spectral Score**: ≥90%
- **Ideal**: 100/100 (no issues)

---

## Context7 MCP Integration

### What is Context7 MCP?

This project uses **Context7 MCP (Model Context Protocol)** to simulate Spectral CLI behavior directly within Cursor. This provides:

- **Team Consistency**: All writers get identical linting results
- **No External Dependencies**: Works entirely within Cursor environment
- **Real-time Documentation**: Access to up-to-date Spectral library documentation
- **Standardized Reports**: Consistent formatting across all team members

### Automatic Setup

The repository includes `.cursor/mcp.json` which automatically configures Context7:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp-server"],
      "env": {}
    }
  }
}
```

**No manual setup required** - just clone the repository and open in Cursor.

### How It Works

1. **Context7 Access**: AI loads Spectral documentation via MCP server
2. **Rule Processing**: Applies both standard `spectral:oas` rules and custom `.spectral.yml` overrides
3. **Simulation**: Validates OpenAPI files against active rules
4. **Standardized Output**: Reports using consistent format across team

### Troubleshooting

If Spectral simulation isn't working:

1. **Restart Cursor**: Close and reopen to reload MCP servers
2. **Check Node.js**: Ensure Node.js 16+ is installed (`node --version`)
3. **Clear NPX Cache**: Run `npx clear-npx-cache` if needed
4. **Fallback**: Use external Spectral CLI as documented in `/spectral` command

### Benefits for Technical Writers

- **Consistent Results**: Same validation across all team members
- **No CLI Setup**: No need to install or configure Spectral CLI
- **Integrated Workflow**: Everything works within Cursor
- **Standardized Reports**: Identical formatting for all linting results
