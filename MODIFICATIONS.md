# Journal des modifications — NewApp / PrestaShop

> Projet : Intégration NewApp ↔ PrestaShop 8
> Dernière mise à jour : 2026-05-16

---

## Fichiers modifiés

### 1. `newapp/src/services/prestashopApi.js`

#### 1.1 `getProductStock` et `getStockAvailables` (ajout)
**Problème** : Les produits affichaient toujours "Rupture de stock" dans le catalogue frontoffice. La quantité extraite du XML produit PrestaShop est toujours vide — le stock réel est dans `/stock_availables`.  
**Correction** :
- Ajout de `export const getStockAvailables` : récupère tous les stock_availables en un appel
- Ajout de `export const getProductStock(productId)` : stock d'un produit spécifique (utilisé dans FicheProduit)

#### 1.2 `fetchProductCombinations` (ajout)
**Problème** : FicheProduit ne pouvait pas afficher les déclinaisons ni leur stock.  
**Correction** : Nouvelle fonction qui, pour un produit donné :
1. Récupère toutes les combinaisons (`/combinations`)
2. Récupère les valeurs d'attributs (`/product_option_values`) et groupes (`/product_options`) en parallèle
3. Récupère le stock par combinaison (`/stock_availables`)
4. Retourne un tableau `[{ id, stock, priceImpact, options: [{valueId, valueName, groupName}] }]`

**Correction supplémentaire** : Ajout du champ `priceImpact` (extrait de `<price>` dans le nœud combinaison) pour afficher le prix correct selon la déclinaison sélectionnée.

#### 1.3 `createAttributeGroup` (correction XML + recherche insensible à la casse)
**Problème** : La balise `<public_name>` avait `</language>` manquant avant `</public_name>` → XML malformé → PS retournait 400 → aucun groupe d'attribut créé.  
**Problème 2** : La recherche `filter[name]=taille` est sensible à la casse. PS installe par défaut des groupes "Taille" et "Couleur" (majuscule) → non trouvés → tentative de création échouait.  
**Correction** :
- Ajout d'une recherche insensible à la casse en scannant tous les groupes existants si le filtre exact ne retourne rien
- Correction du XML : `<public_name><language id="1"><![CDATA[...]]></language></public_name>`

#### 1.4 `createAttributeValue` (déduplication)
**Problème** : Chaque ré-import créait des doublons (ngoza×2, kely×2, etc.)  
**Correction** : Vérification d'existence avant création via `filter[id_attribute_group]` + `filter[name]`.

#### 1.5 `createCombination` (prix ignoré → corrigé)
**Problème** : Le paramètre `price` était accepté en argument mais le XML envoyait toujours `<price>0</price>` hardcodé.  
**Correction** : `<price>${parseFloat(price || 0).toFixed(6)}</price>` utilise maintenant le paramètre.

#### 1.6 `importProducts` — association catégories + groupe TVA (correction visibilité PS)
**Problème** : Les produits importés n'apparaissaient ni dans le backoffice ni le frontoffice PrestaShop. `id_category_default` seul ne suffit pas — PS requiert un bloc `<associations><categories>` pour lier le produit à sa catégorie dans la table `category_product`.  
**Problème 2** : `id_tax_rules_group=0` désactive la TVA française.  
**Correction** :
```xml
<id_tax_rules_group>1</id_tax_rules_group>
<associations>
  <categories>
    <category><id>2</id></category>
    <category><id>${catId}</id></category>
  </categories>
</associations>
```

---

### 2. `newapp/src/pages/backoffice/Import.jsx`

#### 2.1 `parseCsvRobust` — normalisation des clés d'en-tête (bug racine des combinaisons)
**Problème** : Les lignes CSV étaient stockées avec les en-têtes originaux comme clés (`row["specificité"]`). Tout le code d'import lit `row.specificite` (sans accent) → toujours `undefined` → étapes 3a/3b/3c du bloc variantes ignorées silencieusement.  
**Correction** : Normalisation de la clé dans `parseCsvRobust` lors de la construction de l'objet ligne :
```js
const key = h.toLowerCase().trim().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '_')
obj[key] = values[i]
```

#### 2.2 Étape 3a — Groupes d'attributs (erreurs visibles)
**Avant** : `catch {}` vide → échec silencieux  
**Après** : `catch (e) { res.errors.push(...) }` + message si ID non retourné

#### 2.3 Étape 3b — Valeurs d'attributs (erreurs visibles + guard explicite)
**Avant** : Si `groupIds[specificite]` absent → skip silencieux  
**Après** : Message d'erreur explicite "groupe X introuvable" + erreurs de création visibles

