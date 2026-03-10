# How to Rate OpenAPI Schemas

## Overview

Rate AI-generated OpenAPI schemas by comparing them against official published schemas. This helps you:

- Track generation quality
- Identify systematic gaps
- Improve prompts based on results
- Measure progress over time

---

## Quick Start

1. Run the command, providing file paths, as exemplified:

   ```
   /rate-openapi
   generated: generated-docs/2025-10-28-Claude-4-Sonnet-Cursor/session/session-openapi.json
   published: VTEX - Session Manager API.json
   ```

2. Review the report saved to `ratings/` directory.

---

## 📊 Scoring System

### Rating Criteria

| Criterion | Weight | What it Measures |
| --------- | ------ | ---------------- |
| **Endpoints Coverage** | 20% | All endpoints present? |
| **Parameters Completeness** | 17% | All parameters correct? |
| **Request Bodies Accuracy** | 17% | Request schemas complete? |
| **Response Schemas Accuracy** | 16% | Response schemas complete? |
| **Spectral Compliance** | 20% | Passes quality/standards checks? |
| **Schema Components** | 5% | Components properly defined? |
| **Metadata & Documentation** | 5% | API info correct? |

### Overall Score Formula

```
Score = (Endpoints × 0.20) + (Parameters × 0.17) + (Request × 0.17) +
        (Response × 0.16) + (Spectral × 0.20) + (Components × 0.05) +
        (Metadata × 0.05)
```

### Grading Scale

| Score | Grade | Status | Action |
| ----- | ----- | ------ | ------ |
| 90-100 | A | ✅ Excellent | Minor polish → Tech writing review |
| 80-89 | B | ✅ Good | Fix critical → Tech writing review |
| 70-79 | C | ⚠️ Fair | Major fixes → Tech writing review |
| 60-69 | D | ⚠️ Poor | Significant rework needed |
| 0-59 | F | ❌ Failing | Re-generate |

> **Important**: All generated schemas require tech writing review before publication.

### Target Metrics

| Metric | Target |
| ------ | ------ |
| Endpoints Coverage | ≥ 95% |
| Parameters Completeness | ≥ 90% |
| Request Bodies Accuracy | ≥ 85% |
| Response Schemas Accuracy | ≥ 85% |
| Spectral Compliance | ≥ 90% |
| **Overall Score** | **≥ 80** |

---

## 🔍 Criteria summary

### 1. Endpoints Coverage (25%)

- ✅ All paths + methods present
- ❌ Missing endpoints
- ⚠️ Extra/hallucinated endpoints
- 🔄 Path differences

### 2. Parameters Completeness (15%)

- ✅ Path parameters (e.g., `{id}`, `{accountName}`)
- ✅ Query parameters (e.g., `?page=1&limit=10`)
- ✅ Header parameters (`Content-Type`, `Accept`, etc.)
- ✅ Correct types and `required` status
- 📝 Parameter descriptions

### 3. Request Bodies Accuracy (15%)

- ✅ All fields present
- ✅ Correct data types
- ✅ Nested objects complete
- ✅ Array items defined
- 📝 Examples at schema level
- 📄 Field descriptions

### 4. Response Schemas Accuracy (15%)

- ✅ All status codes (200, 201, 400, 401, 403, 404, 500)
- ✅ Response body schemas complete
- ✅ All response fields present
- ✅ Nested objects complete
- 📝 Examples at schema level

### 5. Spectral Compliance (25%)

- ✅ No linting errors (descriptions, schemas, etc.)
- ✅ Minimal warnings (best practices)
- ✅ VTEX-specific rules compliance
- 📋 Automated quality validation
- **Score**: 100 - (errors×5 + warnings×2 + info×0.5)
- **Command**: `/spectral {schema-file-name}`
- **Weight**: 25% (highest priority - equal to endpoints)

### 6. Schema Components (2%)

- ✅ Reusable schemas in `components`
- ✅ Proper `$ref` usage
- ✅ Parameter definitions
- ✅ Security schemes

### 7. Metadata & Documentation (3%)

- ✅ Title, description, version
- ✅ Server configurations
- ✅ Tags organization
- ✅ Security schemes defined

---

## Understanding Your Report

### 1. Overall Score

Quick overview showing total score and breakdown by criterion.

### 2. Detailed Findings

Each criterion section shows:
- Statistics (counts and percentages)
- Specific issues with examples
- Affected endpoints/fields
- Impact assessment (High/Medium/Low)

### 3. Top Issues

Prioritized list of critical problems to fix first.

### 4. Recommendations

- **High Priority**: Must fix
- **Medium Priority**: Should fix for quality
- **Low Priority**: Nice to have

---

## Common Issues & Solutions

### Low Endpoints Coverage (< 90%)

**Causes**:

- AI didn't explore entire codebase
- Non-standard routing patterns
- Controllers in unexpected locations

**Solutions**:

- Provide explicit list of controller files
- Review route configuration files
- Use more specific codebase search

---

### Low Parameters Completeness (< 85%)

**Causes**:

- Parameters defined in attributes/decorators
- Implicit parameters (accountName, environment)
- Inherited parameters from base controllers

**Solutions**:

- Review controller base classes
- Check authentication middleware
- Review VTEX-specific conventions

---

### Incomplete Response Schemas (< 80%)

**Causes**:

- Response types not explicitly defined
- Dynamic/runtime field generation
- Partial responses based on permissions

**Solutions**:

- Provide example API responses (Postman)
- Review response DTO classes
- Check for response mappers/transformers

---

### Low Spectral Compliance (< 90%)

**Causes**:

- Empty or missing descriptions
- Missing permissions documentation
- Incorrect formatting

**Solutions**:

- Run `/spectral` command for auto-fixes
- Add meaningful descriptions
- Include "## Permissions" sections
- See [Spectral Linting Guide](./spectral-linting.md)

---

## Example Report

```markdown
# OpenAPI Schema Rating Report

**Generated**: generated-docs/2025-10-28-Claude-4-Sonnet-Cursor/session/session-openapi.json
**Published**: VTEX - Session Manager API.json
**Date**: 2025-10-28

## 📊 Overall Score: 82/100 (Grade: B)

| Criteria | Score | Weighted |
| -------- | ----- | -------- |
| Endpoints | 85/100 | 21.25 |
| Parameters | 78/100 | 11.70 |
| Request Bodies | 80/100 | 12.00 |
| Response Schemas | 84/100 | 12.60 |
| Spectral | 85/100 | 21.25 |
| Components | 70/100 | 1.40 |
| Metadata | 95/100 | 2.85 |
| **Total** | | **83.05** |

## 🔍 Top 3 Critical Issues

1. **Missing Parameter**: accountName (8 endpoints)
   - Impact: High
   - Fix: Add to all path parameters

2. **Missing Response**: 404 Not Found (6 endpoints)
   - Impact: High
   - Fix: Define 404 error response schema

3. **Low Spectral Score**: 12 empty descriptions
   - Impact: Medium
   - Fix: Run `/spectral` for auto-fix

## ✅ What Was Done Well

- All major endpoints present (100% coverage)
- Request bodies comprehensive
- Security schemes correct
```

---

## Additional Resources

- **Command Reference**: `.cursor/commands/rate-openapi.md`
- **Configuration**: `rating-config.json`
- **Spectral Guide**: [spectral-linting.md](./spectral-linting.md)
- **System Summary**: [RATING-SYSTEM-SUMMARY.md](../RATING-SYSTEM-SUMMARY.md)
