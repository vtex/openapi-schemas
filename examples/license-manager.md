The License Manager API allows you to create users, modify their names and emails, add and remove [roles](https://help.vtex.com/en/tutorial/roles--7HKK5Uau2H6wxE1rH5oRbc) from users, and create and manage [API keys](https://help.vtex.com/en/tutorial/api-keys--2iffYzlvvz4BDMr6WGUtet).

## Common parameters

|Attribute name | Description |
|:------------|--------------|
|`accountName` | Account name in VTEX License Manager. |
|`environment` | Environment on which you want to run the query, e.g. `vtexcommercestable`. |
|`userId`      | Unique user identification string. |
|`roleId`      | Integer that represents a role, can be obtained from the [Get List of Roles](https://developers.vtex.com/docs/api-reference/license-manager-api#get-/api/license-manager/site/pvt/roles/list/paged) endpoint. |

## Index

### User

- `GET` [Get user information by user ID](https://developers.vtex.com/docs/api-reference/license-manager-api#get-/api/license-manager/users/-userId-)
- `GET` [Get user information by user email](https://developers.vtex.com/docs/api-reference/license-manager-api#get-/api/license-manager/users/-userEmail-/roles)
- `DELETE` [Delete user](https://developers.vtex.com/docs/api-reference/license-manager-api#delete-/api/license-manager/users/-userId-)
- `POST` [Create user](https://developers.vtex.com/docs/api-reference/license-manager-api#post-/api/license-manager/users)
- `GET` [Get list of users](https://developers.vtex.com/docs/api-reference/license-manager-api#get-/api/license-manager/site/pvt/logins/list/paged)

### Roles

- `PUT` [Add roles to user or API Key](https://developers.vtex.com/docs/api-reference/license-manager-api#put-/api/license-manager/users/-userId-/roles)
- `GET` [Get roles by user ID or API Key](https://developers.vtex.com/docs/api-reference/license-manager-api#get-/api/license-manager/users/-userId-/roles)
- `DELETE` [Remove role from user or API Key](https://developers.vtex.com/docs/api-reference/license-manager-api#delete-/api/license-manager/users/-userId-/roles/-roleId-)
- `GET` [Get list of roles](https://developers.vtex.com/docs/api-reference/license-manager-api#get-/api/license-manager/site/pvt/roles/list/paged)

### API keys

- `POST` [Create new API Key](https://developers.vtex.com/docs/api-reference/license-manager-api#post-/api/vlm/appkeys)
- `GET` [Get API keys from account](https://developers.vtex.com/docs/api-reference/license-manager-api#get-/api/vlm/appkeys)
- `PUT` [Update API Key](https://developers.vtex.com/docs/api-reference/license-manager-api#put-/api/vlm/appkeys/-id-)

### Store

- `GET` [Get stores](https://developers.vtex.com/docs/api-reference/license-manager-api#get-/api/vlm/account/stores)

### Account

- `GET` [Get information about account](https://developers.vtex.com/docs/api-reference/license-manager-api#get-/api/vlm/account)
