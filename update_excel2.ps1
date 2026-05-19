$xlFile = "c:\xampp\htdocs\newapp\Todo_ETU003362_Tojo.xlsx"
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false; $excel.DisplayAlerts = $false
$wb = $excel.Workbooks.Open($xlFile)
$ws = $wb.Sheets.Item("liste des taches")

# ── Row 2 : Ligne 1 ──────────────────────────────────────────────────────────
$ws.Range("A2").Value2 = 1
$ws.Range("B2").Value2 = "Front-end"
$ws.Range("C2").Value2 = "Auth Client"
$ws.Range("D2").Value2 = "ShopLogin.jsx"
$ws.Range("E2").Value2 = "UI page selection utilisateur - liste clients boutons + option anonyme en haut"
$ws.Range("F2").Value2 = "Affichage"
$ws.Range("G2").Value2 = "ETU003362"
$ws.Range("H2").Value2 = 20

# ── Row 3 : Ligne 2 ──────────────────────────────────────────────────────────
$ws.Range("A3").Value2 = 2
$ws.Range("B3").Value2 = "Front-end"
$ws.Range("C3").Value2 = "Auth Client"
$ws.Range("D3").Value2 = "ShopLogin.jsx"
$ws.Range("E3").Value2 = "Chargement clients getCustomers - filtrage active=1 et exclusion email anonyme@psgdpr.com"
$ws.Range("F3").Value2 = "Integration"
$ws.Range("G3").Value2 = "ETU003362"
$ws.Range("H3").Value2 = 25

# ── Row 4 : Ligne 3 ──────────────────────────────────────────────────────────
$ws.Range("A4").Value2 = 3
$ws.Range("B4").Value2 = "Front-end"
$ws.Range("C4").Value2 = "Auth Client"
$ws.Range("D4").Value2 = "ShopLogin.jsx"
$ws.Range("E4").Value2 = "Session client sessionStorage via loginAsCustomerDirect - mode demo sans verification mdp"
$ws.Range("F4").Value2 = "Metier"
$ws.Range("G4").Value2 = "ETU003362"
$ws.Range("H4").Value2 = 15

# ── Row 5 : Ligne 4 ──────────────────────────────────────────────────────────
$ws.Range("A5").Value2 = 4
$ws.Range("B5").Value2 = "Front-end"
$ws.Range("C5").Value2 = "Auth Client"
$ws.Range("D5").Value2 = "AuthContext.jsx"
$ws.Range("E5").Value2 = "Contexte double session employee+customer sessionStorage - loginAsCustomerDirect + logout"
$ws.Range("F5").Value2 = "Metier"
$ws.Range("G5").Value2 = "ETU003362"
$ws.Range("H5").Value2 = 15

# ── Row 6 : Ligne 5 ──────────────────────────────────────────────────────────
$ws.Range("A6").Value2 = 5
$ws.Range("B6").Value2 = "Front-end"
$ws.Range("C6").Value2 = "Catalogue"
$ws.Range("D6").Value2 = "Accueil.jsx"
$ws.Range("E6").Value2 = "UI grille 4 colonnes - image prix HT badge stock badge HOT/NEW selon available_date"
$ws.Range("F6").Value2 = "Affichage"
$ws.Range("G6").Value2 = "ETU003362"
$ws.Range("H6").Value2 = 30

# ── Row 7 : Ligne 6 ──────────────────────────────────────────────────────────
$ws.Range("A7").Value2 = 6
$ws.Range("B7").Value2 = "Front-end"
$ws.Range("C7").Value2 = "Catalogue"
$ws.Range("D7").Value2 = "Accueil.jsx"
$ws.Range("E7").Value2 = "getProducts + getCategories + getStockAvailables - stockMap id_product id_attr=0"
$ws.Range("F7").Value2 = "Integration"
$ws.Range("G7").Value2 = "ETU003362"
$ws.Range("H7").Value2 = 25

