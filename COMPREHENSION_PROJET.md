# Compréhension Générale du Projet — NewApp

## Vue d'ensemble

**NewApp** est une application web **SPA (Single Page Application)** développée en **React 19** avec **Vite** comme bundler. Elle sert d'interface graphique complète pour une boutique e-commerce propulsée par **PrestaShop 8.2.6**, en communiquant exclusivement via l'**API REST XML** de PrestaShop. Il n'y a pas de backend Node.js propre : toute la logique métier côté serveur est déléguée à PrestaShop.

L'application est divisée en deux univers distincts :

- **Backoffice** : interface d'administration sécurisée (gestion produits, catégories, clients, commandes)
- **Frontoffice** : vitrine publique accessible aux clients (catalogue, panier, commande, espace personnel)

---

## Stack technologique

| Domaine | Technologie | Version |
|---|---|---|
| Framework UI | React | 19.2.5 |
| Bundler / Dev server | Vite | 8.0.10 |
| Routing | React Router DOM | 7.15.0 |
| Notifications | React Hot Toast | 2.6.0 |
| Hashing passwords | bcryptjs | 3.0.3 |
| Compression | JSZip | 3.10.1 |
| Linting | ESLint | 10.2.1 |
| Backend (externe) | PrestaShop | 8.2.6 |

Aucune bibliothèque de gestion d'état globale (Redux, Zustand) n'est utilisée. L'état global se limite au **React Context API** (panier d'achat). Aucun framework CSS externe (Tailwind, Bootstrap) n'est présent ; les styles sont écrits en CSS pur (`App.css`, `index.css`, `input.css`).

---

## Structure du projet

```
e:\NewApp/
├── src/
│   ├── App.jsx               # Composant racine, router principal
│   ├── main.jsx              # Point d'entrée React
│   ├── pages/
│   │   ├── back/             # Pages Backoffice (admin)
│   │   │   ├── auth/         # Login admin
│   │   │   ├── dashboard/    # Tableau de bord
│   │   │   ├── products/     # CRUD produits + import CSV
│   │   │   ├── categories/   # CRUD catégories
│   │   │   ├── customers/    # CRUD clients
│   │   │   ├── orders/       # Consultation commandes
│   │   │   └── reinitialisation/
│   │   ├── front/            # Pages Frontoffice (client)
│   │   │   ├── HomePage.jsx
│   │   │   ├── ProductPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── CustomerLoginPage.jsx
│   │   │   ├── OrderConfirmationPage.jsx
│   │   │   ├── MyOrdersPage.jsx
│   │   │   └── OrderDetailsPage.jsx
│   │   └── NotFound.jsx
│   ├── components/
│   │   ├── front/            # Composants spécifiques au vitrine
│   │   ├── products/         # Tableaux, formulaires produits
│   │   ├── categories/       # Tableaux, formulaires catégories
│   │   ├── customers/        # Tableaux, formulaires clients
│   │   ├── ui/               # Composants UI génériques
│   │   ├── Sidebar.jsx       # Navigation latérale admin
│   │   ├── Navbar.jsx        # Barre de navigation
│   │   ├── ProtectedRoute.jsx
│   │   └── ModuleCard.jsx
│   ├── services/             # Couche d'accès à l'API PrestaShop
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── categoryService.js
│   │   ├── customerService.js
│   │   ├── orderService.js
│   │   ├── customerAuthService.js
│   │   ├── stockService.js
│   │   ├── featureService.js
│   │   ├── featureValueService.js
│   │   ├── manufacturerService.js
│   │   ├── imageService.js
│   │   ├── addressService.js
│   │   ├── reinitialisationService.js
│   │   ├── importOrchestratorService.js
│   │   ├── combinationService.js
│   │   └── productBusinessRules.js
│   ├── models/               # Classes de données métier
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Customer.js
│   │   ├── Image.js
│   │   ├── Feature.js
│   │   ├── FeatureValue.js
│   │   ├── ProductFeature.js
│   │   ├── StockAvailable.js
│   │   ├── ProductType.js
│   │   └── Manufacturer.js
│   ├── context/
│   │   └── CartContext.jsx   # Panier global (Context API)
│   ├── hooks/
│   │   └── useProducts.js    # Hook custom pour les produits
│   ├── utils/
│   │   ├── xmlParser.js      # Parsing des réponses XML PrestaShop
│   │   ├── csvParser.js      # Parsing CSV pour import produits
│   │   ├── imageUtils.js
│   │   ├── priceUtils.js
│   │   └── productBadge.js
│   └── config/
│       └── api.js            # Configuration URL de base de l'API
├── doc/                      # Documentation interne (21 fichiers)
├── public/
├── dist/                     # Build de production (généré)
├── .env                      # Variables d'environnement
├── vite.config.js
├── package.json
└── index.html
```

