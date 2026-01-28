# Navigation Update for API Reference

## Overview
Update the dev portal navigation file based on changes made to an OpenAPI specification file. This command uses git to detect what changed in the OAS and applies corresponding updates to the navigation structure.

## Steps

### 1. Identify the OpenAPI file
- Ask the user which OpenAPI file was updated (if not already specified in the command parameters)
- The file should be in the current workspace (openapi-schemas folder)

### 2. Analyze OAS changes using git
- Use git to identify what changed in the OpenAPI file
- Recommended git commands (use `--no-pager` to avoid interactive pagers):
  ```bash
  # See changes in the specific OAS file
  git --no-pager diff HEAD -- "path/to/file.json"
  
  # Or compare with a specific commit/branch
  git --no-pager diff main -- "path/to/file.json"
  
  # For recently committed changes
  git --no-pager show HEAD:"path/to/file.json"
  ```
- Focus on:
  - New or removed tags
  - New or removed endpoints (paths)
  - Modified endpoint paths or operations
  - Changes in tag organization

### 3. Load required files
- Read the navigation file: `../devportal/public/navigation.json`
- Read the updated OpenAPI file to understand the current state
- **Only if entire OAS files were added or removed**: Read the slug mappings from `../devportal/src/utils/constants.ts` (look for `export const openapiMappings:`)

### 4. Understand the hierarchy mapping
- **Category** → Usually corresponds to an OAS file (but can group multiple OAS files)
- **Subcategory** → Usually corresponds to an OAS tag within the same file
- **API ref page** → Corresponds to an individual request (endpoint + operation)

To identify if multiple OAS files share a category, check the slugs in the navigation file against the slug mappings.

### 5. Determine the changes needed
Based on the git diff analysis, identify which type of changes are needed:

#### New OAS file published
- **Add slug mapping**: Add a new entry to `openapiMappings` in `../devportal/src/utils/constants.ts`
  - Map the OAS filename to an appropriate slug (e.g., `'VTEX - Budgets API.json': 'budgets-api'`)
- Create a new category in the navigation file using the mapped slug
- Add all subcategories based on tags
- Add all API ref pages for each endpoint

#### Legacy OAS file removed
- **Remove slug mapping**: Remove the corresponding entry from `openapiMappings` in `../devportal/src/utils/constants.ts`
- Remove the entire category from the navigation file
- Verify no other references to this API exist in the navigation

#### Endpoints added to existing OAS
- Find the corresponding category in the navigation
- Add new pages under the appropriate subcategory (tag)
- If a new tag was introduced, create a new subcategory first

#### Endpoints and tags removed from OAS
- Find and remove the corresponding pages from the navigation
- If a subcategory (tag) no longer has any endpoints, remove the subcategory

#### Endpoints reorganized among tags
- Move pages between subcategories in the navigation file
- Maintain alphabetical or logical ordering within subcategories

### 6. Apply the updates
- **If entire OAS files were added or removed**: Update the slug mappings in constants.ts first
- Make the necessary edits to the navigation file
- Ensure proper JSON formatting and structure
- Preserve any existing ordering conventions

### 7. Verify the changes
- **If slug mappings were modified**: Verify the TypeScript constants file syntax is correct
- Validate the updated navigation JSON structure
- Check that all slugs are properly mapped and match the openapiMappings
- Confirm that the hierarchy is consistent

## Important Notes
- Always preserve the existing structure and formatting of the navigation file
- When adding new OAS files, create appropriate slug mappings following existing naming patterns (lowercase, hyphenated)
- Pay attention to slug mappings - they must match what's defined in `openapiMappings`
- If unsure about grouping or structure, check existing patterns in the navigation file
- Consider endpoint naming conventions when creating page titles
- Slug mappings are only needed when entire OAS files are added or removed, not for endpoint-level changes

### Git Command Best Practices for Agents
- Always use `git --no-pager` to prevent interactive pagers that wait for user input
- Use specific file paths to limit diff output
- Consider using `--no-color` if color codes interfere with parsing
- For staged changes, use: `git --no-pager diff --cached -- "file.json"`
- For unstaged changes, use: `git --no-pager diff -- "file.json"`

## Example Usage
```
/navigation-update-for-api-ref VTEX - Budgets API.json
```

## Checklist
- [ ] OpenAPI file identified and loaded
- [ ] Git diff analyzed for changes
- [ ] Navigation file loaded
- [ ] Slug mappings loaded (if entire OAS files added/removed)
- [ ] Category/subcategory structure determined
- [ ] Changes identified and categorized
- [ ] Slug mappings updated (if new API added or legacy API removed)
- [ ] Navigation file updated
- [ ] JSON and TypeScript structure validated
- [ ] Changes reviewed with user before committing
