$xlFile = "c:\xampp\htdocs\newapp\Todo_ETU003362_Tojo.xlsx"
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false; $excel.DisplayAlerts = $false
$wb = $excel.Workbooks.Open($xlFile)
$ws  = $wb.Sheets.Item("liste des taches")
$wsd = $wb.Sheets.Item("detail_avancement")

# ─────────────────────────────────────────────────────────────────────────────
# 1. Remplir I, J, K pour les lignes 53-56 (L52-L55) deja presentes
# ─────────────────────────────────────────────────────────────────────────────
# L52 - Reinitialisation UI
$ws.Range("I53").Value2 = 20 ; $ws.Range("J53").Value2 = 0 ; $ws.Range("K53").Value2 = 1
# L53 - Reinitialisation DELETE categorie WS
$ws.Range("I54").Value2 = 22 ; $ws.Range("J54").Value2 = 0 ; $ws.Range("K54").Value2 = 1
# L54 - loginCustomer filtre email
$ws.Range("I55").Value2 = 15 ; $ws.Range("J55").Value2 = 0 ; $ws.Range("K55").Value2 = 1
# L55 - ensureGuestUser
$ws.Range("I56").Value2 = 18 ; $ws.Range("J56").Value2 = 0 ; $ws.Range("K56").Value2 = 1

# ─────────────────────────────────────────────────────────────────────────────
# 2. Inserer 10 nouvelles lignes PS backend avant la ligne Total (57)
# ─────────────────────────────────────────────────────────────────────────────
for ($i = 1; $i -le 10; $i++) {
    $ws.Rows.Item(57).Insert() | Out-Null
}

# ─────────────────────────────────────────────────────────────────────────────
# 3. Ecrire les 10 nouvelles taches (rows 57-66, Lignes 56-65)
# Colonnes : A=Ligne B=Cat C=Module D=Page E=Desc F=Type G=Qui H=Est I=Passe J=Reste K=Av
# ─────────────────────────────────────────────────────────────────────────────

# L56 - Config WebService PS
$ws.Range("A57").Value2 = 56
$ws.Range("B57").Value2 = "Backend PS"
$ws.Range("C57").Value2 = "Configuration"
$ws.Range("D57").Value2 = "PS Backoffice"
$ws.Range("E57").Value2 = "Activation WebService PS et creation cle API GFCDP1I7 avec toutes permissions CRUD"
$ws.Range("F57").Value2 = "Base"
$ws.Range("G57").Value2 = "ETU003362"
$ws.Range("H57").Value2 = 10
$ws.Range("I57").Value2 = 10 ; $ws.Range("J57").Value2 = 0 ; $ws.Range("K57").Value2 = 1

# L57 - stockdelta.php module
$ws.Range("A58").Value2 = 57
$ws.Range("B58").Value2 = "Backend PS"
$ws.Range("C58").Value2 = "Module stockdelta"
$ws.Range("D58").Value2 = "stockdelta.php"
$ws.Range("E58").Value2 = "Creation module PS8 stockdelta - fichier enregistrement avec install/uninstall"
$ws.Range("F58").Value2 = "Base"
$ws.Range("G58").Value2 = "ETU003362"
$ws.Range("H58").Value2 = 15
$ws.Range("I58").Value2 = 12 ; $ws.Range("J58").Value2 = 0 ; $ws.Range("K58").Value2 = 1

# L58 - api.php
$ws.Range("A59").Value2 = 58
$ws.Range("B59").Value2 = "Backend PS"
$ws.Range("C59").Value2 = "Module stockdelta"
$ws.Range("D59").Value2 = "api.php"
$ws.Range("E59").Value2 = "Endpoint delta stock POST authentifie - mise a jour quantite StockAvailable PS"
$ws.Range("F59").Value2 = "Integration"
$ws.Range("G59").Value2 = "ETU003362"
$ws.Range("H59").Value2 = 20
$ws.Range("I59").Value2 = 18 ; $ws.Range("J59").Value2 = 0 ; $ws.Range("K59").Value2 = 1

# L59 - order.php creation
$ws.Range("A60").Value2 = 59
$ws.Range("B60").Value2 = "Backend PS"
$ws.Range("C60").Value2 = "Module stockdelta"
$ws.Range("D60").Value2 = "order.php"
$ws.Range("E60").Value2 = "Endpoint creation commande PHP - Cart+validateOrder+boot Symfony kernel PS8"
$ws.Range("F60").Value2 = "Integration"
$ws.Range("G60").Value2 = "ETU003362"
$ws.Range("H60").Value2 = 35
$ws.Range("I60").Value2 = 42 ; $ws.Range("J60").Value2 = 0 ; $ws.Range("K60").Value2 = 1

# L60 - order.php patch skipAvailability
$ws.Range("A61").Value2 = 60
$ws.Range("B61").Value2 = "Backend PS"
$ws.Range("C61").Value2 = "Module stockdelta"
$ws.Range("D61").Value2 = "order.php"
$ws.Range("E61").Value2 = "Patch Cart::updateQty 9e param skipAvailabilityCheck - import historique stock negatif"
$ws.Range("F61").Value2 = "Metier"
$ws.Range("G61").Value2 = "ETU003362"
$ws.Range("H61").Value2 = 20
$ws.Range("I61").Value2 = 15 ; $ws.Range("J61").Value2 = 0 ; $ws.Range("K61").Value2 = 1

