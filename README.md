# WizAllet — web

Vue 3 frontend for [WizAllet](https://wizallet.netlify.app), a simple
personal finance tracker.

| | |
| --- | --- |
| **Frontend (this repo)** | Vue 3 + Vite + TypeScript |
| **Backend** | [ynshvrh/wizallet-api](https://github.com/ynshvrh/wizallet-api) (Go + Gin + Postgres) |
| **Frontend hosting** | Netlify (auto-deploy from `main`) |
| **Backend hosting** | Render (Web Service + Postgres) |
| **Live** | https://wizallet.netlify.app |

## Stack

- Vue 3 (Composition API, `<script setup>`)
- Pinia (auth store)
- Vue Router (auth guards)
- TanStack Query (server state)
- Tailwind v4 (`@tailwindcss/vite`)
- vue-i18n (en / uk)
- axios with a transparent token-refresh interceptor

## Layout

```
web-app/
  src/
    api/         axios client, endpoints, query hooks, types
    components/  UI primitives (Button, Input, Card, …) + TransactionModal
    i18n/        en/uk translations + error-code → copy mapping
    layouts/     AppLayout (header, mobile nav)
    pages/       Login, Register, Dashboard, History, Settings
    router/      route table + auth guard
    stores/      Pinia stores (auth)
```

## Develop

```sh
cd web-app
cp .env.example .env   # set VITE_API_URL if not localhost:8080
pnpm install
pnpm dev               # http://localhost:5173
```

Run the API alongside (see [wizallet-api](https://github.com/ynshvrh/wizallet-api)).

## Build

```sh
pnpm build             # vue-tsc + vite build → web-app/dist
```

`netlify.toml` bakes `VITE_API_URL=https://wizallet-api.onrender.com`
into the production bundle.

## Error handling

API errors come back as `{ code, error, fields? }`. The client maps
`code` to a localised message in `src/i18n/{en,uk}.ts` — no string
matching of error text.
