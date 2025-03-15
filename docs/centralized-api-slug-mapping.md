# Centralized API Slug Mapping

This document explains the centralized API slug mapping system in the VTEX Developer Portal and how it relates to the OpenAPI schemas in this repository.

## Overview

The Developer Portal uses a centralized mapping system to consistently map API display names to URL slugs across the platform. This ensures that API references are consistently linked and referenced throughout the documentation.

The centralized mapping is defined in the `api-slug-mapping.ts` file in the Developer Portal codebase, which serves as the single source of truth for API name-to-slug mappings.

## How the Mapping Works

The mapping system uses a TypeScript Map to associate the human-readable API display names with URL-friendly slugs. For example:

```typescript
// Example from api-slug-mapping.ts
export const fileSlugMap = new Map<string, string>([
  ["Antifraud Provider", "antifraud-provider-api"],
  ["Catalog API", "catalog-api"],
  ["Checkout API", "checkout-api"],
  // ... other mappings
]);
```

## Relationship with OpenAPI Schemas

The OpenAPI schemas in this repository follow a naming convention that typically includes the API display name:

- OpenAPI schema files are named: `VTEX - {API Display Name}.json`
- The corresponding URL slug in the Developer Portal is: `{api-slug}`

For example:
- OpenAPI schema file: `VTEX - Catalog API.json`
- Developer Portal URL: `https://developers.vtex.com/docs/api-reference/catalog-api`

## Benefits of Centralized Mapping

1. **Consistency**: Ensures that API references maintain consistent URLs and naming throughout the documentation.
2. **Maintainability**: Single point of update when API names change or new APIs are added.
3. **Type Safety**: Using TypeScript provides type checking for API name references.
4. **Integration**: Facilitates integration between content repositories, API schemas, and the Developer Portal.

## Adding New APIs

When adding a new API schema to this repository:

1. Name your OpenAPI file following the pattern: `VTEX - {API Display Name}.json`
2. Ensure the API display name and corresponding slug are added to the `api-slug-mapping.ts` file in the Developer Portal repository.
3. Use the same API display name in the `title` field of your OpenAPI schema.

## Related Documentation

- [Developer Portal Repository](https://github.com/vtex/devportal)
- [Developer Portal Content Repository](https://github.com/vtex/dev-portal-content)
- [OpenAPI Schemas Repository](https://github.com/vtex/openapi-schemas)
- [Centralized API Slug Mapping Guide](https://github.com/vtex/dev-portal-content/docs/guides/Using-this-API-Reference/centralized-api-slug-mapping.md) 