# ── Row 8 : Ligne 7 ──────────────────────────────────────────────────────────
$ws.Range("A8").Value2 = 7
$ws.Range("B8").Value2 = "Front-end"
$ws.Range("C8").Value2 = "Catalogue"
$ws.Range("D8").Value2 = "Accueil.jsx"
$ws.Range("E8").Value2 = "Filtres categorie boutons + plage prix min/max + recherche nom en temps reel"
$ws.Range("F8").Value2 = "Metier"
$ws.Range("G8").Value2 = "ETU003362"
$ws.Range("H8").Value2 = 20

# ── Row 9 : Ligne 8 ──────────────────────────────────────────────────────────
$ws.Range("A9").Value2 = 8
$ws.Range("B9").Value2 = "Front-end"
$ws.Range("C9").Value2 = "Fiche produit"
$ws.Range("D9").Value2 = "FicheProduit.jsx"
$ws.Range("E9").Value2 = "UI detail - image description prix ajuste marque poids etat et stock restant"
$ws.Range("F9").Value2 = "Affichage"
$ws.Range("G9").Value2 = "ETU003362"
$ws.Range("H9").Value2 = 25

# ── Row 10 : Ligne 9 ─────────────────────────────────────────────────────────
$ws.Range("A10").Value2 = 9
$ws.Range("B10").Value2 = "Front-end"
$ws.Range("C10").Value2 = "Fiche produit"
$ws.Range("D10").Value2 = "FicheProduit.jsx"
$ws.Range("E10").Value2 = "fetchProductCombinations - groupes options valeurs stock par variante et priceImpact"
$ws.Range("F10").Value2 = "Integration"
$ws.Range("G10").Value2 = "ETU003362"
$ws.Range("H10").Value2 = 30

# ── Row 11 : Ligne 10 ────────────────────────────────────────────────────────
$ws.Range("A11").Value2 = 10
$ws.Range("B11").Value2 = "Front-end"
$ws.Range("C11").Value2 = "Fiche produit"
$ws.Range("D11").Value2 = "FicheProduit.jsx"
$ws.Range("E11").Value2 = "Selection variante obligatoire - addToCart avec combinationId et validation stock"
$ws.Range("F11").Value2 = "Metier"
$ws.Range("G11").Value2 = "ETU003362"
$ws.Range("H11").Value2 = 20

# ── Row 12 : Ligne 11 ────────────────────────────────────────────────────────
$ws.Range("A12").Value2 = 11
$ws.Range("B12").Value2 = "Front-end"
$ws.Range("C12").Value2 = "Panier"
$ws.Range("D12").Value2 = "Panier.jsx"
$ws.Range("E12").Value2 = "UI panier - liste articles quantite prix unitaire sous-total recapitulatif sticky"
$ws.Range("F12").Value2 = "Affichage"
$ws.Range("G12").Value2 = "ETU003362"
$ws.Range("H12").Value2 = 20

# ── Row 13 : Ligne 12 ────────────────────────────────────────────────────────
$ws.Range("A13").Value2 = 12
$ws.Range("B13").Value2 = "Front-end"
$ws.Range("C13").Value2 = "Panier"
$ws.Range("D13").Value2 = "Panier.jsx"
$ws.Range("E13").Value2 = "Modification quantite suppression article vider panier via CartContext"
$ws.Range("F13").Value2 = "Metier"
$ws.Range("G13").Value2 = "ETU003362"
$ws.Range("H13").Value2 = 15

# ── Row 14 : Ligne 13 ────────────────────────────────────────────────────────
$ws.Range("A14").Value2 = 13
$ws.Range("B14").Value2 = "Front-end"
$ws.Range("C14").Value2 = "Panier"
$ws.Range("D14").Value2 = "CartContext.jsx"
$ws.Range("E14").Value2 = "Store panier React Context - addToCart updateQuantity removeFromCart clearCart total"
$ws.Range("F14").Value2 = "Base"
$ws.Range("G14").Value2 = "ETU003362"
$ws.Range("H14").Value2 = 15

