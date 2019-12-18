# openapi-schemas
OpenApi 3.0 json schemas. Files are automatically synced to the developer docs pages

## Schema files

- The files should follow the JSON OpenApi 3.0 format [Specification](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md)
- Schema files shoud have a mnemonic file name that specify the API being described
- VTEX_TEMPLATE.json helps to port new APIs to spec

## Sync Automation

To get schema files to sync with our developer docs, they should be described at `.github\workflows\readme-github-sync.yml`.

Add this code to the action description to sync a new file:

```
- name: ReadMe API GitHub Sync
  uses: readmeio/github-readme-sync@1.0.1
  with:
    # The GITHUB_TOKEN secret
    repo-token: '${{ secrets.GITHUB_TOKEN }}'
    # The path for your API spec file
    api-file-path: # optional
    # Your API key for your ReadMe project
    readme-api-key: ${{ secrets.README_API_KEY }} # optional
    # ID for the API Setting in ReadMe - you can get that from the dashboard
    readme-api-id: # optional
    # ReadMe version to sync API into
    readme-api-version: # optional
```
