# Pizza Delivery API

This Project is a JSON RESTful API without using any 3rd party API and Utilizing Stripe API and MailGun API services.

## Routes

### USERS

| Method   | Header    | Query params | Payload                                                                                               | Desc                                                                    |
| -------- | --------- | ------------ | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `GET`    | `token`\* |              | `phone`\*                                                                                             | Return information about the user except for password in a JSON format. |
| `POST`   |           |              | `firstName`\*, `lastName`\*, `email`\*, `password`\*, `streetAddress`\*, `tosAgreement`\*             | Create a user account.                                                  |
| `PUT`    | `token`\* |              | `phone`\*, at least one of: \(`firstName`, `lastName`, `password`\,`streetAddress`\,`emailAddress`)\* | Change one/more of user's information.                                  |
| `DELETE` | `token`\* |              | `phone`\*                                                                                             | Delete user's account.                                                  |
|          |
|          |

### TOKENS

| Method   | Header | Query params | Payload                 | Desc                                                                       |
| -------- | ------ | ------------ | ----------------------- | -------------------------------------------------------------------------- |
| `GET`    |        | `id`\*       |                         | Get token's id and expiration time and user phone number.                  |
| `PUT`    |        |              | `id`\*, `extend`\*      | With extend set to true, a valid token's lifespan is extended by one hour. |
| `POST`   |        |              | `phone`\*, `password`\* | Log in, Return a new, valid token for the user to use with other routes.   |
| `DELETE` |        | `id`\*       |                         | Log out, Delete the given token from the system.                           |
|          |

### MENU

| Method | Header    | Query params | Payload | Desc                                |
| ------ | --------- | ------------ | ------- | ----------------------------------- |
| `GET`  | `token`\* |              |         | Get menu as a JSON array of pizzas. |
|        |

### SHOPPING CART

| Method | Header    | Query params | Payload          | Desc                                   |
| ------ | --------- | ------------ | ---------------- | -------------------------------------- |
| `POST` | `token`\* |              | array of items\* | Add items to the user's shopping cart. |
|        |

### ORDER

| Method | Header    | Query params | Payload | Desc                                                                                                           |
| ------ | --------- | ------------ | ------- | -------------------------------------------------------------------------------------------------------------- |
| `POST` | `token`\* |              |         | If token is valid, calculate the bill and process the payment, if payment done then send receipt to user email |
|        |

### SET UP

- After downloading the project set node environment variable to staging.

`NODE_ENV=staging`

- Replace the API tokens of Stripe Api and MailGun api token with yours present is following directory.

`./lib/config.js`

---