# ── Row 15 : Ligne 14 ────────────────────────────────────────────────────────
$ws.Range("A15").Value2 = 14
$ws.Range("B15").Value2 = "Front-end"
$ws.Range("C15").Value2 = "Commande"
$ws.Range("D15").Value2 = "Commande.jsx"
$ws.Range("E15").Value2 = "UI validation - formulaire infos personnelles adresse livraison mode paiement"
$ws.Range("F15").Value2 = "Affichage"
$ws.Range("G15").Value2 = "ETU003362"
$ws.Range("H15").Value2 = 25

# ── Row 16 : Ligne 15 ────────────────────────────────────────────────────────
$ws.Range("A16").Value2 = 15
$ws.Range("B16").Value2 = "Front-end"
$ws.Range("C16").Value2 = "Commande"
$ws.Range("D16").Value2 = "Commande.jsx"
$ws.Range("E16").Value2 = "Mur connexion si anonyme - redirect /shop-login?redirect=/commande - panier preserve"
$ws.Range("F16").Value2 = "Metier"
$ws.Range("G16").Value2 = "ETU003362"
$ws.Range("H16").Value2 = 20

# ── Row 17 : Ligne 16 ────────────────────────────────────────────────────────
$ws.Range("A17").Value2 = 16
$ws.Range("B17").Value2 = "Front-end"
$ws.Range("C17").Value2 = "Commande"
$ws.Range("D17").Value2 = "prestashopApi.js"
$ws.Range("E17").Value2 = "createOrderFromData client PS / createOrder anonyme via callOrderPhp order.php"
$ws.Range("F17").Value2 = "Integration"
$ws.Range("G17").Value2 = "ETU003362"
$ws.Range("H17").Value2 = 35

# ── Row 18 : Ligne 17 ────────────────────────────────────────────────────────
$ws.Range("A18").Value2 = 17
$ws.Range("B18").Value2 = "Front-end"
$ws.Range("C18").Value2 = "Commande"
$ws.Range("D18").Value2 = "Confirmation.jsx"
$ws.Range("E18").Value2 = "Page confirmation commande - succes panier vide - liens mes commandes et catalogue"
$ws.Range("F18").Value2 = "Affichage"
$ws.Range("G18").Value2 = "ETU003362"
$ws.Range("H18").Value2 = 15

# ── Row 19 : Ligne 18 ────────────────────────────────────────────────────────
$ws.Range("A19").Value2 = 18
$ws.Range("B19").Value2 = "Front-end"
$ws.Range("C19").Value2 = "Mes commandes"
$ws.Range("D19").Value2 = "MesCommandes.jsx"
$ws.Range("E19").Value2 = "UI liste commandes - badge etat timeline 5 etapes visuelle et detail expandable articles"
$ws.Range("F19").Value2 = "Affichage"
$ws.Range("G19").Value2 = "ETU003362"
$ws.Range("H19").Value2 = 20

# ── Row 20 : Ligne 19 ────────────────────────────────────────────────────────
$ws.Range("A20").Value2 = 19
$ws.Range("B20").Value2 = "Front-end"
$ws.Range("C20").Value2 = "Mes commandes"
$ws.Range("D20").Value2 = "MesCommandes.jsx"
$ws.Range("E20").Value2 = "getOrders filtre par id_customer - tri descendant date_add - affichage order_rows"
$ws.Range("F20").Value2 = "Integration"
$ws.Range("G20").Value2 = "ETU003362"
$ws.Range("H20").Value2 = 20