# L61 - change_state.php
$ws.Range("A62").Value2 = 61
$ws.Range("B62").Value2 = "Backend PS"
$ws.Range("C62").Value2 = "Module stockdelta"
$ws.Range("D62").Value2 = "change_state.php"
$ws.Range("E62").Value2 = "Endpoint changement etat - OrderHistory::changeIdOrderState declenche mouvement stock"
$ws.Range("F62").Value2 = "Integration"
$ws.Range("G62").Value2 = "ETU003362"
$ws.Range("H62").Value2 = 25
$ws.Range("I62").Value2 = 30 ; $ws.Range("J62").Value2 = 0 ; $ws.Range("K62").Value2 = 1

# L62 - delete_orders.php
$ws.Range("A63").Value2 = 62
$ws.Range("B63").Value2 = "Backend PS"
$ws.Range("C63").Value2 = "Module stockdelta"
$ws.Range("D63").Value2 = "delete_orders.php"
$ws.Range("E63").Value2 = "Suppression SQL cascade commandes - order_detail history invoice cart_product"
$ws.Range("F63").Value2 = "Integration"
$ws.Range("G63").Value2 = "ETU003362"
$ws.Range("H63").Value2 = 20
$ws.Range("I63").Value2 = 18 ; $ws.Range("J63").Value2 = 0 ; $ws.Range("K63").Value2 = 1

# L63 - delete_customers.php
$ws.Range("A64").Value2 = 63
$ws.Range("B64").Value2 = "Backend PS"
$ws.Range("C64").Value2 = "Module stockdelta"
$ws.Range("D64").Value2 = "delete_customers.php"
$ws.Range("E64").Value2 = "Suppression SQL cascade clients y compris soft-deleted - customer_group address guest"
$ws.Range("F64").Value2 = "Integration"
$ws.Range("G64").Value2 = "ETU003362"
$ws.Range("H64").Value2 = 20
$ws.Range("I64").Value2 = 16 ; $ws.Range("J64").Value2 = 0 ; $ws.Range("K64").Value2 = 1

# L64 - delete_products.php
$ws.Range("A65").Value2 = 64
$ws.Range("B65").Value2 = "Backend PS"
$ws.Range("C65").Value2 = "Module stockdelta"
$ws.Range("D65").Value2 = "delete_products.php"
$ws.Range("E65").Value2 = "Suppression SQL cascade produits - combinations images stock search_index category_product"
$ws.Range("F65").Value2 = "Integration"
$ws.Range("G65").Value2 = "ETU003362"
$ws.Range("H65").Value2 = 20
$ws.Range("I65").Value2 = 22 ; $ws.Range("J65").Value2 = 0 ; $ws.Range("K65").Value2 = 1

# L65 - vite.config.js proxies
$ws.Range("A66").Value2 = 65
$ws.Range("B66").Value2 = "Config"
$ws.Range("C66").Value2 = "Proxy Vite"
$ws.Range("D66").Value2 = "vite.config.js"
$ws.Range("E66").Value2 = "7 proxies Vite - api-prestashop change-state create-order delete orders/customers/products"
$ws.Range("F66").Value2 = "Base"
$ws.Range("G66").Value2 = "ETU003362"
$ws.Range("H66").Value2 = 15
$ws.Range("I66").Value2 = 12 ; $ws.Range("J66").Value2 = 0 ; $ws.Range("K66").Value2 = 1

# ─────────────────────────────────────────────────────────────────────────────
# 4. Mettre a jour la ligne Total (maintenant row 67)
# ─────────────────────────────────────────────────────────────────────────────
$ws.Range("A67").Value2 = "Total"
$ws.Range("H67").Formula = "=SUM(H2:H66)"
$ws.Range("I67").Formula = "=SUM(I2:I66)"
$ws.Range("J67").Formula = "=SUM(J2:J66)"
$ws.Range("K67").Formula = "=IFERROR(I67/H67,0)"

Write-Host "liste des taches:"
Write-Host "  Total estimation =" $ws.Range("H67").Value2
Write-Host "  Total temps passe =" $ws.Range("I67").Value2
Write-Host "  Total reste =" $ws.Range("J67").Value2
Write-Host "  Avancement global =" ([math]::Round($ws.Range("K67").Value2 * 100, 1)) "%"
Write-Host "  Nb taches =" ($ws.UsedRange.Rows.Count - 2)

# ─────────────────────────────────────────────────────────────────────────────
# 5. Mettre a jour detail_avancement : ajouter les lignes L52-L65
# ─────────────────────────────────────────────────────────────────────────────
# Total row actuel est row 53 dans detail_avancement
# On insere 14 lignes avant row 53

for ($i = 1; $i -le 14; $i++) {
    $wsd.Rows.Item(53).Insert() | Out-Null
}

