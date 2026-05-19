# Architecture - NewApp

## Overview
- Workspace root: multiple data files, SQL snapshots, and a front-end app under `newapp/`.
- App: Vite + React frontoffice/backoffice for a PrestaShop-connected store.

## Top-level structure
```
.
|- .env
|- 1778141087-3250841f.sql
|- images.zip
|- import-data-mai-26 - fichier1.csv
|- import-data-mai-26 - fichier2.csv
|- import-data-mai-26 - fichier3.csv
|- newapp/
|- node_modules/
|- package-lock.json
|- package.json
|- prestashop_modules_api_tables.md
|- PROJECT_SUMMARY.md
|- structure_only.sql
|- tables_relationnelle.md
```

## App structure (newapp/)
```
newapp/
|- .gitignore
|- eslint.config.js
|- index.html
|- node_modules/
|- package-lock.json
|- package.json
|- public/
|- README.md
|- src/
|- vite.config.js
```

## Source structure (newapp/src/)
```
src/
|- App.css
|- App.jsx
|- assets/
|- components/
|- context/
|- index.css
|- main.jsx
|- pages/
|- services/
|- store/
|- utils/
```

## Components
```
src/components/
|- BackofficeLayout.jsx
|- CustomerProtectedRoute.jsx
|- FrontofficeLayout.jsx
|- Navbar.jsx
|- ProtectedRoute.jsx
```

## Context
```
src/context/
|- AuthContext.jsx
|- CartContext.jsx
```

## Services
```
src/services/
|- prestashopApi.js
```

## Pages
```
src/pages/
|- Adresses.jsx
|- Categories.jsx
|- Clients.jsx
|- Commandes.jsx
|- Dashboard.jsx
|- Fournisseurs.jsx
|- Import.jsx
|- Login.jsx
|- Marques.jsx
|- Produits.jsx
|- Promotions.jsx
|- Reinitialisation.jsx
|- Stocks.jsx
|- Taxes.jsx
|- Transporteurs.jsx
|- backoffice/
|  |- Commandes.jsx
|  |- Dashboard.jsx
|  |- Import.jsx
|  |- Reinitialisation.jsx
|- frontoffice/
|  |- Accueil.jsx
|  |- Commande.jsx
|  |- Confirmation.jsx
|  |- FicheProduit.jsx
|  |- MesCommandes.jsx
|  |- Panier.jsx
|  |- ShopLogin.jsx
```

## Frontoffice vs Backoffice
- Frontoffice pages live in `src/pages/frontoffice/` and are protected by customer auth.
- Backoffice pages live in `src/pages/backoffice/` and are protected by employee auth.
- Shared pages (root of `src/pages/`) include data management and admin-style pages.

## Routing entry
- Main routes are defined in `src/App.jsx`.

## Data layer
- All PrestaShop API calls are centralized in `src/services/prestashopApi.js`.

## Notes
- `PROJECT_SUMMARY.md` contains a narrative overview and API notes.
- CSV/ZIP/SQL files in the root are import sources and backups.