# ── Row 21 : Ligne 20 ────────────────────────────────────────────────────────
$ws.Range("A21").Value2 = 20
$ws.Range("B21").Value2 = "Front-end"
$ws.Range("C21").Value2 = "Mes commandes"
$ws.Range("D21").Value2 = "MesCommandes.jsx"
$ws.Range("E21").Value2 = "Etats annule/rembourse/echec - badge specifique sans timeline - icones par etat"
$ws.Range("F21").Value2 = "Metier"
$ws.Range("G21").Value2 = "ETU003362"
$ws.Range("H21").Value2 = 15

# ── Row 22 : Ligne 21 ────────────────────────────────────────────────────────
$ws.Range("A22").Value2 = 21
$ws.Range("B22").Value2 = "Backoffice"
$ws.Range("C22").Value2 = "Auth Admin"
$ws.Range("D22").Value2 = "Login.jsx"
$ws.Range("E22").Value2 = "UI login admin - formulaire identifiant + mot de passe - session sessionStorage"
$ws.Range("F22").Value2 = "Affichage"
$ws.Range("G22").Value2 = "ETU003362"
$ws.Range("H22").Value2 = 15

# ── Row 23 : Ligne 22 ────────────────────────────────────────────────────────
$ws.Range("A23").Value2 = 22
$ws.Range("B23").Value2 = "Backoffice"
$ws.Range("C23").Value2 = "Auth Admin"
$ws.Range("D23").Value2 = "AuthContext.jsx"
$ws.Range("E23").Value2 = "ProtectedRoute + CustomerProtectedRoute - redirection si non authentifie"
$ws.Range("F23").Value2 = "Metier"
$ws.Range("G23").Value2 = "ETU003362"
$ws.Range("H23").Value2 = 15

# ── Row 24 : Ligne 23 ────────────────────────────────────────────────────────
$ws.Range("A24").Value2 = 23
$ws.Range("B24").Value2 = "Backoffice"
$ws.Range("C24").Value2 = "Tableau de bord"
$ws.Range("D24").Value2 = "Dashboard.jsx"
$ws.Range("E24").Value2 = "KPIs - total commandes CA panier moyen commandes en attente etats 2+5"
$ws.Range("F24").Value2 = "Affichage"
$ws.Range("G24").Value2 = "ETU003362"
$ws.Range("H24").Value2 = 25

# ── Row 25 : Ligne 24 ────────────────────────────────────────────────────────
$ws.Range("A25").Value2 = 24
$ws.Range("B25").Value2 = "Backoffice"
$ws.Range("C25").Value2 = "Tableau de bord"
$ws.Range("D25").Value2 = "Dashboard.jsx"
$ws.Range("E25").Value2 = "Graphe CA 7 jours - regroupement commandes par date barres verticales SVG"
$ws.Range("F25").Value2 = "Metier"
$ws.Range("G25").Value2 = "ETU003362"
$ws.Range("H25").Value2 = 20

# ── Row 26 : Ligne 25 ────────────────────────────────────────────────────────
$ws.Range("A26").Value2 = 25
$ws.Range("B26").Value2 = "Backoffice"
$ws.Range("C26").Value2 = "Tableau de bord"
$ws.Range("D26").Value2 = "Dashboard.jsx"
$ws.Range("E26").Value2 = "Fix KPIs bloques sur chargement - setLoading dans finally et condition loading corrigee"
$ws.Range("F26").Value2 = "Affichage"
$ws.Range("G26").Value2 = "ETU003362"
$ws.Range("H26").Value2 = 20

# ── Row 27 : Ligne 26 ────────────────────────────────────────────────────────
$ws.Range("A27").Value2 = 26
$ws.Range("B27").Value2 = "Backoffice"
$ws.Range("C27").Value2 = "Tableau de bord"
$ws.Range("D27").Value2 = "Dashboard.jsx"
$ws.Range("E27").Value2 = "Stats commerciales par categorie - ventes HT achats HT benefice marge via order_details"
$ws.Range("F27").Value2 = "Metier"
$ws.Range("G27").Value2 = "ETU003362"
$ws.Range("H27").Value2 = 20

