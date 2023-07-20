


Describe your API in a brief paragraph. You may include:

- What players interact with the API (sellers, marketplaces, merchants in general, integrators, connectors, etc).
- What actions it accomplishes.
- Link to API Guides and Help documentation going over this product.

>ℹ️ Start here: check the new {xxxx} getting started guide. We created this guide to improve the onboarding experience for developers at VTEX. It assembles all documentation on our Developer Portal about {XXX} and is organized by focusing on the developer's journey.

## Endpoint requirements
You can point out any sensitive information like throttling, user permissions, etc. This can be added as a callout, instead of a heading, depending on the amount of information.


## Common parameters

You can add a table like the example below, going over frequently used parameters in the API Reference.

| Parameter name              | Description                                                                             |
|---------------------------|-----------------------------------------------------------------------------------------|
| `{{accountName}}`         | Store account name                                                                      |
| `{{environment}`          | The environment that will be called. Change for vtexcommercestable or vtexcommmercebeta |
| `{{X-VTEX-API-AppKey}}`   | Located in the headers of the requests, user authentication key                         |
| `{{X-VTEX-API-AppToken}}` | Located in the headers of the requests, authentication password                         |


## Index

Fill in the headings below with the categories appointed by the `tags` field in the API Reference.

### API reference Tag 1

- [Endpoint 1](link): description
- [Endpoint 2](link): description
- [Endpoint 3](link): description


### API reference Tag n

- [Endpoint 1](link): description
- [Endpoint 2](link): description
- [Endpoint 3](link): description

>⚠️ Remember to escape your markdown, and include it in the `description` field of your openapi file. Ex:
>```
>"openapi": "3.0.0",
>    "info": {
>        "title": "Antifraud Provider",
>        "description": "{{Add your description here}}",
>        "contact": {},
>        "version": "1.0"
>```
