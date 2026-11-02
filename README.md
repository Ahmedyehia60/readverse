# Readverse / Brain Book

Readverse is a bilingual reading library with a live book search, interactive mind map, favorites, notifications, and smart links between subjects. User accounts and library data are stored in PostgreSQL.

## Local setup

1. Install dependencies with `npm install`.
2. Install PostgreSQL and create a local user. Copy `.env.example` to `.env.local` and set the PostgreSQL password in `DATABASE_URL`.
3. Run `npm run db:setup` to create the `readverse` database (if needed) and its tables.
4. Start the app with `npm run dev` and open `http://localhost:3000`.
5. Create an account in the app. Each account has its own books, favorites, links, and notifications.

The app searches Open Library directly for book metadata and cover images. Library changes are saved in PostgreSQL and backed up in the current browser for offline recovery.

## Build

Run `npm run build` to create a production build, then `npm start` to serve it.
