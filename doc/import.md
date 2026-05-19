# Prompt d'implémentation : Import unifié

## Objectif
Créer une fonctionnalité d'import unifiée dans l'application React/Vite existante pour gérer :
- un fichier CSV produits
- un fichier CSV déclinaisons / stock
- un fichier CSV clients / commandes
- un fichier ZIP d'images

L'objectif est d'avoir une seule interface, un seul bouton `Importer`, et un comportement clair pour la prévisualisation, la validation et l'exécution de l'import.

## Contexte projet
Fichiers principaux impliqués :
- `src/pages/products/ProductImportPage.jsx`
- `src/services/importOrchestratorService.js`
- `src/utils/csvParser.js`
- `src/pages/products/ProductImportPage.css`

## Structure du prompt
Le prompt doit expliquer :
1. la page d'import
2. la prévisualisation des CSV
3. la validation des fichiers0
4. le traitement des produits
5. le traitement des déclinaisons/stock
6. le traitement des clients/commandes
7. le traitement des images ZIP
8. le retour utilisateur après import

## Prompt recommandé

> Tu es un développeur expert React/Vite. Implémente une page d'import unifiée dans `src/pages/products/ProductImportPage.jsx` pour gérer 4 fichiers :
> - `Produits CSV`
> - `Déclinaisons / stock CSV`
> - `Clients / commandes CSV`
> - `Images ZIP`
>
> La page doit proposer :
> - un seul formulaire avec 4 champs de fichier
> - un seul bouton `Importer`
> - une prévisualisation en table pour chaque CSV
> - une validation bloquante si un fichier requis manque
> - un affichage clair des statuts d'import
>
> Pour le CSV produits, lis le fichier et mappe les colonnes réelles vers les champs internes :
> - `date_availability_produit` → `available_date`
> - `nom` → `name`
> - `reference` → `reference`
> - `prix_ttc` / `montantht` → `price`
> - `Taxe` → `tax`
> - `categorie` → `categoryName`
> - `prix_achat` → `cost_price`
>
> Pour le CSV déclinaisons / stock, lis le fichier et mappe les colonnes réelles vers les champs internes :
> - `reference` → `reference`
> - `specificité` → `variant_type`
> - `karazany` → `variant_value`
> - `stock_initial` → `quantity`
> - `prix_vente_ttc` → `price`
>
> Pour le CSV clients / commandes, lis le fichier et mappe les colonnes réelles vers les champs internes :
> - `date` → `order_date`
> - `nom` → `customer_name`
> - `email` → `customer_email`
> - `pwd` → `password`
> - `adresse` → `address`
> - `achat` → `items`
> - `etat` → `order_status`
>
> Le champ `achat` doit être parsé comme une liste d'articles :
> - format attendu : `[('reference';quantité;'variation'),(...)]`
> - exemples :
>   - `[('T_01';3;'ngoza')]`
>   - `[('T_01';2;'kely'),('C_03';1;'')]`
>   - `[('T_01';1;'kely')]`
> - chaque article doit produire un objet avec `reference`, `quantity` et `variation`
>
> Pour le ZIP images, lis le fichier et mappe la structure vers les champs internes :
> - le nom du fichier image → `reference` ou `product_reference`
> - chemin du fichier dans l’archive → `image_path`
> - fichier ZIP chargé → `images_zip`
>
> Pour chaque ligne produit :
> - vérifier si la catégorie existe
> - sinon créer la catégorie avec `active: 1` et `parent_id: 2`
> - créer ou mettre à jour le produit avec la catégorie correspondante
> - convertir les montants `prix_ttc`, `prix_achat` et `Taxe` en valeurs numériques valides
> - gérer l'encodage des dates et le format `dd/mm/yyyy`
>
> Pour le CSV déclinaisons / stock :
> - afficher un aperçu table
> - parser `reference,specificité,karazany,stock_initial,prix_vente_ttc`
> - relier chaque ligne à la référence produit
> - mettre à jour le stock sur le produit principal ou créer des variantes si le modèle supporte les déclinaisons
> - conserver `specificité` et `karazany` pour décrire la variante
>
> Pour le CSV clients / commandes :
> - afficher un aperçu table
> - parser `date,nom,email,pwd,adresse,achat,etat`
> - valider `email`, `nom`, `date` et `etat`
> - analyser le champ `achat` en tableau d'articles : `[('reference';quantité;'variation'),(...)]`
> - créer ou mettre à jour le client
> - créer la commande et ses lignes associées
>
> Pour le ZIP images :
> - accepter le fichier ZIP
> - vérifier que le fichier est chargé
> - lister les fichiers internes si possible
> - associer les images aux produits par nom de fichier ou `reference`
>
> Implémente également `src/services/importOrchestratorService.js` pour orchestrer l'import de tous les fichiers ensemble, en exposant une fonction `importAll({ productsFile, combosFile, ordersFile, imagesFile, encoding, onProgress })`.
>
> Le CSV parser doit supporter différents séparateurs (`;`, `,`) et normaliser les en-têtes pour faciliter le mapping.

## Logique d'import par modèle

### Produits
- lire le CSV produits
- normaliser les en-têtes (`lowercase`, sans accents, sans espaces)
- convertir les formats numériques et les dates
- chercher la catégorie existante par nom normalisé
- créer la catégorie si elle n'existe pas
- créer ou mettre à jour le produit
- stocker `id_category_default`, `categories`, `visibility`, `condition`, `active`

### Déclinaisons / stock
- lire le CSV de stock
- construire des objets de variante ou de stock ayant :
  - `reference`
  - `specificite`
  - `karazany`
  - `stock_initial`
  - `prix_vente_ttc`
