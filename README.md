# Catalog Maker

A fashion-focused product catalog and store management platform for clothing, shoes, and jewellery. Customers can explore products, check availability, save favourites, and contact the store. Administrators can import and synchronize Shopify products, manage catalog entries, and update live Shopify product information.

## What it does

- Presents a responsive storefront with product search, category filters, pricing, and stock quantities.
- Provides product detail views, wishlists, and WhatsApp inquiry links.
- Offers catalog design and store settings in an admin area.
- Imports products from a connected Shopify store and synchronizes catalog data on request.
- Supports live Shopify title, price, and inventory updates through the admin mutation feature.
- Allows manual catalog products; these are saved in the current browser.
- Includes a WooCommerce demo connection indicator. WooCommerce is not connected to a real store in this version.

## Technology

- **Frontend:** React 19, Vite, JavaScript, CSS
- **Backend:** Node.js, Express
- **Store integration:** Shopify Admin GraphQL API
- **Deployment:** Vercel

## Shopify connection

To use live Shopify import, synchronization, and product updates, create and install a Shopify app with these Admin API scopes:

- `read_products`
- `write_products`
- `read_inventory`
- `write_inventory`

Configure the following environment variables in **Vercel → Project Settings → Environment Variables**, then redeploy:

| Variable | Purpose |
| --- | --- |
| `SHOPIFY_STORE_DOMAIN` | Store domain, such as `your-store.myshopify.com`. |
| `SHOPIFY_CLIENT_ID` | Client ID for the installed Shopify app. |
| `SHOPIFY_CLIENT_SECRET` | Client secret for that app. Keep it private. |
| `ADMIN_API_TOKEN` | Secret required to authorize product mutations from the admin area. |
| `SHOPIFY_API_VERSION` | Optional Admin API version; defaults to `2026-10`. |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | Optional legacy token; takes precedence over the client credentials when set. |

Keep all credentials server-side. Do not expose them through frontend variables such as `VITE_*`, or commit them to the repository.

### Product mutations

The mutation feature changes the first variant of the selected Shopify product. A stock update requires that variant to have **Track quantity** enabled and inventory assigned to a Shopify location. Leave the stock field empty when changing only the title or price. Updates apply to the live Shopify store.

## Deployment

This repository includes a Vercel configuration. Use the repository root as the **Root Directory** and configure these project settings:

- **Install Command:** `npm install && npm install --prefix client`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

Add the Shopify variables for each Vercel environment where the app should connect to Shopify. Redeploy after changing environment variables.

## Data behavior

- Shopify is the live commerce integration. WooCommerce is a demo status only and does not import or modify a WooCommerce store.
- Manually added products and Shopify sync snapshots/history are browser-local and are not shared across devices.
- The API uses a JSON file for settings and server-side data. Vercel serverless filesystems are ephemeral, so this data should not be treated as durable production storage. A hosted database is needed for reliable shared persistence.

## Project structure

```text
api/                  Vercel serverless API entry points
client/               React storefront and admin interface
  src/components/      Reusable catalog UI components
  src/context/         Catalog and wishlist state
  src/pages/           Storefront and admin pages
server/                Express API and synchronization logic
  connectors/          Shopify and WooCommerce connectors
  importers/           Product normalization
  routes/              Catalog and admin API routes
data/                  Local JSON data
vercel.json            Vercel routing and build configuration
```

## Security

Never commit `.env`, Shopify client secrets, Admin API tokens, or `ADMIN_API_TOKEN`. If a credential is exposed, revoke or rotate it in Shopify and update the Vercel environment variables.
