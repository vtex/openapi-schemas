API for managing audiences and mapping [price tables](https://help.vtex.com/en/tutorial/setting-up-price-tables-for-specific-users--5S9oDOMHNmY4K0kAewAiWY) to these audiences for contextual seller pricing.

## Index

### Audience Manager

- `POST` [Fetch audience](https://developers.vtex.com/docs/api-reference/audience-api/#post-/api/audience-manager/pvt/audience)

### Price Table Mapper

- `GET` [Get price table mapping](https://developers.vtex.com/docs/api-reference/audience-api/#get-/api/price-table-mapper/pvt/mapping/-audienceId-)
- `PUT` [Set price table mapping](https://developers.vtex.com/docs/api-reference/audience-api/#put-/api/price-table-mapper/pvt/mapping/-audienceId-)
- `DELETE`[Delete price table mapping](https://developers.vtex.com/docs/api-reference/audience-api/#delete-/api/price-table-mapper/pvt/mapping/-audienceId-)

## Common parameters in the documentation

| Parameter name | Description |
| - | - |
| `{{accountName}}`| Name of the VTEX account. Used as part of the URL. |
| `{{environment}}`| Name of the VTEX account. Used as part of the URL. |
| `{{X-VTEX-API-AppKey}}` | Unique identifier of the [API key](https://developers.vtex.com/docs/guides/api-authentication-using-api-keys). |
| `{{X-VTEX-API-AppToken}}` | Secret token of the [API key](https://developers.vtex.com/docs/guides/api-authentication-using-api-keys). |
