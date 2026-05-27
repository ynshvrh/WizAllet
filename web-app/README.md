# web-app

The Vue 3 SPA. See the [repo root README](../README.md) for the full
stack overview and architecture.

## Scripts

```sh
pnpm dev       # vite dev server at http://localhost:5173
pnpm build     # type-check (vue-tsc) + production build → dist/
pnpm preview   # preview the production build locally
```

## Env

`VITE_API_URL` — base URL of [wizallet-api](https://github.com/ynshvrh/wizallet-api).
Defaults to `http://localhost:8080` if unset. Production value is baked
in at build time via `netlify.toml`.