---

## Architecture et flux de données

L'application suit un **pattern MVC-like** adapté au frontend React :

```
┌─────────────────── React SPA ───────────────────────┐
│                                                      │
│   Pages / Components  ←──→  Context (CartContext)   │
│          │                                           │
│          ▼                                           │
│       Services  (authService, productService, ...)   │
│          │                                           │
│          ▼                                           │
│       Models   (Product, Category, Customer, ...)    │
│          │                                           │
│          ▼                                           │
│       Utils    (xmlParser, csvParser, ...)           │
│                                                      │
└──────────────────────┬───────────────────────────────┘
                       │  HTTP (fetch) + XML
                       ▼
        ┌──────────────────────────────┐
        │   PrestaShop 8.2.6 API REST  │
        │   /api/products              │
        │   /api/categories            │
        │   /api/customers             │
        │   /api/orders                │
        │   /api/stock_availables      │
        │   ...                        │
        └──────────────────────────────┘
```

**Rôle de chaque couche :**

- **Pages** : logique d'écran, orchestration des appels de services
- **Components** : UI réutilisable, formulaires, tableaux
- **Services** : appels `fetch` vers PrestaShop, sérialisation/désérialisation XML, gestion d'erreurs
- **Models** : classes JS représentant les entités métier (Product, Category, etc.)
- **Utils** : fonctions pures utilitaires (parsing XML, CSV, formatage prix, etc.)
- **Context** : état global du panier, partagé entre toutes les pages frontoffice

---

## Communication avec PrestaShop

Toutes les données transitent via l'**API REST XML de PrestaShop**. Vite est configuré avec un **proxy** pour éviter les problèmes CORS en développement :

```
VITE_API_URL=http://localhost/prestashop_edition_classic_version_8.2.6/api
VITE_API_KEY=JV5IGYCPDS7RCMRQ8RJWKZPBQDIT3GPW
```

Les services utilisent `fetch` avec authentification **HTTP Basic** (clé API en base64). Les réponses XML sont parsées par `xmlParser.js` via le `DOMParser` natif du navigateur.

Exemple de cycle complet (chargement des produits) :

1. `ProductList.jsx` appelle `productService.getProducts()`
2. `productService.js` fait `fetch('/api/products', { headers: { Authorization: 'Basic ...' } })`
3. La réponse XML est parsée par `xmlParser.js`
4. Les données sont mappées sur des instances de `Product.js`
5. Le composant reçoit le tableau de produits et l'affiche

---

## Authentification et sécurité

### Backoffice (administrateur)

- L'admin se connecte via `/admin/login`
- `authService.js` vérifie les identifiants contre les données PrestaShop (email + hash bcrypt du mot de passe)
- La session est stockée dans le **localStorage** avec un timestamp
- **Timeout de session : 30 minutes** d'inactivité
- **Avertissement : 5 minutes avant expiration** (modal ou toast)
- Les événements `mousedown`, `keydown`, `touchstart` réinitialisent le timer d'inactivité
- `ProtectedRoute.jsx` wrape toutes les routes admin et redirige vers `/admin/login` si la session est expirée

### Frontoffice (client)

- `customerAuthService.js` gère l'authentification des clients de la boutique
- Pas de protection de route sur le frontoffice (accès libre au catalogue)
- Le panier est géré via `CartContext` et synchronisé avec PrestaShop

---

## Routing

Le routeur est défini dans `App.jsx` via **React Router v7** :

| Chemin | Composant | Accès |
|---|---|---|
| `/` | `HomePage` | Public |
| `/product/:id` | `ProductPage` | Public |
| `/cart` | `CartPage` | Public |
| `/checkout` | `CheckoutPage` | Public |
| `/login` | `CustomerLoginPage` | Public |
| `/order-confirmation` | `OrderConfirmationPage` | Public |
| `/my-orders` | `MyOrdersPage` | Public |
| `/order/:id` | `OrderDetailsPage` | Public |
| `/admin/login` | `LoginPage` | Public |
| `/admin/dashboard` | `Dashboard` | **Protégé** |
| `/admin/products` | `ProductList` | **Protégé** |
| `/admin/products/:id` | `ProductDetail` | **Protégé** |
| `/admin/products/:id/edit` | `ProductEdit` | **Protégé** |
| `/admin/products/import` | `ProductImportPage` | **Protégé** |
| `/admin/categories` | `CategoryList` | **Protégé** |
| `/admin/customers` | `CustomerList` | **Protégé** |
| `/admin/orders` | `OrderList` | **Protégé** |
| `/admin/reinitialisation` | `ReinitialisationPage` | **Protégé** |
| `*` | `NotFound` | Public |