# Structure : A=Ligne B=Total C=11/5 D=12/5 E=13/5 F=14/5 G=15/5 H=16/5 I=17/5 J=18/5
# Les taches L52-L55 (front-end) ont ete faites le 18/5
# Les taches PS backend ont ete faites entre 11/5 et 17/5

# L52 - Reinit UI (18/5)
$wsd.Range("A53").Value2 = 52 ; $wsd.Range("B53").Value2 = 20
$wsd.Range("J53").Value2 = 20

# L53 - Reinit DELETE cat (18/5)
$wsd.Range("A54").Value2 = 53 ; $wsd.Range("B54").Value2 = 22
$wsd.Range("J54").Value2 = 22

# L54 - loginCustomer filtre (16/5)
$wsd.Range("A55").Value2 = 54 ; $wsd.Range("B55").Value2 = 15
$wsd.Range("H55").Value2 = 15

# L55 - ensureGuestUser (18/5)
$wsd.Range("A56").Value2 = 55 ; $wsd.Range("B56").Value2 = 18
$wsd.Range("J56").Value2 = 18

# L56 - Config WS PS (11/5)
$wsd.Range("A57").Value2 = 56 ; $wsd.Range("B57").Value2 = 10
$wsd.Range("C57").Value2 = 10

# L57 - stockdelta.php (11/5)
$wsd.Range("A58").Value2 = 57 ; $wsd.Range("B58").Value2 = 12
$wsd.Range("C58").Value2 = 12

# L58 - api.php (12/5)
$wsd.Range("A59").Value2 = 58 ; $wsd.Range("B59").Value2 = 18
$wsd.Range("D59").Value2 = 18

# L59 - order.php creation (12/5 + 13/5)
$wsd.Range("A60").Value2 = 59 ; $wsd.Range("B60").Value2 = 42
$wsd.Range("D60").Value2 = 20 ; $wsd.Range("E60").Value2 = 22

# L60 - order.php patch (17/5)
$wsd.Range("A61").Value2 = 60 ; $wsd.Range("B61").Value2 = 15
$wsd.Range("I61").Value2 = 15

# L61 - change_state.php (13/5 + 14/5)
$wsd.Range("A62").Value2 = 61 ; $wsd.Range("B62").Value2 = 30
$wsd.Range("E62").Value2 = 15 ; $wsd.Range("F62").Value2 = 15

# L62 - delete_orders.php (17/5)
$wsd.Range("A63").Value2 = 62 ; $wsd.Range("B63").Value2 = 18
$wsd.Range("I63").Value2 = 18

# L63 - delete_customers.php (17/5)
$wsd.Range("A64").Value2 = 63 ; $wsd.Range("B64").Value2 = 16
$wsd.Range("I64").Value2 = 16

# L64 - delete_products.php (17/5)
$wsd.Range("A65").Value2 = 64 ; $wsd.Range("B65").Value2 = 22
$wsd.Range("I65").Value2 = 22

# L65 - vite.config.js proxies (13/5 + 16/5)
$wsd.Range("A66").Value2 = 65 ; $wsd.Range("B66").Value2 = 12
$wsd.Range("E66").Value2 = 5 ; $wsd.Range("H66").Value2 = 7

# ─────────────────────────────────────────────────────────────────────────────
# 6. Mettre a jour Total row de detail_avancement (maintenant row 67)
# ─────────────────────────────────────────────────────────────────────────────
for ($c = 2; $c -le 10; $c++) {
    $col = [char](64 + $c)
    $wsd.Range("${col}67").Formula = "=SUM(${col}2:${col}66)"
}

Write-Host "`ndetail_avancement:"
Write-Host "  Total col B (temps total) =" $wsd.Range("B67").Value2
Write-Host "  Total col J (18/5)        =" $wsd.Range("J67").Value2

# ─────────────────────────────────────────────────────────────────────────────
# 7. Mettre a jour avancement sheet
# ─────────────────────────────────────────────────────────────────────────────
$wsa = $wb.Sheets.Item("avancement")
$wsa.Range("A2").Value2 = 1455   # estimation totale (1255 + 200 nouvelles taches)
$wsa.Range("B2").Value2 = 1446   # temps passe total
$wsa.Range("C2").Value2 = 70     # reste a faire (inchange, taches precedentes)

Write-Host "`navancement: est=" $wsa.Range("A2").Value2 " passe=" $wsa.Range("B2").Value2

# ─────────────────────────────────────────────────────────────────────────────
# Verification finale
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "`n=== VERIFICATION spot check ==="
foreach ($r in @(53, 57, 60, 62, 65, 66, 67)) {
    $l=$ws.Range("A$r").Value2; $d=$ws.Range("D$r").Value2
    $h=$ws.Range("H$r").Value2; $ii=$ws.Range("I$r").Value2; $j=$ws.Range("J$r").Value2; $k=$ws.Range("K$r").Value2
    Write-Host ("Row {0,-3} L={1,-4} Page={2,-35} Est={3,-4} Pass={4,-4} Rest={5,-4} Av={6}" -f $r,$l,$d,$h,$ii,$j,([math]::Round([double]$k*100,0)))
}

$wb.Save()
$wb.Close($false)
$excel.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
Write-Host "`nSauvegarde OK"
