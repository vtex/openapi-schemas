# Agent PR Changes Setup Instructions [WIP]

Analyze pull request changes to identify API impacts and update OpenAPI schemas using the `/analyze-pr-changes-openapi` Cursor Command.

## What This Does

Analyzes a GitHub pull request to:

- Identify code changes affecting exposed APIs
- Detect endpoint, parameter, and model changes
- Compare against existing OpenAPI schema
- Generate detailed analysis report
- Create updated schema with only affected sections modified

## Files Used

### Command

- `.cursor/commands/analyze-pr-changes-openapi.md` - Executable instructions

### Rules (Applied Automatically)

- `.cursor/rules/project-structure.mdc` - Project organization
- `.cursor/rules/openapi-standards.mdc` - VTEX OpenAPI standards
- `.cursor/rules/api-patterns.mdc` - Code pattern recognition

### Configuration

- `config.json` - Central configuration with public VTEX APIs
  - `codebases[]` - Maps repository names to OpenAPI schema files
  - `output.pr-changes-output` - Output path templates

## Prerequisites

1. **Cursor IDE** with the repository open
2. **GitHub Access**: Ability to clone repositories and fetch PRs
3. **PR URL**: The GitHub pull request URL you want to analyze
4. **Matching Config**: The PR's repository must have a matching entry in `config.json` `codebases[]` array

## Execution

### Usage

Type in Cursor with your PR URL:

```
/analyze-pr-changes-openapi https://github.com/vtex/{repository-name}/pull/{pr-number}
```

Example:

```
/analyze-pr-changes-openapi https://github.com/vtex/session/pull/135
```

### What Happens

1. **Repository Setup**
   - Clones target repository into `api-repos/`
   - Fetches PR changes

2. **Configuration Lookup**
   - Extracts repository name from PR URL
   - Searches `config.json` for matching `name` field
   - Gets corresponding `documentation` field (OpenAPI schema filename)
   - Example: `"session"` → `"VTEX - Session Manager API.json"`

3. **Analysis**
   - Generates git diff for the PR
   - Identifies API-impacting changes (controllers, models, routes, DTOs)
   - Detects field changes (additions, removals, renames, type changes)
   - Notes serialization changes (casing, attributes)

4. **Schema Update**
   - Copies original schema from the root directory
   - Applies ONLY changes documented in analysis
   - Updates version number
   - Maintains original formatting

5. **Report Generation**
   - Creates detailed analysis markdown
   - Documents all changes with code diffs
   - Lists schema updates required
   - Includes migration notes for breaking changes

## Output Structure

Files are saved in: `pr-changes-suggestions/{yyyy-mm-dd}-{model_name}-Cursor/{repository}/`

Example for `session` PR #135 on 2025-10-07 using Claude-4-Sonnet:

```
pr-changes-suggestions/2025-10-07-Claude-4-Sonnet-Cursor/session/
├── session-pr-135-analysis.md        # Detailed analysis report
└── session-openapi.json              # Updated schema (only if changes needed)
```

## Analysis Report Structure

```markdown
# API Change Analysis Report - {Repository} PR #{Number}

## Analysis Context

- PR URL and date
- Schema file updated

## Summary

- Files analyzed
- Files with API changes
- Affected endpoints

## Detailed Changes

For each changed file:
- Code diff
- Impact analysis
- Required schema updates

## Migration Notes

- Breaking changes
- Client impact
```

## Review Process

1. **Read the Analysis Report**
   - Understand what API changes were detected
   - Review code diffs and their interpretations
   - Check migration notes for breaking changes

2. **Verify the Updated Schema**
   - Compare original (root directory) vs. updated schema
   - Ensure only relevant sections were modified
   - Confirm version number was updated
   - Validate it's still valid OpenAPI 3.0 JSON

3. **Create OpenAPI Schemas PR**
   - Use the updated schema file
   - Include the analysis report in PR description
   - Link to the original product repo PR

## Notes

- **Merged PRs**: The command works with both open and merged PRs
- **No Changes**: If no API-impacting changes are found, the report will state this explicitly
- **Private Repos**: Requires appropriate Git credentials for private repositories
- **Schema Precision**: Only sections affected by the PR are modified; all other content remains identical to the original
