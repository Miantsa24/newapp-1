# Mapping des modules APIs ↔ Tables PrestaShop 8.2.6

Base API :

```text
http://localhost/evaluation/api/
```

---

# Module : Clients

| API | Tables appelées |
|---|---|
| `/customers` | `ps_customer`, `ps_customer_group`, `ps_group`, `ps_guest` |
| `/addresses` | `ps_address`, `ps_country`, `ps_state`, `ps_customer` |
| `/groups` | `ps_group`, `ps_group_lang` |
| `/customer_messages` | `ps_customer_message`, `ps_customer_thread` |
| `/customer_threads` | `ps_customer_thread`, `ps_customer_message` |

---

# Module : Produits

| API | Tables appelées |
|---|---|
| `/products` | `ps_product`, `ps_product_lang`, `ps_product_shop`, `ps_category_product`, `ps_image`, `ps_stock_available`, `ps_product_attribute` |
| `/categories` | `ps_category`, `ps_category_lang`, `ps_category_shop`, `ps_category_product` |
| `/combinations` | `ps_product_attribute`, `ps_product_attribute_combination`, `ps_attribute`, `ps_attribute_group` |
| `/product_features` | `ps_feature`, `ps_feature_lang` |
| `/product_feature_values` | `ps_feature_value`, `ps_feature_value_lang` |
| `/product_options` | `ps_attribute_group`, `ps_attribute_group_lang` |
| `/product_option_values` | `ps_attribute`, `ps_attribute_lang` |
| `/product_suppliers` | `ps_product_supplier`, `ps_supplier`, `ps_product` |
| `/images` | `ps_image`, `ps_image_lang`, `ps_image_shop` |
| `/image_types` | `ps_image_type` |
| `/attachments` | `ps_attachment`, `ps_attachment_lang` |
| `/tags` | `ps_tag`, `ps_product_tag` |

---

# Module : Commandes

| API | Tables appelées |
|---|---|
| `/orders` | `ps_orders`, `ps_order_detail`, `ps_order_history`, `ps_order_invoice`, `ps_order_payment` |
| `/order_details` | `ps_order_detail`, `ps_orders`, `ps_product` |
| `/order_histories` | `ps_order_history`, `ps_order_state` |
| `/order_invoices` | `ps_order_invoice` |
| `/order_payments` | `ps_order_payment` |
| `/order_carriers` | `ps_order_carrier`, `ps_carrier` |
| `/order_states` | `ps_order_state`, `ps_order_state_lang` |
| `/order_cart_rules` | `ps_order_cart_rule`, `ps_cart_rule` |
| `/order_slip` | `ps_order_slip` |

---

# Module : Paniers

| API | Tables appelées |
|---|---|
| `/carts` | `ps_cart`, `ps_cart_product` |
| `/cart_rules` | `ps_cart_rule`, `ps_cart_rule_lang` |

---

# Module : Stock

| API | Tables appelées |
|---|---|
| `/stocks` | `ps_stock` |
| `/stock_availables` | `ps_stock_available` |
| `/stock_movements` | `ps_stock_mvt` |
| `/stock_movement_reasons` | `ps_stock_mvt_reason`, `ps_stock_mvt_reason_lang` |
| `/warehouses` | `ps_warehouse` |
| `/warehouse_product_locations` | `ps_warehouse_product_location` |

---

# Module : Livraison

| API | Tables appelées |
|---|---|
| `/carriers` | `ps_carrier`, `ps_carrier_lang` |
| `/deliveries` | `ps_delivery` |
| `/weight_ranges` | `ps_range_weight` |
| `/price_ranges` | `ps_range_price` |

---

# Module : Fournisseurs et fabricants

| API | Tables appelées |
|---|---|
| `/suppliers` | `ps_supplier`, `ps_supplier_lang` |
| `/manufacturers` | `ps_manufacturer`, `ps_manufacturer_lang` |

---

# Module : Boutique

| API | Tables appelées |
|---|---|
| `/shops` | `ps_shop` |
| `/shop_groups` | `ps_shop_group` |
| `/shop_urls` | `ps_shop_url` |
| `/configurations` | `ps_configuration` |
| `/translated_configurations` | `ps_configuration`, `ps_configuration_lang` |

---

# Module : CMS

| API | Tables appelées |
|---|---|
| `/content_management_system` | `ps_cms`, `ps_cms_lang`, `ps_cms_category` |

---

# Module : Langues et localisation

| API | Tables appelées |
|---|---|
| `/languages` | `ps_lang` |
| `/currencies` | `ps_currency` |
| `/countries` | `ps_country`, `ps_country_lang` |
| `/states` | `ps_state` |
| `/zones` | `ps_zone` |

---

# Module : Taxes

| API | Tables appelées |
|---|---|
| `/taxes` | `ps_tax` |
| `/tax_rules` | `ps_tax_rule` |
| `/tax_rule_groups` | `ps_tax_rules_group` |

---

# Module : Employés

| API | Tables appelées |
|---|---|
| `/employees` | `ps_employee` |
| `/messages` | `ps_message` |

---

# Module : Supply Chain

| API | Tables appelées |
|---|---|
| `/supply_orders` | `ps_supply_order` |
| `/supply_order_details` | `ps_supply_order_detail` |
| `/supply_order_histories` | `ps_supply_order_history` |
| `/supply_order_states` | `ps_supply_order_state` |
| `/supply_order_receipt_histories` | `ps_supply_order_receipt_history` |

---

# Module : Recherche

| API | Tables appelées |
|---|---|
| `/search` | `ps_search_index`, `ps_search_word` |

---

# Relations globales importantes

```text
CLIENT
   ↓
COMMANDES
   ↓
DETAILS COMMANDE
   ↓
PRODUITS
   ↓
CATEGORIES

PRODUITS
   ↓
IMAGES

PRODUITS
   ↓
STOCK

PRODUITS
   ↓
DECLINAISONS
```
