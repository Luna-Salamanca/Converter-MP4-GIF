# Project Overview

This is a web application for converting MP4 videos to GIFs. It's a full-stack TypeScript project with a React frontend and an Express backend.

**Frontend:**

- **Framework:** React
- **Build Tool:** Vite
- **Routing:** Wouter
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/ui
- **Data Fetching:** TanStack Query

**Backend:**

- **Framework:** Express
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM

# Building and Running

To run the application in development mode, you need to have Node.js and npm installed.

1.  Install the dependencies:

    ```bash
    npm install
    ```

2.  Run the development server:

    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:5000`.

To build the application for production, run:

```bash
npm run build
```

To start the production server, run:

```bash
npm run start
```

# Development Conventions

The project uses TypeScript for both the frontend and the backend. The code is organized into `client` and `server` directories.

The frontend code is located in the `client/src` directory. It uses a feature-based structure, with components, hooks, pages, and utils organized into separate directories.

The backend code is located in the `server` directory. It uses Express as a web framework and Drizzle ORM for database access. The API routes are defined in the `server/routes.ts` file.
