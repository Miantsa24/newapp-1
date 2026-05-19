$xlFile = "c:\xampp\htdocs\newapp\Todo_ETU003362_Tojo.xlsx"
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
$wb = $excel.Workbooks.Open($xlFile)
$ws = $wb.Sheets.Item("liste des taches")

function W($r,$b,$c,$d,$e,$f,$h) {
  $ws.Range("A$r").Value2 = ($r - 1)
  $ws.Range("B$r").Value2 = $b
  $ws.Range("C$r").Value2 = $c
  $ws.Range("D$r").Value2 = $d
  $ws.Range("E$r").Value2 = $e
  $ws.Range("F$r").Value2 = $f
  $ws.Range("G$r").Value2 = "ETU003362"
  if ($h -gt 0) { $ws.Range("H$r").Value2 = $h }
}

# ── Front-end / Auth Client ──────────────────────────────────────────────────
W 2  "Front-end" "Auth Client"   "ShopLogin.jsx"    "UI page selection utilisateur - liste clients boutons + option anonyme en haut"               "Affichage"   20
W 3  "Front-end" "Auth Client"   "ShopLogin.jsx"    "Chargement clients getCustomers - filtrage active=1 et exclusion email anonyme@psgdpr.com"    "Integration" 25
W 4  "Front-end" "Auth Client"   "ShopLogin.jsx"    "Session client sessionStorage via loginAsCustomerDirect - mode demo sans verification mdp"    "Metier"      15
W 5  "Front-end" "Auth Client"   "AuthContext.jsx"  "Contexte double session employee+customer sessionStorage - loginAsCustomerDirect + logout"    "Metier"      15

# ── Front-end / Catalogue ────────────────────────────────────────────────────
W 6  "Front-end" "Catalogue"     "Accueil.jsx"      "UI grille 4 colonnes - image prix HT badge stock badge HOT/NEW selon available_date"           "Affichage"   30
W 7  "Front-end" "Catalogue"     "Accueil.jsx"      "getProducts + getCategories + getStockAvailables - stockMap id_product id_attr=0"              "Integration" 25
W 8  "Front-end" "Catalogue"     "Accueil.jsx"      "Filtres categorie boutons + plage prix min/max + recherche nom en temps reel"                  "Metier"      20

# ── Front-end / Fiche produit ────────────────────────────────────────────────
W 9  "Front-end" "Fiche produit" "FicheProduit.jsx" "UI detail - image description prix ajuste marque poids etat et stock restant"                 "Affichage"   25
W 10 "Front-end" "Fiche produit" "FicheProduit.jsx" "fetchProductCombinations - groupes options valeurs stock par variante et priceImpact"         "Integration" 30
W 11 "Front-end" "Fiche produit" "FicheProduit.jsx" "Selection variante obligatoire - addToCart avec combinationId et validation stock"             "Metier"      20

# ── Front-end / Panier ───────────────────────────────────────────────────────
W 12 "Front-end" "Panier"        "Panier.jsx"       "UI panier - liste articles quantite prix unitaire sous-total recapitulatif sticky"             "Affichage"   20
W 13 "Front-end" "Panier"        "Panier.jsx"       "Modification quantite suppression article vider panier via CartContext"                        "Metier"      15
W 14 "Front-end" "Panier"        "CartContext.jsx"  "Store panier React Context - addToCart updateQuantity removeFromCart clearCart total"          "Base"        15

# ── Front-end / Commande ─────────────────────────────────────────────────────
W 15 "Front-end" "Commande"      "Commande.jsx"     "UI validation - formulaire infos personnelles adresse livraison mode paiement"                 "Affichage"   25
W 16 "Front-end" "Commande"      "Commande.jsx"     "Mur connexion si anonyme - redirect /shop-login?redirect=/commande - panier preserve"         "Metier"      20
W 17 "Front-end" "Commande"      "prestashopApi.js" "createOrderFromData client PS / createOrder anonyme via callOrderPhp order.php"               "Integration" 35
W 18 "Front-end" "Commande"      "Confirmation.jsx" "Page confirmation commande - succes panier vide - liens mes commandes et catalogue"            "Affichage"   15

# ── Front-end / Mes commandes ────────────────────────────────────────────────
W 19 "Front-end" "Mes commandes" "MesCommandes.jsx" "UI liste commandes - badge etat timeline 5 etapes visuelle et detail expandable articles"     "Affichage"   20
W 20 "Front-end" "Mes commandes" "MesCommandes.jsx" "getOrders filtre par id_customer - tri descendant date_add - affichage order_rows"            "Integration" 20
W 21 "Front-end" "Mes commandes" "MesCommandes.jsx" "Etats annule/rembourse/echec - badge specifique sans timeline - icones par etat"              "Metier"      15

