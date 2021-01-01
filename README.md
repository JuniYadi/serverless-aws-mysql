- [Serverless AWS MySQL](#serverless-aws-mysql)
  - [Stack](#stack)
  - [Route with Middleware](#route-with-middleware)
  - [How to Use](#how-to-use)
    - [Install](#install)
    - [Run](#run)

# Serverless AWS MySQL

## Stack

- NodeJS 
- TypeScript
- Serverless Framework
- Serverless HTTP
- Sequelize (MySQL)
- ExpressJS
    - Helmet
    - Express Validator
- JSON Web Token

## Route with Middleware
| Type | Path | Token |
| ---- | ---- | ----- |
| POST | `/auth/register` | No |
| POST | `/auth/login`| No |
| GET | `/me` | Yes |
| GET | `/user` | No |
| POST | `/user` | No |
| GET | `/user/:id` | No |
| PATCH | `/user/:id` | No |
| DELETE | `/user/:id` | No |

## How to Use

### Install

```bash
yarn install
```

### Run

```bash
yarn dev
```