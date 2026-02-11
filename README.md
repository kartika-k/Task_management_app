## TaskFlow – Project & Task Management App

A small project/task management app built with **Next.js**, **TypeScript**, **Tailwind CSS**, and **Prisma** (PostgreSQL). It supports projects, tasks (status, priority, due dates), filters, and per‑project & activity logs.

---

### Setup steps

1. **Clone & install dependencies**

```bash
git clone https://github.com/kartika-k/Task_management_app.git
cd <repo-folder>
npm install
```

2. **Environment variables**

Create a `.env` file at the project root and set:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?schema=public"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?schema=public"
EMAIL_USER=""
EMAIL_PASS=""
NEXT_PUBLIC_APP_URL=""
```

- **DATABASE_URL**: main connection used by Prisma.
- **DIRECT_URL**: optional direct connection for Prisma migrations.

Make sure the PostgreSQL database exists and is reachable from your machine.

3. **Prisma client generation**

```bash
npx prisma generate
```

---

### How to run migrations / schema setup

The schema is defined in `prisma/schema.prisma`. To apply it to your database:

#### First‑time setup (creates DB schema)

```bash
npx prisma migrate dev --name init
```

This will:

- Create the tables for `User`, `Project`, `Task`, and `ActivityLog`.
- Generate/update the Prisma client.

#### Updating the schema

If you change `schema.prisma` later, create a new migration:

```bash
npx prisma migrate dev --name <short-description>
```

To inspect the DB visually you can use:

```bash
npx prisma studio
```

---

### How to run the app locally

1. **Ensure dependencies & env are set up** (see Setup steps above).
2. **Run database migrations** (once per DB):

```bash
npx prisma migrate dev
```

3. **Start the dev server**

```bash
npm run dev 
```

4. **Open the app**

Visit `http://localhost:3000` in your browser.

You can then:

- Register / log in.
- Create projects.
- Add tasks with status & priority.
- Open a project to see tasks & per‑project activity.
- Use the sidebar **Activity** page to see recent activity across all projects.

---

### Assumptions 

- **Single owner per project**: Projects are owned by a single user; collaboration / shared projects are not modeled yet.
- **Simple auth model**: Only two roles (`EDITOR`, `READ_ONLY`) with basic checks; no advanced permissions or organizations.
- **Activity log scope**: Activity is focused on tasks & projects and stored as simple `message` strings instead of a fully typed, queryable event model.
- **Pagination**: Simple page/pageSize query params, tuned for small‑to‑medium datasets.
- **Styling**: Tailwind-based dark UI with some custom utility classes; no full design system or component library extraction.

---

## Getting Started

First, run the development server:

```bash
npm run dev

```
### Dashboard

Open <img width="1890" height="815" alt="image" src="https://github.com/user-attachments/assets/091f96d1-acee-4dd5-87be-824a3162a96f" /> with your browser to see the result.

<img width="1895" height="813" alt="image" src="https://github.com/user-attachments/assets/963fcb74-cce1-424c-81e2-5112ff67c916" />

### Project View
<img width="1919" height="821" alt="image" src="https://github.com/user-attachments/assets/fff4f963-cc45-4346-9335-139b8dbe8d2a" />

<img width="1906" height="828" alt="image" src="https://github.com/user-attachments/assets/edf14cf9-86ec-4d84-a3f1-89883fce6601" />

<img width="1513" height="832" alt="image" src="https://github.com/user-attachments/assets/70711cb9-37e2-4142-935c-11bc110982e1" />

### Audit Activity
<img width="1899" height="822" alt="image" src="https://github.com/user-attachments/assets/63277922-69e7-4a84-883c-c0c4472ee950" />

## Features

- User authentication (register / login)
- OTP-based password reset
- Create and manage projects
- Add tasks with:
  - Status
  - Priority
  - Due dates
- Per-project activity logs
- Global activity feed
- Pagination support
- Role-based access (EDITOR / READ_ONLY)

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Nodemailer (Email OTP)

## Deployment

The app can be deployed to:
- Vercel (Frontend)
- Neon (PostgreSQL)