# ── Row 28 : Ligne 27 ────────────────────────────────────────────────────────
$ws.Range("A28").Value2 = 27
$ws.Range("B28").Value2 = "Backoffice"
$ws.Range("C28").Value2 = "Commandes"
$ws.Range("D28").Value2 = "Commandes.jsx"
$ws.Range("E28").Value2 = "UI tableau commandes - reference client total date badge etat - filtre recherche"
$ws.Range("F28").Value2 = "Affichage"
$ws.Range("G28").Value2 = "ETU003362"
$ws.Range("H28").Value2 = 25

# ── Row 29 : Ligne 28 ────────────────────────────────────────────────────────
$ws.Range("A29").Value2 = 28
$ws.Range("B29").Value2 = "Backoffice"
$ws.Range("C29").Value2 = "Commandes"
$ws.Range("D29").Value2 = "Commandes.jsx"
$ws.Range("E29").Value2 = "changeOrderStatePS via change_state.php - toast notification succes/erreur"
$ws.Range("F29").Value2 = "Integration"
$ws.Range("G29").Value2 = "ETU003362"
$ws.Range("H29").Value2 = 20

# ── Row 30 : Ligne 29 ────────────────────────────────────────────────────────
$ws.Range("A30").Value2 = 29
$ws.Range("B30").Value2 = "Backoffice"
$ws.Range("C30").Value2 = "Commandes"
$ws.Range("D30").Value2 = "BackofficeLayout.jsx"
$ws.Range("E30").Value2 = "Navigation sidebar backoffice - liens dashboard commandes stocks import - deconnexion"
$ws.Range("F30").Value2 = "Affichage"
$ws.Range("G30").Value2 = "ETU003362"
$ws.Range("H30").Value2 = 10

# ── Row 31 : Ligne 30 ────────────────────────────────────────────────────────
$ws.Range("A31").Value2 = 30
$ws.Range("B31").Value2 = "Backoffice"
$ws.Range("C31").Value2 = "Stocks"
$ws.Range("D31").Value2 = "Stocks.jsx"
$ws.Range("E31").Value2 = "UI liste produits - stock actuel - champ saisie quantite ajout par produit"
$ws.Range("F31").Value2 = "Affichage"
$ws.Range("G31").Value2 = "ETU003362"
$ws.Range("H31").Value2 = 25

# ── Row 32 : Ligne 31 ────────────────────────────────────────────────────────
$ws.Range("A32").Value2 = 31
$ws.Range("B32").Value2 = "Backoffice"
$ws.Range("C32").Value2 = "Stocks"
$ws.Range("D32").Value2 = "Stocks.jsx"
$ws.Range("E32").Value2 = "Ajout stock upsertStockAvailable PUT stock_availables avec retry 3 tentatives"
$ws.Range("F32").Value2 = "Integration"
$ws.Range("G32").Value2 = "ETU003362"
$ws.Range("H32").Value2 = 20

# ── Row 33 : Ligne 32 ────────────────────────────────────────────────────────
$ws.Range("A33").Value2 = 32
$ws.Range("B33").Value2 = "Backoffice"
$ws.Range("C33").Value2 = "Stocks"
$ws.Range("D33").Value2 = "Stocks.jsx"
$ws.Range("E33").Value2 = "Historique stock localStorage 30 jours - graphe barres 14 jours par produit"
$ws.Range("F33").Value2 = "Affichage"
$ws.Range("G33").Value2 = "ETU003362"
$ws.Range("H33").Value2 = 25

# ── Row 34 : Ligne 33 ────────────────────────────────────────────────────────
$ws.Range("A34").Value2 = 33
$ws.Range("B34").Value2 = "Backoffice"
$ws.Range("C34").Value2 = "Stocks"
$ws.Range("D34").Value2 = "Stocks.jsx"
$ws.Range("E34").Value2 = "Recherche produit par nom ou reference - filtre temps reel useMemo"
$ws.Range("F34").Value2 = "Metier"
$ws.Range("G34").Value2 = "ETU003362"
$ws.Range("H34").Value2 = 15

