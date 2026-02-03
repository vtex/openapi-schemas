# openapi-schemas

This documentation comprises VTEX's public APIs as OpenAPI 3.0 JSON schemas. Files are automatically synced with VTEX's Developer Portal [API Reference page](https://developers.vtex.com/docs/api-reference) and can be imported to Postman following [these instructions](https://learning.postman.com/docs/postman/collections/working-with-openAPI/).

## Table of Contents

- [External contributions](#external-contributions)
- [Code of Conduct](#code-of-conduct)
- [API Slug Mapping](#api-slug-mapping)
- [VTEX APIs](#vtex-apis)
- [Requisites](#requisites)
  - [Servers](#servers)
  - [Authentication](#authentication)
    - [Security schemes](#security-schemes)
    - [Security requirement](#security-requirement)
- [AI-Powered Documentation](#ai-powered-documentation-vtex-internal)
- [GitHub Actions](#github-actions)
  - [Spectral Linter](#spectral-linter)
  - [Postman Collection Converter](#postman-collection-converter)

## External contributions

Please check our [Contributing Guide](CONTRIBUTING.md) for more information about how to contribute with this repository.

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## API Slug Mapping

The OpenAPI schema files in this repository follow a naming convention that integrates with the Developer Portal's centralized API slug mapping system. This ensures consistent URLs and naming across documentation.

Read the [Centralized API Slug Mapping](docs/centralized-api-slug-mapping.md) documentation to learn how API names are mapped to URL slugs and how to follow the naming conventions when adding new API schemas.

## VTEX APIs

- Antifraud Provider API ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?specUrl=https://raw.githubusercontent.com/vtex/openapi-schemas/master/VTEX%2520-%2520Antifraud%2520Provider%2520API.json&label=OpenAPI)
- Catalog API Seller Portal ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520Catalog%2520API%2520Seller%2520Portal.json&label=OpenAPI)
- Catalog API ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520Catalog%2520API.json&label=OpenAPI)
- Checkout API ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520Checkout%2520API.json&label=OpenAPI)
- Customer Credit API ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520Customer%2520Credit%2520API.json&label=OpenAPI)
- Data Subject Rights API ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?label=OpenAPI&specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520Data%2520Subject%2520Rights.json)
- GiftCard Hub API ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520GiftCard%2520Hub%2520API.json&label=OpenAPI)
- GiftCard API ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520Giftcard%2520API.json&label=OpenAPI)
- GiftCard Provider Protocol ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520Giftcard%2520Provider%2520Protocol.json&label=OpenAPI)
- Headless CMS API ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520Headless%2520CMS%2520API.json&label=OpenAPI)
- Intelligent Search API ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520Intelligent%2520Search%2520API.json)
- Intelligent Search Events API - Headless ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520Intelligent%2520Search%2520Events%2520API%2520-%2520Headless.json)
- Legacy CMS Portal API ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520Legacy%2520CMS%2520Portal%2520API.json)
- License Manager API ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520License%2520Manager%2520API.json&label=OpenAPI)
- Logistics API ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520Logistics%2520API.json&label=OpenAPI)
- Marketplace APIs - Sent Offers ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520Marketplace%2520APIs%2520-%2520Sent%2520Offers.json&label=OpenAPI)
- Marketplace APIs - Suggestions ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520Marketplace%2520APIs%2520-%2520Suggestions.json&label=OpenAPI)
- Marketplace Protocol - External Marketplace Mapper ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520Marketplace%2520Protocol%2520-%2520External%2520Marketplace%2520Mapper.json&label=OpenAPI)
- Marketplace Protocol - External Marketplace Orders ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520Marketplace%2520Protocol%2520-%2520External%2520Marketplace%2520Orders.json&label=OpenAPI)
- Marketplace Protocol - External Seller Fulfillment ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520Marketplace%2520Protocol%2520-%2520External%2520Seller%2520Fulfillment.json&label=OpenAPI)
- Marketplace Protocol - External Seller Marketplace ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520Marketplace%2520Protocol%2520-%2520External%2520Seller%2520Marketplace.json&label=OpenAPI)
- Master Data API - v1 ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520MasterData%2520API%2520-%2520v10.2.json&label=OpenAPI)
- Master Data API - v2 ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520Master%2520Data%2520API%2520-%2520v2.json&label=OpenAPI)
- Message Center API ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520Message%2520Center%2520API.json&label=OpenAPI)
- Orders API ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520Orders%2520API.json&label=OpenAPI)
- Orders API - PII data architecture ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Frefs%2Fheads%2Fmaster%2FVTEX%2520-%2520Orders%2520API%2520PII%2520version.json)
- Payment Provider Protocol ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?label=OpenAPI&specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520Payment%2520Provider%2520Protocol.json)
- Payments Gateway API ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?label=OpenAPI&specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520Payments%2520Gateway%2520API.json)
- Policies System API ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?label=OpenAPI&specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520Policies%2520System%2520API.json)
- Pricing API ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?label=OpenAPI&specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520Pricing%2520API.json)
- Pricing Hub ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?label=OpenAPI&specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520Pricing%2520Hub.json)
- Profile System API ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?label=OpenAPI&specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520Profile%2520System.json)
- Promotions & Taxes API - v2 ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?label=OpenAPI&specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520Promotions%2520%2526%2520Taxes%2520API%2520-%2520v2.json)
- Promotions & Taxes API ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?label=OpenAPI&specUrl=https://raw.githubusercontent.com/vtex/openapi-schemas/master/VTEX%2520-%2520Promotions%2520%26%2520Taxes%2520API.json)
- Reviews and Ratings API ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?label=OpenAPI&specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520Reviews%2520and%2520Ratings%2520API.json)
- SKU Bindings API ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?label=OpenAPI&specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520SKU%2520Bindings%2520API.json)
- Search API ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?label=OpenAPI&specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520Search%2520API.json)
- Session Manager API ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?label=OpenAPI&specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520Session%2520Manager%2520API.json)
- Subscriptions API (v3) ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Frefs%2Fheads%2Fmaster%2FVTEX%2520-%2520Subscriptions%2520API%2520v3.json)
- VTEX Tracking API ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?label=OpenAPI&specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520Tracking.json)
- VTEX DO API ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?label=OpenAPI&specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520VTEX%2520Do%2520API.json)
- VTEX ID API ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?label=OpenAPI&specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520VTEX%2520ID%2520API.json)
- VTEX Shipping Network API ![Swagger Validator](https://img.shields.io/swagger/valid/3.0?label=OpenAPI&specUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fvtex%2Fopenapi-schemas%2Fmaster%2FVTEX%2520-%2520VTEX%2520Shipping%2520Network%2520API.json)

## Requisites

Before contributing to this repository, read the following requisites.

- The files should follow the JSON [OpenAPI 3.0 Specification](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md).
- Check our internal [OpenAPI Specification guidelines](https://www.notion.so/vtexhandbook/OpenAPI-Specification-guidelines-e3a681454798496292d6648e184a156e#344d2fc637c146ffa2ed61a119aa39ee) to make sure you meet the required file structure.
- Schema files should have a self-explanatory name that specifies the described API.
- Check [`templates/VTEX - Template openAPI.jsonc`](https://github.com/vtex/openapi-schemas/blob/master/templates/VTEX%20-%20Template%20openAPI.jsonc) to see an example of an API schema file. It shows how to represent endpoints and parameters and includes VTEX's default [`servers`](#servers) and [authorization](#authorization) information.

### Servers

OpenAPI describes the full endpoint for accessing the API as `{server URL}` + `{endpoint path}` + `{path parameters}`.

Example: an endpoint with `/api/getResults` as the path, `https://example.com` as the URL in the `server` object and no parameters will send requests to the `https://example.com/api/getResults` URL.

Example - `servers` object:

```json
"servers": [
    {
        "url": "https://{accountName}.{environment}.com.br",
        "description": "VTEX server URL.",
        "variables": {
            "accountName": {
                "description": "Name of the VTEX account. Used as part of the URL.",
                "default": "apiexamples"
            },
            "environment": {
                "description": "Environment to use. Used as part of the URL.",
                "enum": [
                    "vtexcommercestable"
                ],
                "default": "vtexcommercestable"
            }
        }
    }
],
```

The `servers` key contains an array of objects.

### Authentication

#### Security schemes

Security schemes describe autentication types that are available in the API. You can check the all the available options in the [Security Scheme Specification](http://spec.openapis.org/oas/v3.0.0#security-scheme-object).

They should be added inside the `components` object.

The security schemes we use are:

```json
"securitySchemes": {
    "appKey": {
        "type": "apiKey",
        "in": "header",
        "name": "X-VTEX-API-AppKey",
        "description": "Unique identifier of the [API key](https://developers.vtex.com/docs/guides/api-authentication-using-api-keys)."
    },
    "appToken": {
        "type": "apiKey",
        "in": "header",
        "name": "X-VTEX-API-AppToken",
        "description": "Secret token of the [API key](https://developers.vtex.com/docs/guides/api-authentication-using-api-keys)."
    },
    "VtexIdclientAutCookie": {
        "type": "apiKey",
        "in": "header",
        "name": "VtexIdclientAutCookie",
        "description": "[User token](https://developers.vtex.com/docs/guides/api-authentication-using-user-tokens), valid for 24 hours."
    }
}
```

#### Security requirement

If defined inside the Open API schema, the `security` object will define the required security schemes for all endpoints. This specifies that requests should have the `X-VTEX-API-AppKey` and `X-VTEX-API-AppToken` pair or `VtexIdClientAutCookie` as part of the request header.

If defined inside an endpoint object, the `security` object will define the security scheme for that specific endpoint.

The `security` object we use at VTEX is:

```json
"security": [
        {
            "appKey": [],
            "appToken": []
        },
        {
            "VtexIdclientAutCookie": []
        }
    ]
```

## AI-Powered Documentation

> ⚠️ These tools are available exclusively for VTEX technical writers working in Cursor IDE. External contributors should follow the [Contributing Guide](CONTRIBUTING.md) for manual contributions.

This repository includes Cursor IDE commands for automated OpenAPI generation and maintenance:

### Available Commands

- **`/generate-openapi`** - Generate OpenAPI schemas from source code
- **`/review-openapi`** - Review and update existing OpenAPI schemas
- **`/rate-openapi`** - Evaluate schema quality with automated scoring
- **`/analyze-pr-changes`** - Analyze PR changes for API impacts
- **`/spectral`** - Run Spectral linting and validate schemas

### Documentation

Complete guides are available in the [`docs/openapi-gen/`](docs/openapi-gen/) directory:

- [OpenAPI Generation Introduction](docs/openapi-gen/openapi-gen-intro.md) - Overview of all commands
- [Generating OpenAPI](docs/openapi-gen/generating-openapi.md) - Generate schemas from code
- [Reviewing OpenAPI](docs/openapi-gen/reviewing-openapi.md) - Update existing schemas
- [Rating Generated OpenAPI](docs/openapi-gen/rating-generated-openapi.md) - Quality evaluation
- [Analyzing PR Changes](docs/openapi-gen/analyzing-pr-changes-openapi.md) - PR impact analysis
- [Spectral Linting](docs/openapi-gen/spectral-linting.md) - Schema validation

Learn more in the [OpenAPI Generation Introduction](docs/openapi-gen/openapi-gen-intro.md).

## GitHub Actions

This repository uses GitHub Actions for automated workflows that help maintain code quality and generate necessary artifacts. Below are the details of each action:

### Spectral Linter

**Source File:** `.github/workflows/linter.yml`

**Summary:** This action runs Spectral to lint OpenAPI specification files when pull requests are created or updated. It helps maintain consistency and quality in API specifications.

**Trigger Conditions:**
- On pull request creation or update

**Dependencies:**
- `actions/checkout@v4`: Checks out the repository code
- `mshick/add-pr-comment@v2`: Adds automated comments to pull requests
- `stoplightio/spectral-action@v0.8.10`: Runs the Spectral linter on OpenAPI files

### Postman Collection Converter

**Source File:** `.github/workflows/portman.yml`

**Summary:** This action automatically converts OpenAPI specifications to Postman Collections when changes are made to JSON files in pull requests targeting the master branch.

**Trigger Conditions:**
- On pull request to master branch

**Dependencies:**
- `actions/checkout@v2`: Checks out the repository code
- `actions/setup-node@v2`: Sets up Node.js environment
- `@apideck/portman`: NPM package for converting OpenAPI specs to Postman collections
- `ad-m/github-push-action@v0.6.0`: Pushes generated files back to the repository
