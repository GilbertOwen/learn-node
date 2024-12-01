# User API Specification

## Register User API

Endpoint : POST /api/users

Request Body :

```json
{
  "username": "example",
  "email": "example@gmail.com",
  "password": "examplePassword"
}
```

Request Body Success :

```json
{
  "data": {
    "username": "example",
    "email": "example@gmail.com"
  },
  "message": "Successfully registered user"
}
```

Request Body Error :

```json
{
  "errors": {
    "username": "Username already registered",
    "password": "Password must be 8 characters long",
    "email": "Email has already exist"
  },
  "message": "Failed to register user"
}
```

## Login User API

Endpoint : POST /api/users/login

Request Body :

```json
{
  "username": "example",
  "password": "examplePassword"
}
```

Request Body Success :

```json
{
  "data": {
    "unique-token": "1qiqeiq1o2er-2rksa"
  },
  "message": "Successfully logged-in"
}
```

Request Body Error :

```json
{
  "errors": "Username or password is wrong",
  "message": "Failed to logged-in, please try again"
}
```

## Update User API

Endpoint : PATCH /api/users/current

Headers :
- Authorization : token

Request Body :

```json
{
  "username": "example", // Opsional
  "password": "examplePassword" // Opsional
}
```

Request Body Success :

```json
{
  "data": {
    "username": "example1", // Opsional
    "password": "examplePassword1" // Opsional
  },
  "message": "Successfully updated user's information"
}
```

Request Body Error :

```json
{
  "errors": {
    "username": "Username has already existed",
    "password": "Password must be 8 characters long"
  },
  "message": "Failed to change user's information"
}
```

## Get User API

Endpoint : GET /api/users/me

Headers :
- Authorization : token

Request Body Success :

```json
{
  "data": {
    "username": "example1",
    "email" : "example1@gmail.com"
  },
  "message": "Successfully retrieved user's information"
}
```

Request Body Error :

```json
{
  "message": "Unauthorized"
}
```

## Logout User API

Endpoint : DELETE /api/users/logout

Headers :
- Authorization : token

Request Body Success :

```json
{
  "data": "OK",
  "message": "Successfully logged-out user"
}
```

Request Body Error :

```json
{
  "message": "Unauthorized"
}
```