# ── Row 35 : Ligne 34 ────────────────────────────────────────────────────────
$ws.Range("A35").Value2 = 34
$ws.Range("B35").Value2 = "Backoffice"
$ws.Range("C35").Value2 = "Import CSV"
$ws.Range("D35").Value2 = "Import.jsx"
$ws.Range("E35").Value2 = "UI upload ZIP - apercu lignes CSV et log progression par module en temps reel"
$ws.Range("F35").Value2 = "Affichage"
$ws.Range("G35").Value2 = "ETU003362"
$ws.Range("H35").Value2 = 30

# ── Row 36 : Ligne 35 ────────────────────────────────────────────────────────
$ws.Range("A36").Value2 = 35
$ws.Range("B36").Value2 = "Backoffice"
$ws.Range("C36").Value2 = "Import CSV"
$ws.Range("D36").Value2 = "Import.jsx"
$ws.Range("E36").Value2 = "parseCsvRobust - detection separateur auto - normalisation headers avec diacritiques"
$ws.Range("F36").Value2 = "Metier"
$ws.Range("G36").Value2 = "ETU003362"
$ws.Range("H36").Value2 = 25

# ── Row 37 : Ligne 36 ────────────────────────────────────────────────────────
$ws.Range("A37").Value2 = 36
$ws.Range("B37").Value2 = "Backoffice"
$ws.Range("C37").Value2 = "Import CSV"
$ws.Range("D37").Value2 = "Import.jsx"
$ws.Range("E37").Value2 = "importProducts POST product - prix HT categorie TVA available_date image ZIP"
$ws.Range("F37").Value2 = "Integration"
$ws.Range("G37").Value2 = "ETU003362"
$ws.Range("H37").Value2 = 30

# ── Row 38 : Ligne 37 ────────────────────────────────────────────────────────
$ws.Range("A38").Value2 = 37
$ws.Range("B38").Value2 = "Backoffice"
$ws.Range("C38").Value2 = "Import CSV"
$ws.Range("D38").Value2 = "Import.jsx"
$ws.Range("E38").Value2 = "Import variantes - createAttributeGroup/Value/Combination updateCombinationStock"
$ws.Range("F38").Value2 = "Integration"
$ws.Range("G38").Value2 = "ETU003362"
$ws.Range("H38").Value2 = 30

# ── Row 39 : Ligne 38 ────────────────────────────────────────────────────────
$ws.Range("A39").Value2 = 38
$ws.Range("B39").Value2 = "Backoffice"
$ws.Range("C39").Value2 = "Import CSV"
$ws.Range("D39").Value2 = "Import.jsx"
$ws.Range("E39").Value2 = "Import clients POST customers + getCustomerByEmail pour eviter doublons par email"
$ws.Range("F39").Value2 = "Integration"
$ws.Range("G39").Value2 = "ETU003362"
$ws.Range("H39").Value2 = 25

# ── Row 40 : Ligne 39 ────────────────────────────────────────────────────────
$ws.Range("A40").Value2 = 39
$ws.Range("B40").Value2 = "Backoffice"
$ws.Range("C40").Value2 = "Import CSV"
$ws.Range("D40").Value2 = "Import.jsx"
$ws.Range("E40").Value2 = "Import commandes createOrderFromData via order.php + date GET puis PUT date_add"
$ws.Range("F40").Value2 = "Integration"
$ws.Range("G40").Value2 = "ETU003362"
$ws.Range("H40").Value2 = 35

