# Store connections

This is a fashion catalog for clothing, shoes, and jewellery. Shopify is the real connected source. WooCommerce is intentionally a mock source with three sample fashion products.

## Shopify live connection

Create a Shopify custom app with Admin API access to `read_products`, `write_products`, `read_inventory`, and `write_inventory`, install it, and add these values to Vercel Project Settings → Environment Variables. Redeploy after setting them. For local development, copy `.env.example` to `.env` and fill it in. Keep credentials server-side; never use `VITE_` names or commit `.env`.

- `SHOPIFY_STORE_DOMAIN`: your `*.myshopify.com` store domain
- `SHOPIFY_ADMIN_ACCESS_TOKEN`: the installed app's Admin API access token
- `SHOPIFY_API_VERSION`: optional; defaults to `2026-10`
- `ADMIN_API_TOKEN`: long random secret required for live price and stock edits

The storefront reads Shopify products, variants, inventory, and images from the Admin GraphQL API. The admin mutation tool changes the first variant's price and/or inventory quantity. Shopify inventory edits require the variant to track inventory and have inventory at a location.

## WooCommerce demo source

WooCommerce does not connect to a real store in this version. It supplies three fashion sample products and supports temporary price/stock edits in the current browser session to demonstrate synchronization. These demo changes do not affect an external WooCommerce site and reset when the browser session ends.

## Synchronization and manual products

The storefront fetches Shopify products on each catalog request, so it does not depend on Vercel preserving a local JSON file between invocations. WooCommerce demo changes are passed from session storage for the current browser session. Sync history and manual products use the local JSON file; those edits are not durable on Vercel without adding a hosted database.
