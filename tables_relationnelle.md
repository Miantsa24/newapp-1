## Architecture générale PrestaShop

# PrestaShop utilise :

- des tables principales (ps_product, ps_customer, etc.)
- des tables de traduction (_lang)
- des tables multi-boutiques (_shop)
- des tables de liaison (category_product, product_tag, etc.)

# Convention officielle :

- _lang → traductions
- _shop → multi-boutique
- tables composées → relations many-to-many

## Tables relationnelles PrestaShop

### 1. Module Clients

| Table | Description |
| --- | --- |
| ps_customer | Clients |
| ps_address | Adresses clients |
| ps_group | Groupes clients |
| ps_customer_group | Liaison client/groupe |
| ps_guest | Visiteurs anonymes |
| ps_customer_thread | Discussions SAV |
| ps_customer_message | Messages SAV |

Relations :

```text
ps_customer
	├── ps_address
	├── ps_orders
	└── ps_customer_group
			└── ps_group
```

### 2. Module Produits

| Table | Description |
| --- | --- |
| ps_product | Produits |
| ps_product_lang | Traductions produits |
| ps_product_shop | Produits par boutique |
| ps_category | Catégories |
| ps_category_lang | Traductions catégories |
| ps_category_shop | Catégories multi-shop |
| ps_category_product | Liaison produit/catégorie |
| ps_product_attribute | Déclinaisons |
| ps_product_attribute_combination | Combinaisons |
| ps_attribute | Valeurs attributs |
| ps_attribute_group | Groupes attributs |
| ps_feature | Caractéristiques |
| ps_feature_value | Valeurs caractéristiques |
| ps_product_supplier | Fournisseurs produits |

Relations :

```text
ps_product
	├── ps_product_lang
	├── ps_product_shop
	├── ps_category_product
	│       └── ps_category
	├── ps_product_attribute
	├── ps_stock_available
	└── ps_image
```

### 3. Module Images

| Table | Description |
| --- | --- |
| ps_image | Images produits |
| ps_image_lang | Traductions images |
| ps_image_shop | Images multi-shop |
| ps_image_type | Types d’images |

### 4. Module Commandes

| Table | Description |
| --- | --- |
| ps_orders | Commandes |
| ps_order_detail | Produits commandés |
| ps_order_history | Historique |
| ps_order_invoice | Factures |
| ps_order_payment | Paiements |
| ps_order_carrier | Transporteurs |
| ps_order_state | États commandes |
| ps_order_cart_rule | Réductions |
| ps_order_slip | Avoirs |

Relations :

```text
ps_orders
	├── ps_order_detail
	├── ps_order_history
	├── ps_order_invoice
	├── ps_order_payment
	└── ps_order_carrier
```

### 5. Module Paniers

| Table | Description |
| --- | --- |
| ps_cart | Panier |
| ps_cart_product | Produits panier |
| ps_cart_rule | Coupons/règles |
| ps_cart_rule_lang | Traductions |

### 6. Module Stock

| Table | Description |
| --- | --- |
| ps_stock | Stock physique |
| ps_stock_available | Quantités disponibles |
| ps_stock_mvt | Mouvements stock |
| ps_stock_mvt_reason | Raisons mouvements |
| ps_warehouse | Entrepôts |
| ps_warehouse_product_location | Emplacements |

Relations :

```text
ps_product
	└── ps_stock_available

ps_warehouse
	└── ps_warehouse_product_location
```

### 7. Module Livraison

| Table | Description |
| --- | --- |
| ps_carrier | Transporteurs |
| ps_delivery | Livraisons |
| ps_range_price | Tranches prix |
| ps_range_weight | Tranches poids |

### 8. Module Fournisseurs / Fabricants

| Table | Description |
| --- | --- |
| ps_supplier | Fournisseurs |
| ps_supplier_lang | Traductions fournisseurs |
| ps_manufacturer | Fabricants |
| ps_manufacturer_lang | Traductions fabricants |

### 9. Module Boutique

| Table | Description |
| --- | --- |
| ps_shop | Boutiques |
| ps_shop_group | Groupes boutiques |
| ps_shop_url | URLs |
| ps_configuration | Configuration |
| ps_configuration_lang | Traductions config |

### 10. Module CMS

| Table | Description |
| --- | --- |
| ps_cms | Pages CMS |
| ps_cms_lang | Traductions CMS |
| ps_cms_category | Catégories CMS |

### 11. Module Localisation

| Table | Description |
| --- | --- |
| ps_lang | Langues |
| ps_currency | Devises |
| ps_country | Pays |
| ps_country_lang | Traductions pays |
| ps_state | Régions |
| ps_zone | Zones |

### 12. Module Taxes

| Table | Description |
| --- | --- |
| ps_tax | Taxes |
| ps_tax_rule | Règles taxes |
| ps_tax_rules_group | Groupes taxes |

### 13. Module Employés

| Table | Description |
| --- | --- |
| ps_employee | Employés |
| ps_message | Messages BO |

### 14. Module Recherche

| Table | Description |
| --- | --- |
| ps_search_index | Index recherche |
| ps_search_word | Mots recherche |

