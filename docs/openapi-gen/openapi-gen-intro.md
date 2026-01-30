# OpenAPI Generation Introduction

Automate API documentation generation, review, and maintenance using AI agents.

This repository provides Cursor [Commands](https://cursor.com/pt-BR/docs/agent/chat/commands) and [Rules](https://cursor.com/pt-BR/docs/context/rules) to help technical writers manage VTEX OpenAPI documentation at scale. All workflows use a centralized `config.json` that maps VTEX APIs to their source repositories and OpenAPI schemas.

## Available Commands

### 1. Generate OpenAPI Documentation (`/generate-openapi`)

Generate comprehensive OpenAPI 3.0 documentation from source code.

- **Command**: `.cursor/commands/generate-openapi.md`
- **Usage Guide**: [How to Generate OpenAPI](generating-openapi.md)
- **Use when**: Creating new API documentation from scratch
- **Output**: `generated-docs/{date}-{model}-Cursor/{codebase}/`

### 2. Review Existing Documentation (`/review-openapi`)

Compare existing OpenAPI documentation with current code to identify gaps and improvements.

- **Command**: `.cursor/commands/review-openapi.md`
- **Usage Guide**: [How to Review OpenAPI](reviewing-openapi.md)
- **Use when**: Verifying and updating existing documentation
- **Output**: `reviewed-docs/{date}-{model}-Cursor/{codebase}/`

### 3. Analyze PR Changes (`/analyze-pr-changes-openapi`)

Analyze pull request changes to identify API impacts and generate schema updates.

- **Command**: `.cursor/commands/analyze-pr-changes-openapi.md`
- **Usage Guide**: [How to Analyze PR Changes](analyzing-pr-changes-openapi.md)
- **Use when**: Keeping documentation in sync with code changes
- **Output**: `pr-changes-suggestions/{date}-{model}-Cursor/{codebase}/`

### 4. Rate Schema Quality (`/rate-openapi`)

Rate AI-generated OpenAPI schemas by comparing against published schemas and running automated quality checks. High scores indicate readiness for technical writing review, not production readiness.

- **Command**: `.cursor/commands/rate-openapi.md`
- **Usage Guide**: [How to Rate OpenAPI Quality](rating-generated-openapi.md)
- **Use when**: Measuring generation success rate, tracking quality, identifying systematic gaps
- **Output**: `ratings/{date}-{model}-Cursor/`
- **Scoring**: 7 weighted criteria
  - **Endpoints (20%)** & **Spectral (20%)**: Critical foundation
  - **Parameters (17%)**, **Request Bodies (17%)**, **Response Schemas (16%)**: Core API contract
  - **Components (5%)** & **Metadata (5%)**: Supporting elements

### 5. Spectral Linting (`/spectral`)

Run automated quality checks on OpenAPI schemas using Context7 MCP to simulate Spectral linting.

- **Command**: `.cursor/commands/spectral.md`
- **Guide**: [Spectral Linting Guide](spectral-linting.md)
- **Usage**: `/spectral {schema-file-name}`
- **Example**: `/spectral generated-docs/2025-10-28-Claude-4-Sonnet-Cursor/session/session-openapi.json`
- **Method**: Context7 MCP usage to simulate Spectral linting
- **Use when**: Validating schema quality, fixing standards violations, ensuring VTEX compliance
- **Features**: Auto-fix descriptions, validate structure, enforce best practices, standardized reporting
- **Rules**: Defined in `.spectral.yml` (20+ VTEX-specific rules)
- **Note**: Also integrated into `/rate-openapi` scoring (25% weight)

## Project Structure

### Configuration

- `config.json` - Central configuration for all commands
  - Maps public VTEX APIs (`codebases[]` array)
  - Defines templates and output paths
  - Links source repos to OpenAPI schema files
- `rating-config.json` - Rating system configuration
  - Scoring criteria weights
  - Grading scale and thresholds
  - Target quality metrics

### Cursor Integration

- `.cursor/commands/` - Executable commands
- `.cursor/rules/` - Background knowledge rules
- `.cursor/mcp.json` - MCP server configuration

### Input/Output

- `api-repos/` - Source code repositories (cloned automatically)
- Root directory - Official VTEX OpenAPI schemas (all `VTEX - *.json` files)
- `examples/` - Reference documentation examples
- `templates/` - OpenAPI and overview templates
- `generated-docs/`, `reviewed-docs/`, `pr-changes-suggestions/` - Command outputs
- `ratings/` - Schema quality rating reports and tracking

## Quick Start

1. **Clone this repository**

   ```bash
   git clone https://github.com/vtex/openapi-gen-tester.git
   cd openapi-gen-tester
   ```

2. **Open in Cursor IDE**

3. **Run a command**
   
   **Generate API schemas:**
   - Type `/generate-openapi` to generate OpenAPI schemas for all APIs in config.json
   - Type `/generate-openapi {repository-name}` to generate a single OpenAPI
   - Type `/generate-openapi {repository-name-1}, {repository-name-2}, {repository-name-n}` for multiple APIs or multiple repository APIs

   **Review API schemas:**
   - Type `/review-openapi` to review all existing OpenAPI schemas against the implemented code
   - Type `/review-openapi {repository-name}` to review a single OpenAPI
   - Type `/review-openapi {repository-name-1}, {repository-name-2}, {repository-name-n}` for multiple APIs or multiple repository APIs
   
   **Analyze PR changes:**
   - Type `/analyze-pr-changes-openapi <PR_URL>` to analyze a specific pull request
   
   **Rate schema quality:**
   - Type `/rate-openapi` to compare generated schemas against published versions
   - Specify codebase name, date, and model when prompted
   - Get detailed report with scores (0-100), gaps, and prioritized fixes

4. **Review outputs**
   - Check the appropriate output directory for generated files
   - All outputs are timestamped and model-specific

## How It Works

All commands use:

- **Cursor Rules** (`.mdc` files) - Always-active background knowledge about project structure, OpenAPI standards, and API patterns
- **Cursor Commands** (`.md` files) - Executable instructions triggered manually
- **Central Config** (`config.json`) - Single source of truth for all VTEX APIs