#### 2.4 Étape 3c — Combinaisons : calcul du prix + erreurs visibles
**Problème** : L'impact de prix était toujours `0` passé à `createCombination`.  
**Correction** :
```js
const basePrice = parseNumber(baseProductRow?.prix_ttc || 0)
const variantPrice = parseNumber(variant.prix_vente_ttc || 0)
const priceImpact = variantPrice > 0 ? +(variantPrice - basePrice).toFixed(6) : 0
```
Résultats attendus :
- T_01/ngoza : impact = 0 (12,50 − 12,50)
- T_01/kely  : impact = +2,50 (15 − 12,50)
- P_01/mainty : impact = +4,50 (23,49 − 18,99)
- P_01/fotsy  : impact = 0 (18,99 − 18,99)

Tous les `catch {}` remplacés par `res.errors.push(...)` pour visibilité dans l'UI.

---

### 3. `newapp/src/pages/frontoffice/Accueil.jsx`

#### 3.1 Stock des produits dans le catalogue
**Problème** : Tous les produits affichaient "Rupture de stock" — le champ `quantity` extrait du XML produit est vide dans PS8.  
**Correction** : Import de `getStockAvailables`, construction d'une map `{ id_product → qty }` en filtrant `id_product_attribute = 0`, utilisée à la place de `p.querySelector('quantity')`.

#### 3.2 Badges HOT / NEW selon `date_availability_produit` — correction bug date future
**Fonctionnalité** : La fonction `getProductBadge` est implémentée et affiche un badge coloré sur l'image du produit dans le catalogue :
- `HOT` (rouge) : produit sorti il y a ≤ 1 jour
- `NEW` (bleu) : produit sorti entre 1 et 7 jours

**Bug corrigé** : La condition `diffDays <= 1` était vraie pour les dates futures (diffDays négatif), affichant HOT sur des produits pas encore disponibles.  
**Correction** :
```js
if (diffDays >= 0 && diffDays <= 1) return { label: 'HOT', color: 'bg-red-500' }
if (diffDays > 1 && diffDays <= 7) return { label: 'NEW', color: 'bg-sky-500' }
```

**Note** : Les données de test actuelles (dates entre décembre 2025 et mai 2026) ont toutes plus de 7 jours d'ancienneté au 16/05/2026 — aucun badge ne s'affiche avec ces données, mais la logique est fonctionnelle.

---

### 4. `newapp/src/pages/frontoffice/FicheProduit.jsx`

#### 4.1 Affichage des déclinaisons (karazany) avec sélection obligatoire
**Fonctionnalité** : Section "déclinaisons" affichée avant le bouton panier si le produit a des combinaisons. Chaque groupe d'attributs (ex : "taille") affiche des boutons de sélection. L'ajout au panier est désactivé tant qu'aucune déclinaison n'est sélectionnée.

États du bouton :
- "Choisissez une déclinaison" (grisé) si combinaisons non sélectionnées
- "Rupture de stock" (grisé) si stock = 0 pour la déclinaison choisie  
- "🛒 Ajouter au panier" (actif, bleu) sinon

#### 4.2 Prix dynamique selon la déclinaison sélectionnée
**Problème** : Le prix affiché était toujours `product.price` (prix de base).  
**Correction** :
```jsx
{selectedCombination
  ? (parseFloat(product.price) + (selectedCombination.priceImpact || 0)).toFixed(2)
  : product.price} €
```

#### 4.3 Stock réel depuis `/stock_availables`
**Correction** : Utilisation de `getProductStock(id)` au lieu de lire le champ `quantity` du XML produit.

#### 4.4 `combination_label` dans le panier
**Problème** : L'étiquette de combinaison stockait les IDs au lieu des noms (`"26 / 27"` au lieu de `"ngoza / kely"`).  
**Correction** : `selectedCombination.options.map(o => o.valueName).join(' / ')`

---

### 5. `newapp/src/services/prestashopApi.js` — `createOrder` et `createOrderFromData` (refactoring majeur)

**Problème** : Les deux fonctions créaient les commandes via le WebService PS `/orders` → HTTP 500 systématique en PS8 (`validateOrder` ne fonctionne pas via le WS).  
**Correction** : Les deux fonctions délèguent maintenant à `order.php` via le proxy `/api-create-order` :

- `createOrder` (utilisateur anonyme) : crée encore le client via WS, puis appelle `callOrderPhp`
- `createOrderFromData` (client connecté) : appelle directement `callOrderPhp` avec `customer.customerId`
- `callOrderPhp` (helper interne) : POST JSON vers `/api-create-order` avec `{ customer_id, items, order_state_label, address }`

