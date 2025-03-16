# Crockpot V2 - Backend API

This backend API written in Express.JS corresponds to the client side application in [this repository](https://github.com/franciskershaw/crockpot). It handles all server requests, from logging in or registering new users to returning recipe data to the generation of shopping lists based off of recipes in a user's menu.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the API](#running-the-api)
- [Models](#models)
- [Routes and controllers](#routes-and-controllers)
- [Middleware](#middleware)
- [Validation](#Validation)
- [Technologies](#technologies)
- [Deployment](#deployment)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.JS version 20.9.0 installed
- NPM version 10.2.5 installed
- A MongoDB Atlas account, with a cluster created and a database called 'crockpot' - you can call the first collection 'users'. You need to get the URI string from the 'Connect' section of the database/cluster
- A free account created with Cloudinary, and access to the credentials: Cloud Name, Cloud Key, and Secret

```bash
node >= 20.x
npm >= 10.x
```

### Installation

- Clone the repository
- From the root, run `npm install`
- In the root, create a `.env` file with the following variables:

```
MONGO_URI=<get this from MongoDB atlas>
NODE_ENV=development
PORT=<choose a port, make sure you remember this for the client side variables>
JWT_SECRET=<make this an impossible to guess string>
ACCESS_TOKEN_SECRET=<same as above>
REFRESH_TOKEN_SECRET=<same as above>
CLOUDINARY_CLOUD_NAME=<get this from cloudinary>
CLOUDINARY_KEY=<get this from cloudinary>
CLOUDINARY_SECRET=<get this from cloudinary>
CORS_ORGIN<where your Next application is running, likely http://localhost:3000>
```

### Running the API

In theory, if you've followed the steps correctly, you should be able to run a local version of the API by running this command from the root:

```
npm run server
```

This will run the server with nodemon and listen for changes.

## Models

The Mongoose models for the project can be found in the models directory, separated into individual files:

- User.js
- Item.js
- ItemCategory.js
- Recipe.js
- RecipeCategory.js

## Routes and controllers

Each model has a corresponding routes file, which defines the endpoint, HTTP verb and links to the controller file which handles the business logic of the endpoint.

## Middleware

Middleware for authentication is defined in authMiddleware.js, and for error handling in errorMiddleware.js

## Validation

All logic that requires changes to the database in any way is sanitised using Joi schemas to ensure requests are valid.

## Technologies

- Express.JS
- MongoDB with Mongoose
- Cloudinary
- Joi
- Digital Ocean droplet
- Nginx
- Docker
