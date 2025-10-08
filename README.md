# Habit Trackr API

This project is a Node.js-based REST API backend server for a habit tracking application, that implements the core features like user auth, creating new habits with tags, and completion logs.

[API_DOCS.md](./API_DOCS.md)

## Goals

The goal of this project was to learn Drizzle ORM while creating a habit tracking backend API.

## TODOs

- [ ] implement rate limiting to prevent abuse
- [ ] endpoints that return lists should support pagination via `?page=2&limit=20`
- [ ] add support for getting habit stats like current streak

## Tecnologia

- [TypeScript](https://www.typescriptlang.org/) - static types for JavaScript
- PostgresSQL - database via [Neon](https://neon.tech/)
- [Node.js](https://nodejs.org/) - JavaScript runtine for server
- [Express.js](https://expressjs.com/) - web server framework
- [Drizzle ORM](https://orm.drizzle.team/) - database ORM
- [Zod](https://zod.dev/) - data validations

## Setup

- Clone this repoository from [GitHub](https://github.com/marekzelinka/habit-trackr-api/):
  - Running: `git clone https://github.com/marekzelinka/habit-trackr-api/ && cd habit-trackr-api`
- Install dependencies using [pnpm](https://pnpm.io/):
  - You'll need to have [Node.js](https://nodejs.org/) installed on your machine (`>=v22`)
  - You'll need to have [pnpm](https://pnpm.io/) installed on your machine
  - Running: `pnpm install`
- Setup database:
  1. Go to [https://neon.new/](https://neon.new/)
  2. Create new database in the browser and copy the `DATABASE_URL`
  3. Paste as `DATABASE_URL` in your [`.env`](./.env) file
- Fill in the required environment variables:
  - Copy the contents of the [`.env.exmaple`](./.env.example) file into a new [`.env`](./.env) file
  - Paste the copied `DATABASE_URL` in your [`.env`](./.env) file
- **Important** Push the application database schema to your new database:
  - Running: `pnpm db:push`
  - Your database connection is now production-ready
- (*Optional step*) Seed your database with dummy data:
  - Running: `pnpm db:seed`

## Credits

- [API Design in Node.js, v5](https://frontendmasters.com/courses/api-design-nodejs-v5/)
