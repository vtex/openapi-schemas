Este documento detalha a API xxx segue abaixo um rascunho da API em formato openapi doc. Aliem disso segue abaixo um dialogo com o desenvolvedor responsavel por esta API.

## Dialogo tirando duvidas com o desenvolvedor sobre a API pelo slack

```text
Oi, @raony, @igleson e @Cacá Bressiani !
Preciso esclarecer mais algumas dúvidas sobre a documentação fornecida para conseguir documentar corretamente essa API.

:one: Notei que ambos os endpoints parecem estar com o base path incompleto. Por exemplo, APIs existentes em nosso portal possuem um base path como /api/rnb/v2/pvt/coupon, enquanto na documentação atual aparecem apenas /calculatePromotion e /notifyUsage. Isso faria com que a chamada completa fosse algo como https://{accountName}.{environment}.com.br/calculatePromotion. Poderia confirmar qual é o base path completo desses endpoints?

:two: Para enriquecer a documentação e torná-la mais clara para o cliente, gostaria de entender melhor o comportamento e o propósito desses endpoints. Por exemplo, o endpoint /notifyUsage possui apenas a descrição "Receives the usage notification", que é um pouco vaga. Poderia explicar com mais detalhes qual é o propósito e o comportamento esperado desses endpoints?

:three:Em relação às permissions, para utilizar esses endpoints, é necessário que o usuário possua algum resource específico do License Manager?

:four: Por fim, o nome "Promotions Protocol API" seria apropriado para essa API? Esse nome faz sentido dentro do contexto de negócio?
igleson  [10:09 AM]
:one: @Geise Costa essas rotas não vão ser providas pela VTEX, isso é um protocolo que quem vai ter que implementar as rotas é o merchant, por isso não tem base path
[10:10 AM]:two: O objetivo dessa rota é receber a notificação de quem um pedido foi criado ou cancelado, informando quais promoções e cupons foram aplicadas no pedido.
[10:10 AM]:three: como não é uma rota que vai ser provida por nós, não tem permissões,
[10:10 AM]:four: Diria que External Promotions Protocal API (edited) 
Geise Costa  [10:14 AM]
@igleson
Nesse caso, esse protocolo será implementado e disponibilizado para todos os clientes VTEX? A documentação ficará pública no portal?

Além disso, para que os clientes possam utilizar esse protocolo, qual procedimento deverá ser seguido?

Essa é uma dúvida comum se será necessário abrir algum ticket ou solicitar alguma habilitação, considerando que eles precisarão implementar essa integração, quais são os requisitos ou etapas necessárias para que essa rota funcione corretamente?
igleson  [10:15 AM]
Ele fica habilitado para clientes via pedido via ticket
Geise Costa  [10:17 AM]
Pode me passar um exemplo real de chamada a esses endpoints? um Curl ou Postmanigleson  [10:21 AM]
curl 'http://localhost:5031/calculatePromotion' \
  -H 'sec-ch-ua-platform: "Windows"' \
  -H 'Referer;' \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36' \
  -H 'accept: application/json' \
  -H 'sec-ch-ua: "Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"' \
  -H 'Content-Type: application/json' \
  -H 'sec-ch-ua-mobile: ?0' \
  --data-raw $'{\n  "origin": "Marketplace",\n  "shopperProfileId": "da1220f6-88ce-46a2-b466-7f311c5a1bf0",\n  "salesChannelId": "3",\n  "couponCodes": [\n    "coupon-code-1",\n    "coupon-code-2"\n  ],\n  "utms": null,\n  "items": [\n    {\n      "id": "792",\n      "sellerId": "1",\n      "quantity": 3,\n      "price": 2,\n      "catalogInfo": {\n        "brandId": "23",\n        "categoryId": "43",\n        "productId": "55",\n        "collectionIds": [\n          "98",\n          "11"\n        ]\n      },\n      "shippingInfo": null,\n      "paymentInfo": [\n        {\n          "id": "34",\n          "value": 6\n        }\n      ]\n    }\n  ]\n}'[10:21 AM]curl 'http://localhost:5031/notifyUsage' \
  -X 'OPTIONS' \
  -H 'Accept: */*' \
  -H 'Access-Control-Request-Headers: content-type' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Origin: https://editor.swagger.io' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'

```

## OpenAPI Doc draft