# ── Backoffice / Auth Admin ──────────────────────────────────────────────────
W 22 "Backoffice" "Auth Admin"       "Login.jsx"             "UI login admin - formulaire identifiant + mot de passe - session sessionStorage"          "Affichage"   15
W 23 "Backoffice" "Auth Admin"       "AuthContext.jsx"       "ProtectedRoute + CustomerProtectedRoute - redirection si non authentifie"                  "Metier"      15

# ── Backoffice / Tableau de bord ─────────────────────────────────────────────
W 24 "Backoffice" "Tableau de bord"  "Dashboard.jsx"         "KPIs - total commandes CA panier moyen commandes en attente etats 2+5"                    "Affichage"   25
W 25 "Backoffice" "Tableau de bord"  "Dashboard.jsx"         "Graphe CA 7 jours - regroupement commandes par date barres verticales SVG"               "Metier"      20
W 26 "Backoffice" "Tableau de bord"  "Dashboard.jsx"         "Fix KPIs bloques sur chargement - setLoading dans finally et condition loading corrigee"  "Affichage"   20
W 27 "Backoffice" "Tableau de bord"  "Dashboard.jsx"         "Stats commerciales par categorie - ventes HT achats HT benefice marge via order_details" "Metier"      20

# ── Backoffice / Commandes ───────────────────────────────────────────────────
W 28 "Backoffice" "Commandes"        "Commandes.jsx"         "UI tableau commandes - reference client total date badge etat - filtre recherche"          "Affichage"   25
W 29 "Backoffice" "Commandes"        "Commandes.jsx"         "changeOrderStatePS via change_state.php - toast notification succes/erreur"                "Integration" 20
W 30 "Backoffice" "Commandes"        "BackofficeLayout.jsx"  "Navigation sidebar backoffice - liens dashboard commandes stocks import - deconnexion"     "Affichage"   10

# ── Backoffice / Stocks ──────────────────────────────────────────────────────
W 31 "Backoffice" "Stocks"           "Stocks.jsx"            "UI liste produits - stock actuel - champ saisie quantite ajout par produit"                "Affichage"   25
W 32 "Backoffice" "Stocks"           "Stocks.jsx"            "Ajout stock upsertStockAvailable PUT stock_availables avec retry 3 tentatives"             "Integration" 20
W 33 "Backoffice" "Stocks"           "Stocks.jsx"            "Historique stock localStorage 30 jours - graphe barres 14 jours par produit"               "Affichage"   25
W 34 "Backoffice" "Stocks"           "Stocks.jsx"            "Recherche produit par nom ou reference - filtre temps reel useMemo"                        "Metier"      15

# ── Backoffice / Import CSV ──────────────────────────────────────────────────
W 35 "Backoffice" "Import CSV"       "Import.jsx"            "UI upload ZIP - apercu lignes CSV et log progression par module en temps reel"             "Affichage"   30
W 36 "Backoffice" "Import CSV"       "Import.jsx"            "parseCsvRobust - detection separateur auto - normalisation headers avec diacritiques"       "Metier"      25
W 37 "Backoffice" "Import CSV"       "Import.jsx"            "importProducts POST product - prix HT categorie TVA available_date image ZIP"              "Integration" 30
W 38 "Backoffice" "Import CSV"       "Import.jsx"            "Import variantes - createAttributeGroup/Value/Combination updateCombinationStock"           "Integration" 30
W 39 "Backoffice" "Import CSV"       "Import.jsx"            "Import clients POST customers + getCustomerByEmail pour eviter doublons par email"          "Integration" 25
W 40 "Backoffice" "Import CSV"       "Import.jsx"            "Import commandes createOrderFromData via order.php + date GET puis PUT date_add"            "Integration" 35
W 41 "Backoffice" "Import CSV"       "Import.jsx"            "detectModuleFromHeaders - detection auto module CSV selon colonnes presentes dans header"  "Metier"      20
W 42 "Backoffice" "Import CSV"       "Import.jsx"            "Cache refMap step1 - produits et prix evite doublons et appels API redondants"              "Metier"      20
W 43 "Backoffice" "Import CSV"       "Import.jsx"            "Cache variantPriceMap - prix TTC variants step1 avant creation commandes"                  "Metier"      20
W 44 "Backoffice" "Import CSV"       "Import.jsx"            "Cache variantCombMap - ID combination PS pour remplir panier commandes"                    "Integration" 30
W 45 "Backoffice" "Import CSV"       "Import.jsx"            "Taux TVA corriges par groupe PS - groupe 1=20pct groupe 2=10pct depuis colonne taxe CSV"   "Metier"      30
W 46 "Backoffice" "Import CSV"       "Import.jsx"            "Date commande CSV - GET order puis PUT date_add car PS ignore la date au POST"              "Integration" 30
W 47 "Backoffice" "Import CSV"       "Import.jsx"            "findOrCreateCategory - recherche ou creation categorie PS depuis colonne CSV produits"     "Integration" 25

