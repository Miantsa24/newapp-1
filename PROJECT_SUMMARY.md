# NewApp Project Summary (PrestaShop Front/Back Office)

This document reflects the current state of the project and explains it end-to-end so a new developer can rebuild, run, and understand it.

## 1) What This Project Is
- A React + Vite app that provides two UIs:
  - Backoffice (employee): import data, manage orders, reset data.
  - Frontoffice (customer): browse products, add to cart, place orders, view order history.
- Data is stored in a PrestaShop 8.2.x instance and accessed through the PrestaShop Webservice API.

## 2) Tech Stack
- React (Vite)
- React Router
- PrestaShop Webservice (XML API)
- Tailwind (via @tailwindcss/vite)
- JSZip for ZIP images import

## 3) Architecture (Current)
### 3.1 High-level system
```
[Browser]
  | React Frontoffice (customer)
  | React Backoffice (employee)
  v
[Vite dev server]
  | /api-prestashop proxy
  v
[PrestaShop Webservice API]
  v
[PrestaShop Database]
```

### 3.2 Runtime flow
1) UI calls the API helpers in `prestashopApi.js`.
2) Helpers call `/api-prestashop/...` (proxied to PrestaShop).
3) PrestaShop returns XML; data is parsed in the UI.

### 3.3 Authentication model
- Employee session and customer session are stored in `sessionStorage`.
- Customer orders page filters by the logged-in customer id.

## 4) Folder Structure (Core)
- newapp/src
  - components
    - BackofficeLayout, FrontofficeLayout, ProtectedRoute, CustomerProtectedRoute
  - context
    - AuthContext (employee + customer session)
    - CartContext (frontoffice cart)
  - pages
    - backoffice: Import, Reinitialisation, Commandes
    - frontoffice: Accueil, FicheProduit, Panier, Commande, Confirmation, MesCommandes, ShopLogin
  - services
    - prestashopApi.js (all API calls)

## 5) How It Works
### 4.1 Authentication
- Employee login uses AuthContext.loginAsEmployee.
- Customer login uses AuthContext.loginAsCustomer.
- Sessions stored in sessionStorage.

### 4.2 Frontoffice
- Accueil lists products and categories (filtered by search/category).
- FicheProduit shows product details and allows add-to-cart.
- Panier shows cart items, quantities, and total.
- Commande creates a PrestaShop order.
- MesCommandes shows only the logged-in customer orders.

### 4.3 Backoffice
- Import: supports multiple CSV + ZIP images. Auto-detects modules by headers.
- Reinitialisation: deletes resources by API, with pagination and ordered category delete.

## 6) API / PrestaShop Notes
Base URL (through Vite proxy):
- /api-prestashop -> http://localhost/Prestashop/api

Webservice key is defined in:
- newapp/src/services/prestashopApi.js (API_KEY)

### 5.1 Required API Permissions
Your PrestaShop webservice key must allow:
- GET, POST, PUT, DELETE on products, categories, customers, orders, stock_availables, images

### 5.2 Important API Behaviors
- The API is paginated. When deleting, you must fetch all IDs.
- Some fields are not writable (ex: quantity, manufacturer_name on PUT).
- Orders require a valid secure_key tied to the customer.

## 7) Running Locally
From:
- C:\xampp\htdocs\newapp\newapp

Commands:
- npm install
- npm run dev

Lint:
- npm run lint

## 8) Import Workflow (Backoffice)
### 7.1 CSV Files (example)
- File 1: Products
  - date_availability_produit, nom, reference, prix_ttc, categorie, prix_achat
- File 2: Variants/Stock
  - reference, stock_initial, karazany
- File 3: Customers/Orders
  - nom, email, pwd, adresse, achat, etat

### 7.2 ZIP Images
- Images named with product reference, ex: T_01.jpg

### 7.3 Import Steps
1) Categories (explicit + extracted from products)
2) Products (with category association)
3) Customers (create or reuse existing by email)
4) Orders (use customer secure_key)
5) Images (upload by reference)
6) Stock (stock_availables updated by reference)

### 7.4 Common Import Issues and Fixes
- Price with commas: convert 12,5 -> 12.5 before sending.
- If customer already exists: fetch by email and use secure_key.
- If a product category is missing: create category first.

## 9) Reset Workflow (Backoffice)
- Fetch all IDs (paginated).
- Delete in correct order:
  - Categories: delete deepest first (keep id 1 and 2).
- Show failed deletes so you can fix permissions.

## 10) Frontoffice Display Rules
- A product may be visible in BO but not FO if:
  - Stock is zero and out-of-stock is disabled.
  - Product is not associated with a category.
  - Product is not associated with the active shop.

## 11) Key Files to Know
- newapp/src/services/prestashopApi.js
  - All API calls and helpers
- newapp/src/pages/backoffice/Import.jsx
  - CSV/ZIP import logic
- newapp/src/pages/backoffice/Reinitialisation.jsx
  - Reset logic
- newapp/src/pages/frontoffice/MesCommandes.jsx
  - Orders filtered by logged-in customer

## 12) PrestaShop Tables / Relations
Reference the following docs in this repo:
- tables_relationnelle.md
- prestashop_modules_api_tables.md

They describe how API modules map to PrestaShop tables.

## 13) Rebuild Checklist (New Developer)
1) Install XAMPP + PrestaShop 8.2.x.
2) Enable Webservice and create API key with full permissions.
3) Set proxy in Vite to /api-prestashop.
4) Install dependencies and run the app.
5) Import data via Backoffice Import.
6) Verify products, stock, categories, and orders in FO and BO.

## 14) Troubleshooting
- 401/403: Webservice permissions or API key incorrect.
- 404 on delete: ID does not exist or deleted already.
- 400 on PUT: XML contains non-writable fields.
- 500 on order: invalid carrier/currency/lang/country or missing secure_key.