# ── Row 41 : Ligne 40 ────────────────────────────────────────────────────────
$ws.Range("A41").Value2 = 40
$ws.Range("B41").Value2 = "Backoffice"
$ws.Range("C41").Value2 = "Import CSV"
$ws.Range("D41").Value2 = "Import.jsx"
$ws.Range("E41").Value2 = "detectModuleFromHeaders - detection auto module CSV selon colonnes presentes dans header"
$ws.Range("F41").Value2 = "Metier"
$ws.Range("G41").Value2 = "ETU003362"
$ws.Range("H41").Value2 = 20

# ── Row 42 : Ligne 41 ────────────────────────────────────────────────────────
$ws.Range("A42").Value2 = 41
$ws.Range("B42").Value2 = "Backoffice"
$ws.Range("C42").Value2 = "Import CSV"
$ws.Range("D42").Value2 = "Import.jsx"
$ws.Range("E42").Value2 = "Cache refMap step1 - produits et prix evite doublons et appels API redondants"
$ws.Range("F42").Value2 = "Metier"
$ws.Range("G42").Value2 = "ETU003362"
$ws.Range("H42").Value2 = 20

# ── Row 43 : Ligne 42 ────────────────────────────────────────────────────────
$ws.Range("A43").Value2 = 42
$ws.Range("B43").Value2 = "Backoffice"
$ws.Range("C43").Value2 = "Import CSV"
$ws.Range("D43").Value2 = "Import.jsx"
$ws.Range("E43").Value2 = "Cache variantPriceMap - prix TTC variants step1 avant creation commandes"
$ws.Range("F43").Value2 = "Metier"
$ws.Range("G43").Value2 = "ETU003362"
$ws.Range("H43").Value2 = 20

# ── Row 44 : Ligne 43 ────────────────────────────────────────────────────────
$ws.Range("A44").Value2 = 43
$ws.Range("B44").Value2 = "Backoffice"
$ws.Range("C44").Value2 = "Import CSV"
$ws.Range("D44").Value2 = "Import.jsx"
$ws.Range("E44").Value2 = "Cache variantCombMap - ID combination PS pour remplir panier commandes"
$ws.Range("F44").Value2 = "Integration"
$ws.Range("G44").Value2 = "ETU003362"
$ws.Range("H44").Value2 = 30

# ── Row 45 : Ligne 44 ────────────────────────────────────────────────────────
$ws.Range("A45").Value2 = 44
$ws.Range("B45").Value2 = "Backoffice"
$ws.Range("C45").Value2 = "Import CSV"
$ws.Range("D45").Value2 = "Import.jsx"
$ws.Range("E45").Value2 = "Taux TVA corriges par groupe PS - groupe 1=20pct groupe 2=10pct depuis colonne taxe CSV"
$ws.Range("F45").Value2 = "Metier"
$ws.Range("G45").Value2 = "ETU003362"
$ws.Range("H45").Value2 = 30

# ── Row 46 : Ligne 45 ────────────────────────────────────────────────────────
$ws.Range("A46").Value2 = 45
$ws.Range("B46").Value2 = "Backoffice"
$ws.Range("C46").Value2 = "Import CSV"
$ws.Range("D46").Value2 = "Import.jsx"
$ws.Range("E46").Value2 = "Date commande CSV - GET order puis PUT date_add car PS ignore la date au POST"
$ws.Range("F46").Value2 = "Integration"
$ws.Range("G46").Value2 = "ETU003362"
$ws.Range("H46").Value2 = 30

# ── Row 47 : Ligne 46 ────────────────────────────────────────────────────────
$ws.Range("A47").Value2 = 46
$ws.Range("B47").Value2 = "Backoffice"
$ws.Range("C47").Value2 = "Import CSV"
$ws.Range("D47").Value2 = "Import.jsx"
$ws.Range("E47").Value2 = "findOrCreateCategory - recherche ou creation categorie PS depuis colonne CSV produits"
$ws.Range("F47").Value2 = "Integration"
$ws.Range("G47").Value2 = "ETU003362"
$ws.Range("H47").Value2 = 25

