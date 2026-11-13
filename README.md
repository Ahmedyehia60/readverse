# Readverse


🌌 **Live demo:** [Open Readverse](https://readverse-zd3m.vercel.app/en)
Readverse is a galaxy themed reading library. The app uses React and TypeScript in the browser, with a Node.js and Express REST API, PostgreSQL storage, and account based authentication.

## Features

- Explore books and see how reading categories connect in an interactive mind map.
- Search the Open Library catalog and add books to a personal library.
- Save favorites, discover smart links, and receive reading achievements and notifications.
- Manage a profile, settings, account security, and account deletion.
- Use English or Arabic, with layouts that support both left-to-right and right-to-left text.
- Keep each account's library private in PostgreSQL. Existing browser library data can be migrated after signing in.

## Stack

- **Client:** React 19, TypeScript, Vite, React Router, Tailwind CSS
- **API:** Node.js, Express 5, TypeScript
- **Database:** PostgreSQL
- **Authentication:** bcrypt password hashes and random HTTP-only session cookies. Only hashes of session tokens are stored in PostgreSQL.
- **Catalog:** Open Library

## Run locally

Requirements: Node.js 20.19 or newer and a PostgreSQL database.

1. Install dependencies from the project root:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env.local` and set `DATABASE_URL` to your PostgreSQL connection URL. Keep `.env.local` private.

3. Create the app tables:

   ```sh
   npm run db:setup
   ```

4. Start the React client and Node API together:

   ```sh
   npm run dev
   ```

Open the Vite URL printed in the terminal. The client forwards `/api` requests to Express on port `4000`. The database itself must already exist; setup creates Readverse tables inside it.

## Deploy to Vercel

The repository includes `vercel.json` and an Express serverless entry point. Import the GitHub repository into Vercel and add this environment variable in the project's settings:

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Hosted PostgreSQL connection URL. For Supabase, use the Session pooler URI when the deployment host needs IPv4 connectivity. |

Vercel uses `npm run build` and publishes the `dist` directory. The React app and `/api/*` endpoints are served from the same domain. After adding the database URL, deploy the project; the API creates its tables on first use. You can also run `npm run db:setup` against the hosted database before deployment.

For a separate Node host instead of Vercel, use `npm run build` and `npm start`. Express serves the built React app and API from the same process. Set `DATABASE_URL`; the host supplies `PORT`.

## Project structure

```text
api/                  Vercel serverless entry point
backend/src/          Express app, REST routes, auth, PostgreSQL and schema setup
components/            React screens, dashboard, mind map, profile and settings
context/               Locale and notification providers
constants/             App-wide constants
hooks/                  Reusable React hooks
i18n/                   Locale-aware routing helpers
lib/                    Book, category and mind-map utilities
messages/               English and Arabic translations
models/                 Shared client-side data types
public/                 Galaxy artwork and static assets
src/                    React entry point and global styles
vercel.json             Vercel build, static output and API routing
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite and the Express API together |
| `npm run dev:client` | Start only the Vite client |
| `npm run dev:server` | Start only the Express API |
| `npm run build` | Type-check the client and API, then create the production client build |
| `npm start` | Serve the production build and API with Node |
| `npm run db:setup` | Create the PostgreSQL tables |
| `npm run lint` | Type-check the client and API |

## Security and data

- Never commit `.env.local` or share database credentials. Rotate a credential if it is exposed.
- Passwords use bcrypt. Session cookies are HTTP-only and SameSite Lax; production cookies are Secure.
- The API associates library data with the signed-in account and limits JSON request size.
- Deleting an account removes its library and sessions through PostgreSQL foreign-key cascades.
- Book search and cover images come from Open Library and require an internet connection.
