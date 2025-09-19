# Digital Signature Vault

A full-stack digital document management platform for handling e-signature workflows. The project uses a Vite + React frontend and an Express API written in TypeScript.

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server (Express API + Vite client):
   ```bash
   npm run dev
   ```
   The API is available at `http://localhost:5000/api` and the web UI is served from the same origin.

## Production build

Create a production build for both the client and the server:

```bash
npm run build
```

Start the compiled server:

```bash
npm run start
```

The compiled assets live in the `dist` directory and can be deployed to any Node.js host.

## Environment variables

The application listens on the port specified by the `PORT` environment variable (defaults to `5000`). Set any additional environment configuration before running the server if needed.

