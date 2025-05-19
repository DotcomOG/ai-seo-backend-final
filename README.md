# AI SEO Analyzer

A Node.js application that analyzes websites for AI search engine readiness using OpenAI.

## Installation

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Copy `.env.example` to `.env` and fill in your OpenAI key.

```
OPENAI_API_KEY=your-openai-key
```

## Running Locally

Start the server with:

```
npm start
```

The app listens on **http://localhost:8080** and serves the static frontend from the `public/` directory.

## Endpoints

- `GET /health` – simple health check.
- `GET /friendly?type=<summary|full>&url=<page>` – returns the AI SEO report as JSON.

## Frontend

- `index.html` provides a summary analyzer.
- `full-report.html` shows the detailed report when called with `?url=<page>`.

Deployments on Railway happen automatically whenever you push to the `main` branch and have `OPENAI_API_KEY` configured in the environment settings.
