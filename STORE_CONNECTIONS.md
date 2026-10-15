# Store connections

This is a fashion catalog for clothing, shoes, and jewellery. Shopify is the real connected source. WooCommerce is intentionally a mock connection and does not provide fabricated catalog products.

## Shopify live connection

Create and install a Shopify Dev Dashboard app with Admin API access to `read_products`, `write_products`, `read_inventory`, and `write_inventory`. Add these values to Vercel Project Settings → Environment Variables and redeploy. For local development, copy `.env.example` to `.env` and fill it in. Keep credentials server-side; never use `VITE_` names or commit `.env`.

- `SHOPIFY_STORE_DOMAIN`: your `*.myshopify.com` store domain
- `SHOPIFY_CLIENT_ID` and `SHOPIFY_CLIENT_SECRET`: the Dev Dashboard app credentials. The server exchanges them for a short-lived Admin API access token and refreshes it as needed.
- `SHOPIFY_ADMIN_ACCESS_TOKEN`: optional legacy alternative for deployments that already have a static Admin API token. If set, it takes precedence over client credentials.
- `SHOPIFY_API_VERSION`: optional; defaults to `2026-10`
- `ADMIN_API_TOKEN`: long random secret required for live price and stock edits

The storefront reads Shopify products, variants, inventory, and images from the Admin GraphQL API. The admin mutation tool changes the first variant's price and/or inventory quantity. Shopify inventory edits require the variant to track inventory and have inventory at a location.

## WooCommerce demo source

WooCommerce does not connect to a real store in this version. It is retained as a mock connection status only; it does not add sample products or support product edits.

## Synchronization and manual products

The storefront fetches Shopify products on each catalog request, so it does not depend on Vercel preserving a local JSON file between invocations. Manual products are saved in the browser's local storage so they survive refreshes on that browser. They are not shared across browsers or devices; shared persistence requires a hosted database. Sync history and settings still use the local JSON file and are not durable on Vercel without a hosted database.
