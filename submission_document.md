<div align="center">

# Social Media Analytics Lab

</div>

| | |
|---|---|
| **Name:** Chinmay S. Santosh | **DOP:** 06/10/2026 |
| **Roll No:** 711 | **DOS:** 10/10/2026 |
| **Division:** B | **Score:** ________ |
| **Group:** 6 | |

---

### Project Title
**Catalog Maker: High-Speed Product Catalog Platform**

---

### Approach

The **Catalog Maker Platform** is engineered as a reusable, mobile-first product catalog platform designed for maximum browsing speed, seamless multi-source inventory integration, and high-conversion WhatsApp enquiries. 

#### Methodology & Architecture
1. **Decoupled Architecture & Speed Objective**: Rather than making slow live API queries to external e-commerce systems during customer pageviews, the frontend consumes a high-speed internal REST API connected to a centralized, persistent database layer (`server/db.js`). This architecture guarantees sub-5ms internal query latencies and sub-50ms navigation.
2. **Multi-Source E-Commerce Importers**: Engineered normalized data importers for **Shopify** (55 products), **WooCommerce** (55 products), and **IndiaMART B2B** (25 wholesale products), compiling a total catalog of **135 items**. Normalized fields include SKUs, titles, descriptions, pricing, compare-at prices, stock availability, category taxonomy, and variant matrices.
3. **Synchronization & Source Mutation Simulator**: Implemented an automated sync engine (`server/syncEngine.js`) that detects price changes, inventory updates, and new products while recording audit history logs. Added an Admin Source Mutation tool (`/api/v1/admin/simulate-source-change`) to demonstrate live external store changes propagating into the catalog.
4. **Dual Frontend Catalog Templates**: Developed two dynamically switchable frontend designs:
   - **Theme 1: Rajdhani Royal Luxury**: Obsidian emerald & metallic gold dark theme (inspired by `rajdhanicarpets.com`).
   - **Theme 2: Velox Glassmorphic**: Modern high-tech acrylic glass light theme.
5. **WhatsApp Enquiry & Wishlist Engine**: Built an account-free wishlist backed by `localStorage` and a multi-product selection bar that builds pre-filled WhatsApp inquiry text listing product titles, SKUs, pricing, and URLs targeting **`+919833113449`**.
6. **Vercel Serverless Hosting**: Built Express serverless function adapters (`api/index.js`) and `vercel.json` routing for deployment on Vercel and GitHub.

---

### Screenshots & Verification Highlights

- **Figure 1: Rajdhani Royal Luxury Public Catalog Interface**
  *Features obsidian gold aesthetic, instant search input, touch-scrollable category navigation, live in-stock badges, and sub-5ms API response latency.*

- **Figure 2: Product Pop-Up Modal & High-Resolution Image Lightbox**
  *Displays product specifications, variant choices, related recommendations, fullscreen image zoom, and direct WhatsApp inquiry trigger.*

- **Figure 3: Multi-Select WhatsApp Enquiry Floating Action Bar**
  *Enables multi-item selection with estimated subtotal calculations, generating a pre-filled WhatsApp inquiry targeting `+919833113449`.*

- **Figure 4: Administrator Management Portal & Sync Engine Control**
  *Overview metrics dashboard, product CRUD, external store data mutation simulator, and live sync execution audit logs.*

---

### Final Submission Details
- **Project Title**: Catalog Maker: High-Speed Product Catalog Platform
- **Configured WhatsApp Number**: `+919833113449`
- **GitHub Repository**: `https://github.com/ChinmaySantosh/catalog-maker-platform`
- **Vercel Live Hosted URL**: `https://catalog-maker-platform.vercel.app`
