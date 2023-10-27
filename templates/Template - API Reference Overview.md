# Template - API Reference Overview

Follow this template to write a markdown overview description of each API reference, which will be rendered in `https://developers.vtex.com/docs/api-reference/{api-slug}`, as in [this example](https://developers.vtex.com/docs/api-reference/promotions-and-taxes-api).

>⚠️ Remember to escape your markdown, and include it in the `description` field of your openapi JSON file. Example:
>```json
>"openapi": "3.0.0",
>    "info": {
>        "title": "Antifraud Provider",
>        "description": "{{Add your description here}}",
>        "contact": {},
>        "version": "1.0"
>```

Describe your API in a brief paragraph. You may include:

- What players interact with the API (sellers, marketplaces, merchants in general, integrators, connectors, etc).
- What actions it accomplishes.
- Link to API Guides and Help Center documentation going over this product.

If there is a getting started guide, add the following callout, replacing {productName} with the name of the product or feature the API refers to.

>ℹ️ Start here: check the new `{productName}` getting started guide. We created this guide to improve the onboarding experience for developers at VTEX. It assembles all documentation on our Developer Portal about  `{productName}` and is organized by focusing on the developer's journey.

## Endpoint requirements
You can point out any sensitive information like throttling, user permissions, etc. This can be added as a callout, instead of a heading, depending on the amount of information.

## Index

Fill in the headings below with the categories appointed by the `tags` field in the API Reference.

>ℹ Tip: you can use the [API Reference Index Generator](https://developers.vtex.com/editor/api-index) tool to create this markdown code automatically based on an object from [Developer Portal's navigation.json file](https://github.com/vtexdocs/devportal/blob/main/public/navigation.json).

### API reference Tag 1

- [Endpoint 1](link): description
- [Endpoint 2](link): description
- [Endpoint 3](link): description


### API reference Tag n

- [Endpoint 1](link): description
- [Endpoint 2](link): description
- [Endpoint 3](link): description

## Common parameters

You can add a table like the example below, going over frequently used parameters in the API Reference.

| Parameter name | Description | Type |
| - | - | - |
| `{{accountName}}` | Name of the VTEX account. Used as part of the URL. | Server variable. |
| `{{environment}` | Environment to use. Used as part of the URL. The default value is `vtexcommercestable`. | Server variable. |
| `X-VTEX-API-AppKey` | Unique identifier of the [application key](https://developers.vtex.com/docs/guides/api-authentication-using-application-keys). | Authentication header. Must be used together with `X-VTEX-API-AppToken`. Not necessary when using `VtexIdclientAutCookie`. |
| `X-VTEX-API-AppToken` | Secret token of the [application key](https://developers.vtex.com/docs/guides/api-authentication-using-application-keys). | Authentication header. Must be used together with `X-VTEX-API-AppKey`. Not necessary when using `VtexIdclientAutCookie`. |
| `VtexIdclientAutCookie` | [User token](https://developers.vtex.com/docs/guides/api-authentication-using-user-tokens), valid for 24 hours. | Authentication header. Not necessary when using `X-VTEX-API-AppKey` and `X-VTEX-API-AppToken`. |
