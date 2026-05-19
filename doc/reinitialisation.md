# =====================================
# 🔥 PRESTASHOP FULL RESET API (ORDERED)
# =====================================

# =========================
# 1. ORDERS (VENTES)
# =========================
DELETE /api/order_carriers/{id}
DELETE /api/order_cart_rules/{id}
DELETE /api/order_details/{id}
DELETE /api/order_histories/{id}
DELETE /api/order_invoices/{id}
DELETE /api/order_payments/{id}
DELETE /api/order_slip/{id}
DELETE /api/order_states/{id}
DELETE /api/orders/{id}

# =========================
# 2. CUSTOMERS (CLIENTS + PANIER)
# =========================
DELETE /api/customer_messages/{id}
DELETE /api/customer_threads/{id}
DELETE /api/carts/{id}
DELETE /api/cart_rules/{id}
DELETE /api/addresses/{id}
DELETE /api/customers/{id}
DELETE /api/guests/{id}

# =========================
# 3. PRODUCTS (CATALOGUE)
# =========================
DELETE /api/images/{id}
DELETE /api/product_customization_fields/{id}
DELETE /api/product_option_values/{id}
DELETE /api/product_options/{id}
DELETE /api/product_feature_values/{id}
DELETE /api/product_features/{id}
DELETE /api/product_suppliers/{id}
DELETE /api/combinations/{id}
DELETE /api/products/{id}

# =========================
# 4. STOCK (TRÈS IMPORTANT)
# =========================
DELETE /api/stock_movements/{id}
DELETE /api/stock_movement_reasons/{id}
DELETE /api/stock_availables/{id}
DELETE /api/stocks/{id}
DELETE /api/warehouse_product_locations/{id}

# =========================
# 5. CATEGORIES / CONTENT
# =========================
DELETE /api/categories/{id}
DELETE /api/tags/{id}
DELETE /api/content_management_system/{id}

# =========================
# 6. SUPPLIERS / MANUFACTURERS
# =========================
DELETE /api/product_suppliers/{id}
DELETE /api/suppliers/{id}
DELETE /api/manufacturers/{id}

# =========================
# 7. WAREHOUSE / SUPPLY
# =========================
DELETE /api/warehouses/{id}
DELETE /api/deliveries/{id}
DELETE /api/supply_orders/{id}
DELETE /api/supply_order_details/{id}
DELETE /api/supply_order_histories/{id}
DELETE /api/supply_order_receipt_histories/{id}
DELETE /api/supply_order_states/{id}

# =========================
# 8. PRICES / TAXES
# =========================
DELETE /api/specific_prices/{id}
DELETE /api/specific_price_rules/{id}
DELETE /api/taxes/{id}
DELETE /api/tax_rules/{id}
DELETE /api/tax_rule_groups/{id}
DELETE /api/price_ranges/{id}
DELETE /api/weight_ranges/{id}

# =========================
# 9. SHIPPING / GEOGRAPHY
# =========================
DELETE /api/carriers/{id}
DELETE /api/states/{id}
DELETE /api/countries/{id}
DELETE /api/zones/{id}

# =========================
# 10. SHOP STRUCTURE
# =========================
DELETE /api/shops/{id}
DELETE /api/shop_groups/{id}
DELETE /api/shop_urls/{id}

# =========================
# 11. CONFIG / SYSTEM
# =========================
DELETE /api/configurations/{id}
DELETE /api/translated_configurations/{id}
DELETE /api/currencies/{id}
DELETE /api/languages/{id}
DELETE /api/employees/{id}
DELETE /api/groups/{id}

# =========================
# 12. COMMUNICATION
# =========================
DELETE /api/contacts/{id}
DELETE /api/messages/{id}

# =========================
# 13. IMAGES / SEARCH
# =========================
DELETE /api/images/{id}
DELETE /api/image_types/{id}
DELETE /api/search/{id}
DELETE /api/klaviyo/{id}

# =====================================
# END
# =====================================