---

## Fonctionnalités détaillées

### Backoffice

| Module | Fonctionnalités |
|---|---|
| **Produits** | Lister, créer, éditer, supprimer ; upload d'images ; gestion de stock ; gestion des variantes/combinaisons ; import CSV |
| **Catégories** | CRUD complet ; hiérarchie parent/enfant ; upload d'images |
| **Clients** | Lister, créer, éditer ; gestion des adresses ; consultation de l'historique commandes |
| **Commandes** | Lister les commandes ; voir le détail d'une commande |
| **Réinitialisation** | Fonctionnalité de reset/maintenance des données |

### Frontoffice

| Module | Fonctionnalités |
|---|---|
| **Catalogue** | Affichage des produits, filtres, recherche multi-critères, badges (NEW, HOT…) |
| **Produit** | Détail produit, sélection de variantes, ajout au panier |
| **Panier** | Ajout/modification/suppression d'articles, calcul du total |
| **Commande** | Processus checkout multi-étapes, livraison, confirmation |
| **Espace client** | Connexion, liste de mes commandes, détail d'une commande |

---

## Configuration et variables d'environnement

Le fichier `.env` expose les variables suivantes (préfixées `VITE_` pour être accessibles côté client) :

```env
VITE_API_URL=http://localhost/prestashop_edition_classic_version_8.2.6/api
VITE_APP_NAME=NewApp
VITE_VERSION=1.0
VITE_API_KEY=JV5IGYCPDS7RCMRQ8RJWKZPBQDIT3GPW
```

La configuration Vite (`vite.config.js`) met en place :
- L'alias `@` → `./src` pour les imports absolus
- Un proxy `/prestashop_edition_classic_version_8.2.6/api` → `http://localhost` (contourne CORS en dev)
- Un proxy pour les images PrestaShop

---

## Scripts disponibles

```bash
npm run dev      # Lance le serveur de développement Vite (HMR actif)
npm run build    # Génère le build de production dans dist/
npm run preview  # Prévisualise le build de production en local
npm run lint     # Vérifie le code avec ESLint
```

---

## Documentation interne

Le dossier `doc/` contient 21 fichiers de documentation rédigés au fil du développement :

- `architecture.md` — structure et conventions du projet
- `api-guide.md` — guide d'utilisation de l'API PrestaShop
- `authentication-and-security.md` — détail du système d'auth et de sécurité
- `USER_GUIDE.md` — guide utilisateur de l'application
- `WORKFLOW_SCENARIOS.md` — scénarios d'utilisation métier
- `IMPLEMENTATION_SUMMARY.md` — résumé des fonctionnalités implémentées
- `CHANGELOG.md` — historique des versions
- `IMPLEMENTATION_CHECKLIST.md` — état de l'implémentation (337 lignes)
- `react-api-xml-maitrise.md` — guide technique React + API XML
- `crud-product-apprentissage-guide.md` — guide CRUD produits
- `explication-parse-et-fonctions-xml.md` — explication du parsing XML
- `import.md` — guide d'import de produits
- `css.md` — conventions CSS

---

## Points forts et limites identifiés

### Points forts

- Architecture claire, séparation des responsabilités bien respectée
- Sécurité backoffice robuste (sessions avec timeout, bcrypt)
- 16 services bien structurés couvrant toutes les entités PrestaShop
- Documentation interne très fournie (21 fichiers)
- Utilisation du `DOMParser` natif pour le parsing XML (zéro dépendance externe)
- CartContext bien conçu pour partager l'état du panier globalement

### Limites et pistes d'amélioration

- **Aucun test** (ni unitaires, ni d'intégration, ni e2e) — risque élevé de régression
- **Pas de TypeScript** — les modèles utilisent des classes JS sans typage fort
- **Pas de système de cache** — chaque navigation refait des appels API
- **Pas de bibliothèque de formulaire** (React Hook Form, Formik) — validation manuelle
- **Styles 100% CSS custom** — maintenance plus lourde, pas d'utilitaires type Tailwind
- **Clé API dans `.env`** — ne pas committer ce fichier, gérer via CI/CD en production
- **Pas de gestion d'erreur globale** — chaque service gère ses erreurs localement
- **Fichiers en doublon** (`src/pages/back/products/` vs `src/pages/products/`) — traces d'une migration incomplète

---

## Résumé en une phrase

**NewApp est une SPA React/Vite servant d'interface complète (backoffice admin sécurisé + frontoffice client) pour une boutique PrestaShop 8.2.6, en communiquant exclusivement via l'API REST XML de PrestaShop, sans backend propre.**
