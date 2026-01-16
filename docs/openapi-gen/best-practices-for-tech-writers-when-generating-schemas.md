# Best practices for technical writers when generating OpenAPI schemas

Follow these steps to ensure the automatically generated documentation is accurate, complete, and consistent with VTEX standards.

## 1. Validate the schema with Swagger

Verify that the OpenAPI schema is valid and renders correctly in the [Swagger preview VSCode / Cursor extension](https://marketplace.visualstudio.com/items?itemName=42Crunch.vscode-openapi) or pasting the file content in [Swagger editor](https://editor.swagger.io/). Check errors that appear in the Swagger preview.

## 2. Verify endpoint completeness

Collaborate with the product team to confirm:

* **Servers:** They are correct and applicable to the API.
* **Coverage:** Verify which endpoints should be documented, considering some might be internal only.
* **HTTP methods:** All operations are correctly represented (GET, POST, PUT, DELETE, PATCH).
* **Responses:** Responses and error messages are valid and complete.
* **Permissions:** Add predefined roles, if available. Follow guidelines in [Notion](https://www.notion.so/vtexhandbook/Endpoint-permissions-e359ebdc14ac40988095c9936f9db6d5).
* **Testing:** When possible, test endpoints for expected behaviors, edge cases, and error handling.

## 3. Run Spectral linting validation

Execute automated validation using [Spectral](https://docs.stoplight.io/docs/spectral/9ffa04e052cc1-spectral-cli) to identify errors and inconsistencies:

1. Create a `spectral` directory in your project root for output files.
2. Ensure Spectral CLI is installed: `npm install -g @stoplight/spectral-cli`
3. Run the following command, replacing placeholders with actual values:

  ```bash
spectral lint '{openapi-file-path}' -f json -o spectral/{api-name}_SPECTRAL_ERRORS.json --ruleset .spectral.yml
```

### Spectral review

1. Open the generated JSON file in `spectral/{api-name}_SPECTRAL_ERRORS.json`.
2. Address all errors (severity: 0) before publishing.
3. Review and fix warnings (severity: 1) when possible.
4. Document any intentional rule violations with justification.

## 4. Run Prism validation

Execute automated validation using [Prism](https://docs.stoplight.io/docs/prism/674b27b261c3c-prism-overview) to verify the schema works correctly:

>⚠️ You must have [Node.js](https://nodejs.org) installed on your machine to use this command.

Run the following command on Cursor chat, replacing the placeholder with the actual value:

```
/run-prism-validation {openapi-file-path}
```

This command will:

* Validate the OpenAPI schema using Prism.
* Generate a validation report in `prism/[prefix] {api-name} - {date}.md`.

**Output file naming:**

* `[prefix]`: `[AI generated]`, for schemas generated/reviewed from code, or `[Dev Portal]`, for schemas from published `openapi-schemas` repository.
* `{api-name}`: Lowercase identifier for the output file.
* `{date}`: Current date of the test in `yyyy-mm-dd` format.

### Prism review

1. Open the generated file in `prism/[prefix] {api-name} - {date}.md`.
2. Review the validation results.
3. Address all validation errors before publishing.
4. (Optional) If you want to test specific endpoints manually, the Prism mock server may still be running. Check the validation report for the server URL (typically `http://127.0.0.1:4010`) and use Postman, curl, or your browser to test additional scenarios.

## 5. Review the API overview in `info.description`

Verify that the embedded markdown overview is complete and properly formatted:

* **Description:** Clear, concise explanation of the API's purpose and functionality.
* **Markdown escaping:** Uses single backslash escaping (`\r\n`, not `\\r\\n`).
* **Index section:** Contains categorized links to all endpoints using the correct HTTP method and URL format, as shown below:

  ```json
  "\r\n- ``POST`` [Create order modifications](https://developers.vtex.com/docs/api-reference/orders-api#/patch-/api/order-system/orders/-changeOrderId-/changes)"
  ```

* **Tag representation:** All endpoint categories (tags) appear in the index with their respective endpoints.
* **Common parameters table:** Documents server variables and authentication headers.

## 6. Review endpoint content

Verify that documentation is accurate and complete:

* **tag:** The tag is descriptive and used consistently.
* **summary:** Titles clearly describe the endpoint’s purpose.
* **description:** Descriptions are comprehensive, and provide sufficient context for usage.
* **parameters:** Path and query parameter definitions are descriptive, and include any constraints, formats, or default values.

## 7. Validate authentication and security schemes

Confirm that security configuration matches the API implementation:

* **Protected endpoints:** Check that each endpoint is documented with the correct set of credentials, defined in `components.securitySchemes`. Most VTEX endpoints use `appKey` + `appToken` and/or `VtexIdclientAutCookie` authentication. If any other credential is used in the generated schema, double check it with the product team.
* **Endpoints that do not require credentials:** Set `"security": []` at the operation level.
* **External services:** For APIs that depend on external authentication providers, include guidance directing users to consult their service provider for credentials.

## 8. Review request and response bodies

Ensure schemas and examples are complete and correctly structured:

* **Schema presence:** Each endpoint includes appropriate request body and response schemas where applicable.
* **Example placement:** Examples are defined at the schema level (parallel to `schema`, not nested within properties).
* **Realistic examples:** Examples demonstrate actual API usage with valid, representative data.
* **Required fields:** Request body schemas explicitly declare all mandatory fields in the `required` array.
* **Shared schemas:** Use `$ref` for schemas reused across multiple endpoints (e.g., common response objects, pagination structures).
