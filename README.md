# Catalog Maker

A fashion product catalog and store management demo for clothing, shoes, and jewellery. The app provides a customer-facing catalog and an admin area for managing manual products, importing Shopify products, synchronizing catalog data, and testing product updates against a connected Shopify store.

## Features

- Browse and search products by category, stock status, and price.
- View product details, available quantities, wishlists, and WhatsApp inquiry actions.
- Choose between the available catalog designs in the admin area.
- Add manual catalog products. These are saved in the current browser's local storage.
- Import live products from Shopify and synchronize the local catalog with Shopify.
- Update the first variant's title, price, and/or inventory in Shopify from the admin mutation tool.
- Show a WooCommerce demo connection status. WooCommerce is not connected to a real store and does not supply products in this version.
- Run as a Vite/React frontend with an Express API locally, or deploy through the included Vercel configuration.

## Requirements

- Node.js 20.19+ or 22.12+ (required by the current Vite version).
- npm.
- A Shopify store and a Shopify app with the Admin API access scopes listed below for live Shopify features.

## Run locally

From the repository root:

```sh
npm install
npm install --prefix client
```

Copy `.env.example` to `.env`, fill in the server-side settings, then start the frontend and API together:

```sh
npm run dev
```

The Vite development server prints the frontend URL in the terminal. The Express API runs on `http://localhost:5000` by default. To create a production frontend build:

```sh
npm run build
```

The build script creates `client/dist` and copies it to the root `dist` directory.

## Environment variables

Set these in the root `.env` for local development and in the Vercel project's Environment Variables for deployment. Never put Shopify credentials in frontend variables (for example, names starting with `VITE_`) or commit them to Git.

| Variable | Required | Description |
| --- | --- | --- |
| `SHOPIFY_STORE_DOMAIN` | For Shopify | Store domain, such as `your-store.myshopify.com`; do not use the storefront URL. |
| `SHOPIFY_CLIENT_ID` | For Shopify | Client ID from the Shopify app. |
| `SHOPIFY_CLIENT_SECRET` | For Shopify | Client secret from the same Shopify app. Keep it private. |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | Alternative | Optional legacy static Admin API token. When set, it takes precedence over client credentials. |
| `SHOPIFY_API_VERSION` | No | Shopify Admin API version; defaults to `2026-10` in the current connector. |
| `ADMIN_API_TOKEN` | For protected mutations | Long, randomly generated secret used to authorize Shopify product mutations. |
| `PORT` | No | Local Express port; defaults to `5000`. |

For example, `.env.example` documents the variable names and placeholder values. Replace placeholders with your own values; do not copy real credentials into this README.

## Configure Shopify

1. Create the Shopify app in the Shopify Dev Dashboard and install it on the store.
2. Grant the app the Admin API scopes `read_products`, `write_products`, `read_inventory`, and `write_inventory`.
3. Add the store domain, client ID, client secret, and a strong `ADMIN_API_TOKEN` to the environment.
4. Restart the local server or redeploy the Vercel project after saving environment variables.
5. Open the admin area and use the Shopify import action to load products.

Shopify product and inventory updates affect the live store. The mutation tool currently targets the product's **first variant**. To change stock, that variant must have **Track quantity** enabled and inventory assigned to a Shopify location. Leave the stock field empty when changing only title or price.

## Deploy to Vercel

The repository includes `vercel.json` for the API routes and built frontend. Connect the Git repository to Vercel and configure:

- **Root Directory:** `./` (repository root)
- **Install Command:** `npm install && npm install --prefix client`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

Add the Shopify environment variables in Vercel Project Settings → Environment Variables for the environments you deploy (usually Production, and Preview if needed). Redeploy after changing environment variables. The credentials must remain server-side.

## Data and deployment notes

- Manual products and Shopify synchronization snapshots/history in the browser are browser-local; they are not shared between browsers or devices.
- The API's JSON database is suitable for local/demo use. Vercel functions have ephemeral filesystems, so file-based data such as manual catalog records, settings, and server sync history should not be treated as durable in production. Use a hosted database before relying on shared persistent admin data.
- Shopify is the only live store connector in this version. WooCommerce is intentionally a mock connection and does not import or update a real WooCommerce catalog.
- Shopify stock mutation is subject to Shopify inventory tracking and location rules. The app does not automatically enable tracking or assign inventory locations.

## Project layout

```text
api/                  Vercel serverless API entry points
client/               React + Vite frontend
  src/pages/           Catalog and admin pages
  src/context/         Catalog and wishlist state
server/                Express API and store connectors
  connectors/          Shopify live connector and WooCommerce demo connector
  importers/           External product normalization
  routes/              Catalog and admin API routes
data/                  Local JSON database seed/data
```

## Useful commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start Express and Vite for local development. |
| `npm run server` | Start only the Express server. |
| `npm run client` | Start only the Vite frontend. |
| `npm run build` | Build the frontend for deployment and copy it to root `dist`. |

## Security

Do not commit `.env`, Shopify client secrets, Admin API tokens, or the admin mutation token. If a credential is exposed, revoke or rotate it in Shopify/Vercel and update the deployment environment.
