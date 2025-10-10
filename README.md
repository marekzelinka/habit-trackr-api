# Habit Tracker API

## Overview

This project is a REST API backend server for a habit tracking application, that implements the core features like user auth, creating habits with tags, and completion logs.

## Goals

The goal of this project was to learn Drizzle ORM while creating a habit tracking backend API.

## Upcoming work

- [ ] implement rate limiting to prevent abuse
- [ ] endpoints that return lists should support pagination via `?page=2&limit=20`
- [ ] add support for getting habit stats like current streak

## Tech Stack

- [TypeScript](https://www.typescriptlang.org/) - static types for JavaScript
- PostgresSQL - database via [Neon](https://neon.tech/)
- [Node.js](https://nodejs.org/) - JavaScript runtine for server
- [Express.js](https://expressjs.com/) - web server framework
- [Drizzle ORM](https://orm.drizzle.team/) - database ORM
- [Zod](https://zod.dev/) - data validations

## Get started

### Setup

Clone this repoository from [GitHub](https://github.com/marekzelinka/habit-tracker-api/):

```sh
git clone https://github.com/marekzelinka/habit-tracker-api/ && cd habit-tracker-api
```

Install deps using [pnpm](https://pnpm.io/):

> [!IMPORTANT]
> You'll need to have [Node LTS](https://nodejs.org/) installed.
> You'll need to have [pnpm](https://pnpm.io/) installed.

```sh
pnpm install
```

### Database setup

1. Go to [https://neon.new/](https://neon.new/)
2. Create new database in the browser and copy the `DATABASE_URL`
3. Paste as `DATABASE_URL` in your [`.env`](./.env) file

### First run

Copying the contents of the [`.env.exmaple`](./.env.example) file into a new [`.env`](./.env) file and fill in the required environment variables. 

Paste the copied `DATABASE_URL` in your new [`.env`](./.env) file.

Push the application database schema to your new database:

```sh
pnpm db:push
```

(*Optional step*) Seed your database with dummy data:

```sh
pnpm db:seed
```

## Credits

- [API Design in Node.js, v5](https://frontendmasters.com/courses/api-design-nodejs-v5/)