# ── Backoffice / API + Reinit (taches Jour 3-4) ─────────────────────────────
W 48 "Backoffice" "Import CSV"        "prestashopApi.js"                      "Pagination fetchAllPages - import 500+ lignes sans crash via limit=offset,count"             "Integration" 30
W 49 "Backoffice" "Reinitialisation"  "delete_orders/customers/products.php"  "Endpoints PHP suppression directe SQL - contourne WS 404 orders/customers/products"         "Integration" 40
W 50 "Backoffice" "Commandes"         "Commandes.jsx"                         "Machine 4 etats Panier/Paiement/Livre/Annule + boutons Livrer et Annuler"                    "Metier"      25
W 51 "Backoffice" "Tableau de bord"   "Dashboard.jsx"                         "Stats par categorie ventes HT achats HT benefice marge via order_details WS"                "Metier"      35
W 52 "Backoffice" "Tableau de bord"   "Dashboard.jsx"                         "Tableau stock par categorie Qte physique reservee disponible via stock_available"            "Affichage"   25

# ── Nouvelles taches (deja presentes rows 53-56 via insertions precedentes) ─
# Verifier et remettre a jour si besoin
$ws.Range("A53").Value2 = 52
$ws.Range("B53").Value2 = "Backoffice"
$ws.Range("C53").Value2 = "Reinitialisation"
$ws.Range("D53").Value2 = "Reinitialisation.jsx"
$ws.Range("E53").Value2 = "UI 4 modules suppression - confirmation double clic avant action irreversible"
$ws.Range("F53").Value2 = "Affichage"
$ws.Range("G53").Value2 = "ETU003362"
$ws.Range("H53").Value2 = 20

$ws.Range("A54").Value2 = 53
$ws.Range("B54").Value2 = "Backoffice"
$ws.Range("C54").Value2 = "Reinitialisation"
$ws.Range("D54").Value2 = "Reinitialisation.jsx"
$ws.Range("E54").Value2 = "Suppression categories WS DELETE - tri inverse profondeur evite contrainte FK parent"
$ws.Range("F54").Value2 = "Integration"
$ws.Range("G54").Value2 = "ETU003362"
$ws.Range("H54").Value2 = 20

$ws.Range("A55").Value2 = 54
$ws.Range("B55").Value2 = "Backoffice"
$ws.Range("C55").Value2 = "API"
$ws.Range("D55").Value2 = "prestashopApi.js"
$ws.Range("E55").Value2 = "loginCustomer filtre email PS WS - evite chargement total clients - filtre active et deleted"
$ws.Range("F55").Value2 = "Integration"
$ws.Range("G55").Value2 = "ETU003362"
$ws.Range("H55").Value2 = 15

$ws.Range("A56").Value2 = 55
$ws.Range("B56").Value2 = "Backoffice"
$ws.Range("C56").Value2 = "API"
$ws.Range("D56").Value2 = "prestashopApi.js"
$ws.Range("E56").Value2 = "ensureGuestUser - creation user1@newapp.com au demarrage ShopLogin si inexistant"
$ws.Range("F56").Value2 = "Integration"
$ws.Range("G56").Value2 = "ETU003362"
$ws.Range("H56").Value2 = 15

# ── Total row ────────────────────────────────────────────────────────────────
$ws.Range("A57").Value2 = "Total"
$ws.Range("H57").Formula = "=SUM(H2:H56)"

Write-Host "Total estimation =" $ws.Range("H57").Value2
Write-Host "Nb rows =" $ws.UsedRange.Rows.Count

# ── Verif quelques lignes cles ───────────────────────────────────────────────
foreach ($r in @(2, 5, 9, 12, 19, 22, 28, 35, 48, 53, 57)) {
    $a=$ws.Range("A$r").Value2; $b=$ws.Range("B$r").Value2
    $d=$ws.Range("D$r").Value2; $h=$ws.Range("H$r").Value2
    Write-Host "Row $r | L=$a | Cat=$b | Page=$d | Est=$h"
}

$wb.Save()
$wb.Close($false)
$excel.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
Write-Host "OK"