Les items transmis incluent `id_product_attribute` pour supporter les combinaisons (déclinaisons).

---

### 6. `Prestashop/modules/stockdelta/order.php` — support `id_product_attribute`

**Problème** : `$cart->updateQty(...)` passait toujours `null` pour l'attribut de produit — les paniers avec combinaisons (ex : T_01/ngoza) ajoutaient le produit de base sans déclinaison.  
**Correction** : Lecture de `id_product_attribute` dans chaque item JSON et passage à `updateQty` :
```php
$attrId = isset($item['id_product_attribute']) ? (int)$item['id_product_attribute'] : null;
if ($attrId === 0) $attrId = null;
$cart->updateQty($quantity, $productId, $attrId, false, 'up', ...);
```

---

### 7. `Prestashop/modules/stockdelta/order.php`

**Rôle** : Endpoint PHP custom pour créer une commande PS depuis NewApp, contournant le bug PS8 WebService (prix nul dans `validateOrder`).

**Corrections appliquées** :
- Suppression de `init.php` (double-boot PS)
- Boot du kernel Symfony avant tout usage de classes PS8
- Alimentation du Context (shop, currency, language, employee=1)
- Utilisation de `$customer->getAddresses()` (compatible PS8)
- Passage de `false` comme `secure_key` à `validateOrder`
- Changement d'état post-création si différent de l'état 1

---

### 6. `Prestashop/modules/stockdelta/.htaccess`

**Problème** : Apache ne transmettait pas l'en-tête `Authorization` aux scripts PHP, causant des erreurs 401 sur tous les appels à `order.php` et `api.php`.  
**Correction** :
```apache
RewriteEngine On
RewriteRule ^ - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
```

---

## Analyse des exigences — Ce qui est fait / Ce qui manque

### Jour 1

| Exigence | Fichier | Statut |
|---|---|---|
| Backoffice avec login/mdp (valeurs par défaut) | `pages/Login.jsx` | ✅ Fait |
| Protection des pages backoffice | `components/ProtectedRoute.jsx` | ✅ Fait |
| Page de réinitialisation des données | `pages/backoffice/Reinitialisation.jsx` | ✅ Fait |
| Page d'import (3 CSV + 1 ZIP images) | `pages/backoffice/Import.jsx` | ✅ Fait |
| Page commandes + modification d'état (paiement effectué, annulé) | `pages/backoffice/Commandes.jsx` | ✅ Fait |
| Page d'accueil frontoffice avec liste produits | `pages/frontoffice/Accueil.jsx` | ✅ Fait |
| Fiche produit | `pages/frontoffice/FicheProduit.jsx` | ✅ Fait |
| Gestion du panier | `pages/frontoffice/Panier.jsx` | ✅ Fait |
| Validation commande (paiement à la livraison, sans frais) | `pages/frontoffice/Commande.jsx` | ✅ Fait |
| État "mes commandes" | `pages/frontoffice/MesCommandes.jsx` | ✅ Fait |
| Données importées visibles dans backoffice PS | `services/prestashopApi.js` → `importProducts` | ✅ Corrigé (association catégorie + TVA) |
| Modification PS → impact sur NewApp | Via API WebService PS (lecture live) | ✅ Fait |

### Jour 2

| Exigence | Fichier | Statut |
|---|---|---|
| États commandes : dans le panier / paiement effectué / annulé | `pages/backoffice/Commandes.jsx`, `order.php` | ✅ Fait |
| Tableau de bord (nb commandes/jour, montant, total général) | `pages/backoffice/Dashboard.jsx` | ✅ Fait |
| Import déclinaisons (combinaisons avec stock et prix) | `Import.jsx` + `prestashopApi.js` | ✅ Corrigé (session courante) |
| Page d'accueil = liste utilisateurs, choisir avec qui se connecter | `pages/frontoffice/ShopLogin.jsx` | ✅ Fait |
| Option "utilisateur anonyme" | `pages/frontoffice/ShopLogin.jsx` | ✅ Fait |
| Badge HOT/NEW selon `date_availability_produit` | `pages/frontoffice/Accueil.jsx` | ✅ Fait |
| Recherche multicritère (nom, catégorie, intervalle de prix) | `pages/frontoffice/Accueil.jsx` | ✅ Fait |

### Jour 3

