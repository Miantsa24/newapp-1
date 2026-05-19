ps_product


| Attribut            | Type     | Description          |
| ------------------- | -------- | -------------------- |
| id_product          | int      | ID produit           |
| id_supplier         | int      | fournisseur          |
| id_manufacturer     | int      | marque               |
| id_category_default | int      | catégorie principale |
| reference           | varchar  | référence SKU        |
| supplier_reference  | varchar  | ref fournisseur      |
| location            | varchar  | emplacement stock    |
| width               | decimal  | largeur              |
| height              | decimal  | hauteur              |
| depth               | decimal  | profondeur           |
| weight              | decimal  | poids                |
| price               | decimal  | prix HT              |
| wholesale_price     | decimal  | prix achat           |
| unity               | varchar  | unité                |
| active              | tinyint  | actif ou non         |
| available_for_order | tinyint  | commandable          |
| show_price          | tinyint  | afficher prix        |
| visibility          | varchar  | both/catalog/search  |
| date_add            | datetime | création             |
| date_upd            | datetime | modification         |


ps_product_attribute


| Attribut             | Type    | Description         |
| -------------------- | ------- | ------------------- |
| id_product_attribute | int     | ID combinaison      |
| id_product           | int     | produit parent      |
| reference            | varchar | ref variante        |
| supplier_reference   | varchar | ref fournisseur     |
| location             | varchar | emplacement         |
| ean13                | varchar | code barre          |
| upc                  | varchar | UPC                 |
| mpn                  | varchar | MPN                 |
| wholesale_price      | decimal | prix achat          |
| price                | decimal | impact prix         |
| ecotax               | decimal | écotaxe             |
| quantity             | int     | quantité            |
| weight               | decimal | impact poids        |
| default_on           | tinyint | variante par défaut |
| minimal_quantity     | int     | quantité min        |

ps_image
| Attribut   | Type    | Description      |
| ---------- | ------- | ---------------- |
| id_image   | int     | ID image         |
| id_product | int     | produit lié      |
| position   | int     | ordre affichage  |
| cover      | tinyint | image principale |



ps_feature

| Attribut   | Type    | Description        |
| ---------- | ------- | ------------------ |
| id_feature | int     | ID caractéristique |
| position   | int     | ordre              |
| custom     | tinyint | personnalisée      |


ps_feature_value

| Attribut         | Type    | Description  |
| ---------------- | ------- | ------------ |
| id_feature_value | int     | ID valeur    |
| id_feature       | int     | feature liée |
| custom           | tinyint | valeur perso |


| Attribut             | Type    | Description         |
| -------------------- | ------- | ------------------- |
| id_stock_available   | int     | ID stock            |
| id_product           | int     | produit             |
| id_product_attribute | int     | variante            |
| id_shop              | int     | boutique            |
| id_shop_group        | int     | groupe boutique     |
| quantity             | int     | quantité dispo      |
| depends_on_stock     | tinyint | dépend stock avancé |
| out_of_stock         | tinyint | rupture autorisée   |