- relier chaque déclinaison au produit existant
- mettre à jour les quantités et les prix si le produit existe
- si le modèle backend supporte les variantes, créer l'entité variante

### Clients / commandes
- lire le CSV clients/commandes
- normaliser les clients par `email`
- créer ou mettre à jour le client
- parser `achat` en liste d'articles
- pour chaque commande, créer l'entité commande avec les lignes associées
- conserver l'état de commande (`etat`)

### Images
- accepter le ZIP d'images
- vérifier sa présence avant lancement
- si possible, lire la liste de fichiers dans le ZIP
- associer chaque image à un produit via le nom de fichier
- préparer l'envoi ou le lien d'image dans le service de produits

## Logique des formats CSV

### Produits CSV
- En-tête exact attendu :
  - `date_availability_produit,nom,reference,prix_ttc,Taxe,categorie,prix_achat`
- Le fichier utilise `,` comme séparateur principal.
- Les champs numériques ou de pourcentage peuvent être cités et contenir une virgule :
  - `"12,5"`
  - `"11,65%"`
  - `"8,5"`
- Le parseur doit gérer les guillemets doubles et les valeurs contenant des virgules.
- Mappage recommandé :
  - `nom` → `name`
  - `reference` → `reference`
  - `categorie` → `categoryName`
  - `prix_ttc` → `price`
  - `Taxe` → `tax`
  - `prix_achat` → `cost_price`
  - `date_availability_produit` → `available_date`
- Exemple de ligne :
  - `"01/12/2025,Tshirt,T_01,""12,5"",""11,65%"",Akanjo,""8,5"""`

### Déclinaisons / stock CSV
- En-tête exact attendu :
  - `reference,specificité,karazany,stock_initial,prix_vente_ttc`
- Chaque ligne représente une déclinaison ou un niveau de stock lié à une référence produit.
- Les champs `specificité` et `karazany` servent à décrire la variante.
- Le prix de vente peut contenir une virgule décimale et être cité.
- Exemple de ligne :
  - `T_01,taille,ngoza,13,"12,5"`

### Clients / commandes CSV
- En-tête exact attendu :
  - `date,nom,email,pwd,adresse,achat,etat`
- Chaque ligne correspond à un client et à une commande ou plusieurs achats.
- Le champ `achat` contient une représentation textuelle structurée des produits achetés :
  - format : `[('reference';quantité;'variation'),(...)]`
  - exemples :
    - `[('T_01';3;'ngoza')]`
    - `[('T_01';2;'kely'),('C_03';1;'')]`
    - `[('T_01';1;'kely')]`
- Le parseur doit garder ce champ comme chaîne, puis le normaliser en tableau d'articles avec :
  - `reference`
  - `quantity`
  - `variation`
- Exemple de ligne :
  - `09/05/2026,Rakoto,rakoto@yopmail.com,XvzsX5O0!GBD0uXQ,Andoharanofotsy,"[('"T_01"';3;'"ngoza"')]",en attente paiement à la livraison`

### Images ZIP
- Fichier ZIP contenant les images des produits.
- Le simple fait de recevoir le ZIP doit suffire à considérer que le fichier est chargé.
- Idéalement, les images portent le nom d'une `reference` produit ou d'une variante.
- Exemple de fichiers : `T_01.jpg`, `P_01.png`, `C_03_1.jpeg`

## Scénarios d'implémentation

### Scénario 1 — Prévisualisation CSV
- Sélection du fichier produit → aperçu des 20 premières lignes
- Sélection du fichier stock → aperçu des 20 premières lignes
- Sélection du fichier commandes → aperçu des 20 premières lignes
- Sélection du ZIP → affichage du nom du fichier et de l'état de sélection

### Scénario 2 — Validation avant import
- si un fichier est manquant, afficher un message d'erreur
- ne pas lancer l'import tant que tous les fichiers requis ne sont pas présents

### Scénario 3 — Import produits
- parser le fichier produit
- normaliser les en-têtes CSV
- transformer chaque ligne en objet métier
- créer/réutiliser la catégorie
- créer le produit avec `id_category_default` et `categories`
- gérer `visibility`, `condition`, `active`

### Scénario 4 — Import déclinaisons / stock
- parser le fichier déclinaisons/stock
- prévisualiser les colonnes
- mapper les colonnes essentielles pour l'inventaire
- préparer les mises à jour stock pour les produits existants

### Scénario 5 — Import clients / commandes
- parser le CSV clients/commandes
- prévisualiser les colonnes
- valider les champs importants (email, nom, commande)
- préparer la création de clients et commandes ou la synchronisation

### Scénario 6 — Import images ZIP
- accepter le fichier ZIP d'images
- afficher que le fichier est bien chargé
- préparer une logique d'association des images aux références produits

### Scénario 7 — Résultats et retours utilisateur
- afficher le nombre de produits créés / mis à jour
- afficher le nombre d'erreurs
- afficher ligne par ligne le statut de l'import
- conserver le rendu dans une table lisible

## Points importants
- ne pas se limiter aux produits : le prompt doit couvrir l'import de tous les fichiers
- la page est une UI unifiée, pas quatre pages séparées
- l'accent doit être mis sur la qualité de la prévisualisation et la validation
- la logique métier d'orchestration doit vivre dans `importOrchestratorService.js`

## Où placer ce document
Ce fichier peut être utilisé comme :
- guide de développement pour implémenter la fonctionnalité
- prompt de génération pour un assistant IA
- documentation d'équipe pour l'import unifié