| Exigence | Fichier | Statut |
|---|---|---|
| Validation import : colonnes non conformes | `Import.jsx` → `validateCsv` | ✅ Fait |
| Validation import : format date DD/MM/YYYY | `Import.jsx` → `validateCsv` | ✅ Fait |
| Validation import : montants positifs | `Import.jsx` → `validateCsv` | ✅ Fait |
| Page ajout stock des produits | `pages/backoffice/Stocks.jsx` | ✅ Fait |
| Tableau évolution stock journalier | `pages/backoffice/Stocks.jsx` → `StockChart` | ✅ Fait |
| Endpoint PS unique pour delta stock | `modules/stockdelta/api.php` | ✅ Fait |
| Quantité en stock sur la fiche produit | `pages/frontoffice/FicheProduit.jsx` | ✅ Fait |

---

### 8. Connexion obligatoire pour commander (utilisateur anonyme)

#### `newapp/src/pages/frontoffice/Commande.jsx`
**Problème** : L'anonyme pouvait confirmer une commande directement en créant un nouveau compte PS à chaque fois.  
**Correction** : Si `!isLoggedIn`, affichage d'un écran de blocage avant le formulaire. Bouton "Se connecter pour commander" redirige vers `/shop-login?redirect=/commande`.

#### `newapp/src/pages/frontoffice/ShopLogin.jsx`
**Correction** :
- Import de `useSearchParams` pour lire le paramètre `?redirect=`
- `redirectTo = searchParams.get('redirect') || '/catalogue'`
- `handleSelect` et `handleAnonymous` naviguent vers `redirectTo` au lieu de `/catalogue` hardcodé
- Appel de `ensureGuestUser()` au montage pour créer le compte user1 si absent

#### `newapp/src/services/prestashopApi.js` — `ensureGuestUser`
**Nouvelle fonction** : Crée le compte "user1" dans PS s'il n'existe pas (email `user1@newapp.com`, firstname "User", lastname "1"). Appelée silencieusement au chargement de ShopLogin.

**Flux après implémentation :**
1. Anonyme ajoute au panier → va sur `/commande` → écran de blocage
2. Clique "Se connecter" → `/shop-login?redirect=/commande`
3. Choisit "User 1" → redirigé vers `/commande` (panier préservé en mémoire React)
4. Confirme la commande normalement

---

### 9. Progression d'état commande + mouvements de stock PS

#### `Prestashop/modules/stockdelta/change_state.php` (nouveau fichier)
**Rôle** : Endpoint PHP qui reçoit `{ order_id, state_label }` et change l'état de la commande via `OrderHistory::changeIdOrderState()`. C'est la seule méthode PS qui déclenche les mouvements de stock dans `ps_stock_mvt` (visible dans Catalogue → Stock → Mouvements dans le backoffice PS).

Le WebService PUT `/orders/{id}` ne suffit pas — il met à jour `current_state` mais ne trigger pas les hooks de stock.

Boot du kernel Symfony et alimentation du Context (shop, currency, language, employee) avant tout appel PS. Authentification via `Authorization: Basic <key>`.

#### `newapp/vite.config.js`
Proxy `/api-change-state` → `/Prestashop/modules/stockdelta/change_state.php`

#### `newapp/src/services/prestashopApi.js`
- `getOrderStates()` : fetch tous les états de commande PS (labels dynamiques, jamais hardcodés)
- `changeOrderStatePS(orderId, stateLabel)` : POST vers `/api-change-state` avec le label PS exact

#### `newapp/src/pages/backoffice/Commandes.jsx`
Machine d'états complète pour le suivi commande :

| De | Vers | Déclencheur stock |
|---|---|---|
| Dans le panier | Paiement accepté | — |
| Paiement accepté | En préparation | — |
| En préparation | Expédié | ✅ Décrémente stock |
| Expédié | Livré | — |
| N'importe lequel → | Annulé | ✅ Restitue stock (si logable) |

Les labels des états (et donc des boutons de transition) sont récupérés dynamiquement depuis PS via `getOrderStates()` — robuste aux personnalisations du backoffice PS.

**Flux :** Opérateur clique "🚚 Expédier" → `changeOrderStatePS(orderId, "Expédié")` → `change_state.php` → `OrderHistory::changeIdOrderState()` → PS crée une ligne dans `ps_stock_mvt` visible immédiatement dans Catalogue → Stock → Mouvements.

---

### Notes

- **Pays France / Devise Euro** (note du 12/05) : à vérifier dans la configuration PS et dans l'import. Le groupe TVA `id_tax_rules_group=1` correspond au taux français standard.
- **Déclinaisons FicheProduit** : sélection obligatoire avant ajout panier, prix dynamique selon la variante → ✅ Implémenté dans cette session.
- **Visibilité PS** : corriger l'absence du bloc `<associations><categories>` dans `importProducts` → nécessite un **reset + ré-import** pour que les produits déjà importés soient visibles.