```json
{
  "openapi": "3.1.1",
  "info": {
    "title": "Provider | v1",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "http://localhost:5031/"
    }
  ],
  "paths": {
    "/calculatePromotion": {
      "post": {
        "tags": [
          "Implementations"
        ],
        "description": "Calculates the promotions of a given shopping cart",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CalculatePromotionsRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CalculatePromotionsResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          }
        }
      }
    },
    "/notifyUsage": {
      "post": {
        "tags": [
          "Implementations"
        ],
        "description": "Receives the usage notification",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/NotifyUsageRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "AppliedPromotion": {
        "required": [
          "id",
          "discount",
          "type"
        ],
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "The id of the promotion applied to an item.",
            "example": "promo-1"
          },
          "discount": {
            "type": "number",
            "description": "The discount value applied to the promotion",
            "format": "double",
            "example": 0.25
          },
          "type": {
            "description": "The type of the discount, only nominal is supported for now",
            "examples": [
              "Nominal"
            ],
            "$ref": "#/components/schemas/DiscountType"
          }
        },
        "description": "A promotion applied to an item."
      },
      "CalculatedItem": {
        "required": [
          "id",
          "quantity",
          "originalPrice"
        ],
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "The id of the item in the shopping cart",
            "example": "SKU-1"
          },
          "quantity": {
            "type": "integer",
            "description": "The quantity of the item in the shopping cart",
            "format": "int32",
            "example": 3
          },
          "promotions": {
            "type": [
              "null",
              "array"
            ],
            "items": {
              "$ref": "#/components/schemas/AppliedPromotion"
            },
            "description": "An array of the promotion applied on this item"
          },
          "originalPrice": {
            "type": "number",
            "description": "The original price of this item",
            "format": "double",
            "example": 2.0
          },
          "discountedPrice": {
            "type": [
              "null",
              "number"
            ],
            "description": "The discounted price of this item",
            "format": "double",
            "example": 1.75
          }
        },
        "description": "An item in the Calculate Promotions response"
      },
      "CalculatePromotionsRequest": {
        "required": [
          "origin",
          "salesChannelId",
          "items"
        ],
        "type": "object",
        "properties": {
          "origin": {
            "description": "The origin of the shopping cart",
            "examples": [
              "Marketplace"
            ],
            "$ref": "#/components/schemas/CartOrigin"
          },
          "shopperProfileId": {
            "type": [
              "null",
              "string"
            ],
            "description": "The shopper's identifier",
            "example": "da1220f6-88ce-46a2-b466-7f311c5a1bf0"
          },
          "salesChannelId": {
            "type": "string",
            "description": "The id of the sales channel of the shopping cart, as configured on VTEX",
            "example": 3
          },
          "couponCodes": {
            "type": [
              "null",
              "array"
            ],
            "items": {
              "type": "string"
            },
            "description": "The coupon codes added to the shopping cart",
            "example": [
              "coupon-code-1",
              "coupon-code-2"
            ]
          },
          "utms": {
            "oneOf": [
              {
                "type": "null"
              },
              {
                "description": "The shopping cart Utms",
                "$ref": "#/components/schemas/UTMs"
              }
            ]
          },
          "items": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Item"
            },
            "description": "The list of items on the shopping cart"
          }
        },
        "description": "The request body for the Calculate Promotions requests"
      },
      "CalculatePromotionsResponse": {
        "required": [
          "items"
        ],
        "type": "object",
        "properties": {
          "items": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/CalculatedItem"
            },
            "description": "The items on the calculate promotions response"
          },
          "allPromotions": {
            "type": [
              "null",
              "array"
            ],
            "items": {
              "$ref": "#/components/schemas/PromotionSummary"
            },
            "description": "An array of all promotions, applied or not on the shopping cart"
          }
        },
        "description": "The response for the Calculate Promotions request"
      },
      "CartOrigin": {
        "enum": [
          "Marketplace",
          "Fulfillment"
        ],
        "description": "The origin of the shopping cart"
      },
      "CatalogInfo": {
        "required": [
          "brandId",
          "categoryId",
          "productId"
        ],
        "type": "object",
        "properties": {
          "brandId": {
            "type": "string",
            "description": "The brand id of the item, as configured on VTEX catalog",
            "example": "23"
          },
          "categoryId": {
            "type": "string",
            "description": "The category id of the item, as configured on VTEX catalog",
            "example": "43"
          },
          "productId": {
            "type": "string",
            "description": "The product id of the item, as configured on VTEX catalog",
            "example": "55"
          },
          "collectionIds": {
            "type": [
              "null",
              "array"
            ],
            "items": {
              "type": "string"
            },
            "description": "The list of collection ids this item belongs to, as configured on VTEX catalog",
            "example": [
              "98",
              "11"
            ]
          }
        },
        "description": "The catalog information for this item"
      },
      "DiscountType": {
        "enum": [
          "Nominal"
        ],
        "description": "The type of the discount applied"
      },
      "Item": {
        "required": [
          "id",
          "sellerId",
          "quantity",
          "price",
          "catalogInfo"
        ],
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "The id of the item, as configured on VTEX catalog",
            "example": 792
          },
          "sellerId": {
            "type": "string",
            "description": "The id of the seller, as configured on VTEX",
            "example": 1
          },
          "quantity": {
            "type": "integer",
            "description": "The quantity of the item",
            "format": "int32",
            "example": 3
          },
          "price": {
            "type": "number",
            "description": "The price of the item",
            "format": "double",
            "example": 2
          },
          "catalogInfo": {
            "description": "The catalog information of this item",
            "$ref": "#/components/schemas/CatalogInfo"
          },
          "shippingInfo": {
            "oneOf": [
              {
                "type": "null"
              },
              {
                "description": "The shipping info for this item",
                "$ref": "#/components/schemas/ShippingInfo"
              }
            ]
          },
          "paymentInfo": {
            "type": [
              "null",
              "array"
            ],
            "items": {
              "$ref": "#/components/schemas/PaymentInfo"
            },
            "description": "The payment info for this item"
          }
        },
        "description": "The items on the shopping cart to calculate the promotions"
      },
      "NotificationType": {
        "enum": [
          "NewOrder",
          "OrderCancellation"
        ],
        "description": "The type of notification, if it represents a new order or an order cancellation"
      },
      "NotifyUsageRequest": {
        "required": [
          "orderId",
          "type",
          "promotionUsages"
        ],
        "type": "object",
        "properties": {
          "orderId": {
            "type": "string",
            "description": "The id of the order triggering this notification",
            "example": "099823581-1"
          },
          "type": {
            "description": "The type of notification",
            "examples": [
              "NewOrder"
            ],
            "$ref": "#/components/schemas/NotificationType"
          },
          "promotionUsages": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/PromotionUsage"
            },
            "description": "Array of the promotion usages"
          }
        },
        "description": "The request body for the notify usage request"
      },
      "PaymentInfo": {
        "required": [
          "id",
          "value"
        ],
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "The id of the payment method, as configured on VTEX",
            "example": "34"
          },
          "value": {
            "type": "number",
            "description": "Value paid with this payment method",
            "format": "double",
            "example": 6.0
          }
        },
        "description": "Represents payment information for an item"
      },
      "PromotionSummary": {
        "required": [
          "id",
          "name",
          "description"
        ],
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "The id of the promotion.",
            "example": "promo-1"
          },
          "name": {
            "type": "string",
            "description": "The name of the promo",
            "example": "25 cents off on cokes"
          },
          "description": {
            "type": "string",
            "description": "The description of the promo",
            "example": "Buy at least 3 cokes and get 25 cents off on each"
          },
          "couponCode": {
            "type": [
              "null",
              "string"
            ],
            "description": "The coupon code that triggers the promotion, null if no coupon code triggered the promotion",
            "example": "25offCoke"
          }
        },
        "description": "The summary of a promotion"
      },
      "PromotionUsage": {
        "required": [
          "promotionId",
          "discount"
        ],
        "type": "object",
        "properties": {
          "promotionId": {
            "type": "string",
            "description": "The id of the applied promotion",
            "example": "promo-1"
          },
          "discount": {
            "type": "number",
            "description": "The total discount given",
            "format": "double",
            "example": 0.75
          },
          "couponCode": {
            "type": [
              "null",
              "string"
            ],
            "description": "The coupon code that triggered this promotion",
            "example": "coupon-code1"
          }
        },
        "description": "The representation of the usage of a promotion in an order"
      },
      "ShippingInfo": {
        "type": "object",
        "description": "TODO"
      },
      "UTMs": {
        "type": "object",
        "properties": {
          "source": {
            "type": [
              "null",
              "string"
            ],
            "description": "UTM source",
            "example": "source"
          },
          "medium": {
            "type": [
              "null",
              "string"
            ],
            "description": "UTM Medium",
            "example": "medium"
          },
          "campaign": {
            "type": [
              "null",
              "string"
            ],
            "description": "UTM Campaign",
            "example": "campaign"
          },
          "internalCampaign": {
            "type": [
              "null",
              "string"
            ],
            "description": "UTM Internal Campaign",
            "example": "internal-campaign"
          }
        },
        "description": "All the Utms on the shopping cart"
      }
    },
    "securitySchemes": {
      "apiKey": {
        "type": "apiKey",
        "name": "X-API-Key",
        "in": "header"
      },
      "Basic": {
        "type": "http",
        "scheme": "basic"
      }
    }
  },
  "security": [
    {
      "apiKey": [ ]
    },
    {
      "Basic": [ ]
    }
  ],
  "tags": [
    {
      "name": "Implementations"
    }
  ]
}

```
