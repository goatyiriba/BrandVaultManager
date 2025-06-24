# BrandVault

BrandVault is a web application for managing brand assets like logos, colors and typography.
It uses Express with TypeScript for the backend and React for the frontend.

## Running locally

1. Install dependencies
   ```bash
   npm install
   ```
2. Provide the following environment variables:
   - `DATABASE_URL` – PostgreSQL connection string
   - `SESSION_SECRET` – secret used to sign session cookies
3. Start the development server
   ```bash
   npm run dev
   ```
   The server runs on http://localhost:5000

## Creating a new project

Once logged in, navigate to `http://localhost:5000/projects/new` to start a new brand project.

For a production build use:
```bash
npm run build
npm run start
```

To verify the TypeScript setup locally, run `npm run check` after installing
dependencies.