# ── Row 48 : Ligne 47 ────────────────────────────────────────────────────────
$ws.Range("A48").Value2 = 47
$ws.Range("B48").Value2 = "Backoffice"
$ws.Range("C48").Value2 = "Import CSV"
$ws.Range("D48").Value2 = "prestashopApi.js"
$ws.Range("E48").Value2 = "Pagination fetchAllPages - import 500+ lignes sans crash via limit=offset,count"
$ws.Range("F48").Value2 = "Integration"
$ws.Range("G48").Value2 = "ETU003362"
$ws.Range("H48").Value2 = 30

# ── Row 49 : Ligne 48 ────────────────────────────────────────────────────────
$ws.Range("A49").Value2 = 48
$ws.Range("B49").Value2 = "Backoffice"
$ws.Range("C49").Value2 = "Reinitialisation"
$ws.Range("D49").Value2 = "delete_orders/customers/products.php"
$ws.Range("E49").Value2 = "Endpoints PHP suppression directe SQL - contourne WS 404 orders/customers/products"
$ws.Range("F49").Value2 = "Integration"
$ws.Range("G49").Value2 = "ETU003362"
$ws.Range("H49").Value2 = 40

# ── Row 50 : Ligne 49 ────────────────────────────────────────────────────────
$ws.Range("A50").Value2 = 49
$ws.Range("B50").Value2 = "Backoffice"
$ws.Range("C50").Value2 = "Commandes"
$ws.Range("D50").Value2 = "Commandes.jsx"
$ws.Range("E50").Value2 = "Machine 4 etats Panier/Paiement/Livre/Annule + boutons Livrer et Annuler"
$ws.Range("F50").Value2 = "Metier"
$ws.Range("G50").Value2 = "ETU003362"
$ws.Range("H50").Value2 = 25

# ── Row 51 : Ligne 50 ────────────────────────────────────────────────────────
$ws.Range("A51").Value2 = 50
$ws.Range("B51").Value2 = "Backoffice"
$ws.Range("C51").Value2 = "Tableau de bord"
$ws.Range("D51").Value2 = "Dashboard.jsx"
$ws.Range("E51").Value2 = "Stats par categorie ventes HT achats HT benefice marge via order_details WS"
$ws.Range("F51").Value2 = "Metier"
$ws.Range("G51").Value2 = "ETU003362"
$ws.Range("H51").Value2 = 35

# ── Row 52 : Ligne 51 ────────────────────────────────────────────────────────
$ws.Range("A52").Value2 = 51
$ws.Range("B52").Value2 = "Backoffice"
$ws.Range("C52").Value2 = "Tableau de bord"
$ws.Range("D52").Value2 = "Dashboard.jsx"
$ws.Range("E52").Value2 = "Tableau stock par categorie Qte physique reservee disponible via stock_available"
$ws.Range("F52").Value2 = "Affichage"
$ws.Range("G52").Value2 = "ETU003362"
$ws.Range("H52").Value2 = 25

# ── Rows 53-56 : Nouvelles taches ────────────────────────────────────────────
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

# ── Total row ─────────────────────────────────────────────────────────────────
$ws.Range("A57").Value2 = "Total"
$ws.Range("H57").Formula = "=SUM(H2:H56)"

Write-Host "Total estimation =" $ws.Range("H57").Value2
Write-Host "Nb rows =" $ws.UsedRange.Rows.Count

# ── Verification spot check ───────────────────────────────────────────────────
foreach ($r in @(2,5,9,14,19,22,28,35,48,53,57)) {
    $a=$ws.Range("A$r").Value2; $d=$ws.Range("D$r").Value2; $e=$ws.Range("E$r").Value2
    Write-Host ("Row {0,-3} L={1,-3} Page={2,-30} Desc={3}" -f $r,$a,$d,($e.Substring(0,[Math]::Min(50,$e.Length))))
}

$wb.Save()
$wb.Close($false)
$excel.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
Write-Host "Sauvegarde OK"
