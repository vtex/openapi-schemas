# openapi-schemas
OpenApi 3.0 json schemas. Files are automatically synced to the developer docs pages

## Schema files

- The files should follow the JSON OpenApi 3.0 format [Specification](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md)
- Schema files shoud have a mnemonic file name that specifies the API being described
- VTEX_TEMPLATE.json is an example of a simple api. It shows how to represent endpoints and parameters. Also all server and auth configuration are as they should be for VTEX APIs.

## Sync Automation

To get schema files to sync with our developer docs, they should be described at `.github\workflows\readme-github-sync.yml`.

Add this code to the action description to sync a new file:

```yaml
- name: Sync ____________ API #Replace with API title
  uses: readmeio/github-readme-sync@1.0.1
  with:
    # The GITHUB_TOKEN secret
    repo-token: '${{ secrets.GITHUB_TOKEN }}' #Do not change
    # The path for your API spec file
    api-file-path: # .json files should be in the root folder
    # Your API key for your ReadMe project
    readme-api-key: ${{ secrets.README_API_KEY }} #Do not change
    # ID for the API Setting in ReadMe - you can get that from the dashboard
    readme-api-id: # optional
    # ReadMe version to sync API into
    readme-api-version: # optional
```

# Important Schema Details:

## Server

OpenApi describes the full endpoint for accessing the API as `{Server URL}` + `{endpoint Path}` + `{Path Parameters}`.
So a endpoint with `/api/getResults` as path in a schema with `https://example.com` as the url in the `server` object and no parameters will tell clients to send requests to `https://example.com/api/getResults`

Server Object Example: 

```json 
"servers": [
    {
        "url": "https://{accountName}.{environment}.com.br",
        "description": "VTEX server url",
        "variables": {
            "accountName": {
                "default": "apiexamples",
                "description": "Your VTEX account name"
            },
            "environment": {
                "enum": [
                    "vtexcommercestable",
                    "myvtex"
                ],
                "default": "vtexcommercestable"
            }
        }
    }
],
```
The `servers` key contains an array of server objects. But `Readme.io`, our documentation system, will select the first one and use default values for the variables

## Authentication

### Security Scheme

_Security schemes_ describe autentication types that are available in this API. you can check the all the options available int the [Security Scheme Spec](http://spec.openapis.org/oas/v3.0.0#security-scheme-object) 

**They should be inserted inside the _Components Object_** 

the ones we use for VTEX appKey and appToken are:

```json 
"securitySchemes": {
    "appKey": {
        "type": "apiKey",
        "in": "header",
        "name": "X-VTEX-API-AppKey"
    },
    "appToken": {
        "type": "apiKey",
        "in": "header",
        "name": "X-VTEX-API-AppToken"
    }
}
```

This tells the client that the request should have `X-VTEX-API-AppKey` and `X-VTEX-API-AppToken` as variables in the request header

### Security Requirement

If defined inside the _Open API Object_ the security requirement will define the required security schemes for all endpoints. If defined inside a path object, it will define a per-endpoint security scheme. 

The example we are currently using, defined inside the _Open API Object_, is:

```json 
"security": [
        {
            "appKey": [],
            "appToken": []
        }
    ]
```

## Examples

Example objects will be ignored by our documentation generator. If the desired outcome is to have the values as placeholders in the request parameters form, they should be inside the parameter schema object in the `default` key. 

# To Do:
## APIs to upload:
- [x] Catalog API
- [x] Checkout API
- [x] CMS - Change URI Schema
- [x] Customer Credit API - TODO: MARKDOWN
- [x] GiftCard System API - TODO: MARKDOWN
- [x] GiftCard Hub API - TODO: MARKDOWN
- [x] GiftCard API - TODO: MARKDOWN
- [x] GiftCard Provider Protocol - TODO: MARKDOWN
- [x] License Manager API
- [x] Logistics API - TODO: MARKDOWN
- [x] Master Data API - v10.2
- [x] Master Data API - v2
- [x] Orders API
- [x] Payment Provider Protocol - TODO: MARKDOWN
- [x] Payments Gateway API - TODO: MARKDOWN
- [x] Pricing API - TODO: MARKDOWN
- [x] Rates and Benefits API - TODO: MARKDOWN
- [x] Recurrence (v1 - deprecated) - TODO: MARKDOWN
- [x] Search API - TODO: MARKDOWN
- [x] Session Manager API
- [x] Subscriptions (v2) - TODO: MARKDOWN
- [x] Suggestions API - TODO: MARKDOWN
- [x] VTEX Do API - TODO: MARKDOWN
