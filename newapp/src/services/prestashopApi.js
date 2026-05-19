const API_KEY = 'GFCDP1I7CKYKMVVN4QMGX81X4MCDMYPL'
const BASE_URL = '/api-prestashop'

const headers = {
  'Authorization': 'Basic ' + btoa(API_KEY + ':'),
  'Accept': 'application/xml',
}

const parseXml = (xmlString) => {
  const parser = new DOMParser()
  return parser.parseFromString(xmlString, 'application/xml')
}

const get = async (endpoint) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, { headers })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const text = await res.text()
  return parseXml(text)
}

const post = async (endpoint, xml) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'text/xml' },
    body: xml
  })
  if (!res.ok) {
    const err = await res.text()
    console.error(`[PS API] POST ${endpoint} → ${res.status}`)
    console.error(`[PS API] Réponse:`, err || '(vide)')
    console.error(`[PS API] XML envoyé:`, xml)
    throw new Error(`HTTP ${res.status} — ${err}`)
  }
  return await res.text()
}

const put = async (endpoint, xml) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'text/xml' },
    body: xml
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`HTTP ${res.status} — ${err}`)
  }
  return await res.text()
}

const del = async (endpoint) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return true
}

// Fetch all pages from a PS WS endpoint and return a merged XML document.
// Compatible with all callers that use doc.querySelectorAll(rootTag + ' > *').
const fetchAllPages = async (endpoint, rootTag, pageSize = 100) => {
  const sep = endpoint.includes('?') ? '&' : '?'
  const allItems = []
  let offset = 0
  while (true) {
    const doc = await get(`${endpoint}${sep}limit=${offset},${pageSize}`)
    const items = Array.from(doc.querySelectorAll(`${rootTag} > *`))
    for (const item of items) allItems.push(item)
    if (items.length < pageSize) break
    offset += pageSize
  }
  const parser = new DOMParser()
  const merged = parser.parseFromString(
    `<?xml version="1.0"?><prestashop xmlns:xlink="http://www.w3.org/1999/xlink"><${rootTag}/></prestashop>`,
    'application/xml'
  )
  const container = merged.querySelector(rootTag)
  for (const item of allItems) container.appendChild(merged.importNode(item, true))
  return merged
}

export const getProducts = () => fetchAllPages('/products?display=full', 'products')
export const getCustomers = () => fetchAllPages('/customers?display=full', 'customers')
export const getOrders = () => fetchAllPages('/orders?display=full', 'orders')
export const getCategories = () => get('/categories?display=full')
export const getCarriers = () => get('/carriers?display=full')
export const getSuppliers = () => get('/suppliers?display=full')
export const getManufacturers = () => get('/manufacturers?display=full')
export const getTaxes = () => get('/taxes?display=full')
export const getCartRules = () => get('/cart_rules?display=full')
export const getAddresses = () => get('/addresses?display=full')
export const getCurrencies = () => get('/currencies?display=full')
export const getStockAvailables = () => fetchAllPages('/stock_availables?display=full', 'stock_availables')
export const getOrderDetails    = () => fetchAllPages('/order_details?display=full', 'order_details')
export const getProductStock = (productId) =>
  get(`/stock_availables?display=full&filter[id_product]=[${productId}]&filter[id_product_attribute]=0`)

export const applyStockDelta = async (productId, delta, date = '') => {
  const res = await fetch('/api-stock-delta', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(API_KEY + ':'),
    },
    body: JSON.stringify({ id_product: parseInt(productId), delta: parseInt(delta) || 0, ...(date ? { date } : {}) }),
  })
  const text = await res.text()
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try { msg = JSON.parse(text).error || msg } catch { msg += ' — ' + text.slice(0, 200) }
    throw new Error(msg)
  }
  try { return JSON.parse(text) } catch { return { success: true } }
}

export const fetchProductCombinations = async (productId) => {
  const combDoc = await get(`/combinations?display=full&filter[id_product]=[${productId}]`)
  const combNodes = Array.from(combDoc.querySelectorAll('combinations > combination'))
  if (combNodes.length === 0) return []

  const [valDoc, groupDoc, stockDoc] = await Promise.all([
    fetchAllPages('/product_option_values?display=full', 'product_option_values'),
    fetchAllPages('/product_options?display=full', 'product_options'),
    get(`/stock_availables?display=full&filter[id_product]=[${productId}]`),
  ])

  const valMap = {}
  Array.from(valDoc.querySelectorAll('product_option_values > product_option_value')).forEach(v => {
    const id = v.querySelector('id')?.textContent?.trim()
    const name = v.querySelector('name language')?.textContent?.trim()
    const groupId = v.querySelector('id_attribute_group')?.textContent?.trim()
    if (id) valMap[id] = { name, groupId }
  })

  const groupMap = {}
  Array.from(groupDoc.querySelectorAll('product_options > product_option')).forEach(g => {
    const id = g.querySelector('id')?.textContent?.trim()
    const name = g.querySelector('name language')?.textContent?.trim()
    if (id) groupMap[id] = name
  })

  const stockMap = {}
  Array.from(stockDoc.querySelectorAll('stock_availables > stock_available')).forEach(s => {
    const combId = s.querySelector('id_product_attribute')?.textContent?.trim()
    const qty = parseInt(s.querySelector('quantity')?.textContent?.trim() || '0')
    if (combId && combId !== '0') stockMap[combId] = qty
  })

  return combNodes.map(c => {
    const id = c.querySelector('id')?.textContent?.trim()
    const priceImpact = parseFloat(c.querySelector('price')?.textContent?.trim() || '0')
    const optionValueNodes = Array.from(c.querySelectorAll('product_option_values product_option_value'))
    const options = optionValueNodes.map(v => {
      const vid = v.getAttribute('id') || v.querySelector('id')?.textContent?.trim()
      const info = valMap[vid] || {}
      return { valueId: vid, valueName: info.name || vid, groupId: info.groupId, groupName: groupMap[info.groupId] || '' }
    })
    return { id, stock: stockMap[id] ?? 0, priceImpact, options }
  })
}

export const getFirstId = async (resource) => {
  const doc = await get(`/${resource}?display=[id]&limit=0,1`)
  const node = doc.querySelector(`${resource} > *`)
  return node?.getAttribute('id') || node?.querySelector('id')?.textContent?.trim() || null
}

export const upsertStockAvailable = async (productId, quantity, retries = 3) => {
  let doc, node, stockId

  for (let attempt = 0; attempt < retries; attempt++) {
    doc = await get(`/stock_availables?display=full&filter[id_product]=[${productId}]&filter[id_product_attribute]=0`)
    node = doc.querySelector('stock_availables > stock_available')
    stockId = node?.querySelector('id')?.textContent?.trim()
    if (stockId) break
    // Wait 500ms before retrying
    await new Promise(r => setTimeout(r, 500))
  }

  if (!stockId) {
    // Fallback: try without the attribute filter
    doc = await get(`/stock_availables?display=full&filter[id_product]=[${productId}]`)
    node = doc.querySelector('stock_availables > stock_available')
    stockId = node?.querySelector('id')?.textContent?.trim()
  }

  if (!stockId) {
    console.warn(`[PS API] stock_available introuvable pour produit ${productId}`)
    return
  }

  const idShop = node?.querySelector('id_shop')?.textContent?.trim() || '1'
  const idShopGroup = node?.querySelector('id_shop_group')?.textContent?.trim() || '0'
  const idProductAttribute = node?.querySelector('id_product_attribute')?.textContent?.trim() || '0'

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <stock_available>
    <id>${stockId}</id>
    <id_product>${productId}</id_product>
    <id_product_attribute>${idProductAttribute}</id_product_attribute>
    <id_shop>${idShop}</id_shop>
    <id_shop_group>${idShopGroup}</id_shop_group>
    <quantity>${Math.max(0, Math.round(quantity))}</quantity>
    <depends_on_stock>0</depends_on_stock>
    <out_of_stock>2</out_of_stock>
  </stock_available>
</prestashop>`

  return put(`/stock_availables/${stockId}`, xml)
}

export const updateProductCategories = async (productId, categoryIds) => {
  const doc = await get(`/products/${productId}`)
  const productNode = doc.querySelector('product')
  if (!productNode) throw new Error('Produit introuvable')

  const manufacturerName = productNode.querySelector('manufacturer_name')
  if (manufacturerName) manufacturerName.remove()

  const quantity = productNode.querySelector('quantity')
  if (quantity) quantity.remove()

  let associations = productNode.querySelector('associations')
  if (!associations) {
    associations = doc.createElement('associations')
    productNode.appendChild(associations)
  }

  let categories = associations.querySelector('categories')
  if (!categories) {
    categories = doc.createElement('categories')
    associations.appendChild(categories)
  }

  const ids = (categoryIds && categoryIds.length > 0) ? categoryIds : ['2']

  while (categories.firstChild) categories.removeChild(categories.firstChild)
  for (let i = 0; i < ids.length; i++) {
    const catId = ids[i]
    const category = doc.createElement('category')
    const id = doc.createElement('id')
    id.textContent = String(catId)
    const position = doc.createElement('position')
    position.textContent = String(i + 1)
    category.appendChild(id)
    category.appendChild(position)
    categories.appendChild(category)
  }

  const xml = new XMLSerializer().serializeToString(doc)
  return put(`/products/${productId}`, xml)
}

export const getAllIds = async (resource, pageSize = 100) => {
  const ids = []
  let offset = 0
  while (true) {
    const doc = await get(`/${resource}?display=[id]&limit=${offset},${pageSize}`)
    const nodes = Array.from(doc.querySelectorAll(`${resource} > *`))
    if (nodes.length === 0) break
    for (const node of nodes) {
      const id = node.getAttribute('id') || node.querySelector('id')?.textContent?.trim()
      if (id) ids.push(id)
    }
    if (nodes.length < pageSize) break
    offset += pageSize
  }
  return ids
}

export const getCategoryIdsForDelete = async () => {
  const doc = await get('/categories?display=[id,id_parent]&limit=0,10000')
  const nodes = Array.from(doc.querySelectorAll('categories > category'))
  const items = nodes.map(node => {
    const id = node.getAttribute('id') || node.querySelector('id')?.textContent?.trim()
    const parentId = node.querySelector('id_parent')?.textContent?.trim()
    return { id, parentId }
  }).filter(item => item.id && item.id !== '1' && item.id !== '2')

  const parentMap = new Map(items.map(item => [item.id, item.parentId]))
  const depthCache = new Map()

  const getDepth = (id, seen = new Set()) => {
    if (depthCache.has(id)) return depthCache.get(id)
    if (seen.has(id)) return 0
    seen.add(id)
    const parent = parentMap.get(id)
    const depth = parent ? 1 + getDepth(parent, seen) : 0
    depthCache.set(id, depth)
    return depth
  }

  return items
    .sort((a, b) => getDepth(b.id) - getDepth(a.id))
    .map(item => item.id)
}

const sanitize = (str) => {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replaceAll('\u0000', '')
    .trim()
}

const slugify = (str) => {
  if (!str) return 'product'
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    || 'product'
}

export const importProducts = async (product) => {
  const name = sanitize(product.name || product['Name *'] || product['Name'] || 'Produit sans nom')
  const price = parseFloat(product.price || product['Price tax excluded'] || 0) || 0
  const wholesale = parseFloat(product['Wholesale price'] || product.wholesale_price || 0) || 0
  const reference = sanitize(product.reference || product['Reference #'] || '')
  const description = sanitize(product.description || product['Description'] || product['Summary'] || '')
  const active = product.active || product['Active (0/1)'] || '1'
  const weight = parseFloat(product['Weight'] || product.weight || 0) || 0
  const ean13 = sanitize(product['EAN13'] || product.ean13 || '')
  const condition = product['Condition'] || product.condition || 'new'
  const visibility = product['Visibility'] || product.visibility || 'both'
  const catId = product.id_category_default || '2'
  // ← available_date
  const normalizeDate = (dateStr) => {
    if (!dateStr) return '0000-00-00'
    // Format DD/MM/YYYY → YYYY-MM-DD
    const ddmmyyyy = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (ddmmyyyy) return `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`
    // Format ISO avec T → garder juste la date
    const iso = dateStr.split('T')[0]
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso
    return '0000-00-00'
  }
  const availableDate = normalizeDate(product.available_date || product.date_availability_produit)
  const slug = slugify(reference || name)

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <product>
    <name><language id="1"><![CDATA[${name}]]></language></name>
    <description><language id="1"><![CDATA[${description}]]></language></description>
    <description_short><language id="1"><![CDATA[${description.slice(0, 800)}]]></language></description_short>
    <link_rewrite><language id="1"><![CDATA[${slug}]]></language></link_rewrite>
    <meta_title><language id="1"><![CDATA[${name}]]></language></meta_title>
    <meta_description><language id="1"><![CDATA[]]></language></meta_description>
    <meta_keywords><language id="1"><![CDATA[]]></language></meta_keywords>
    <available_now><language id="1"><![CDATA[]]></language></available_now>
    <available_later><language id="1"><![CDATA[]]></language></available_later>
    <price>${price}</price>
    <wholesale_price>${wholesale}</wholesale_price>
    <reference><![CDATA[${reference}]]></reference>
    <ean13><![CDATA[${ean13.length === 13 ? ean13 : ''}]]></ean13>
    <weight>${weight}</weight>
    <active>${active === '1' || active === 1 ? 1 : 0}</active>
    <available_date>${availableDate}</available_date>
    <condition><![CDATA[${['new','used','refurbished'].includes(condition) ? condition : 'new'}]]></condition>
    <visibility><![CDATA[${['both','catalog','search','none'].includes(visibility) ? visibility : 'both'}]]></visibility>
    <id_category_default>${catId}</id_category_default>
    <id_tax_rules_group>0</id_tax_rules_group>
    <minimal_quantity>1</minimal_quantity>
    <show_price>1</show_price>
    <state>1</state>
    <available_for_order>1</available_for_order>
    <redirect_type>301-category</redirect_type>
    <id_type_redirected>0</id_type_redirected>
    <associations>
      <categories>
        <category><id>2</id></category>
        <category><id>${catId}</id></category>
      </categories>
    </associations>
  </product>
</prestashop>`

  return post('/products', xml)
}

export const importCustomer = async (item) => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <customer>
    <firstname><![CDATA[${item.firstname || item['First name'] || 'Prénom'}]]></firstname>
    <lastname><![CDATA[${item.lastname || item['Last name'] || 'Nom'}]]></lastname>
    <email><![CDATA[${item.email || item['Email'] || ''}]]></email>
    <passwd><![CDATA[${item.passwd || 'Prestashop2024!'}]]></passwd>
    <active>${item.active || '1'}</active>
    <id_gender>1</id_gender>
    <id_default_group>3</id_default_group>
  </customer>
</prestashop>`
  return post('/customers', xml)
}

export const importCategory = async (item) => {
  const name = item.name || item['Name'] || 'Catégorie'
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <category>
    <name><language id="1"><![CDATA[${name}]]></language></name>
    <description><language id="1"><![CDATA[${item.description || ''}]]></language></description>
    <link_rewrite><language id="1"><![CDATA[${slug}]]></language></link_rewrite>
    <active>${item.active || '1'}</active>
    <id_parent>2</id_parent>
  </category>
</prestashop>`
  return post('/categories', xml)
}

export const importSupplier = async (item) => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <supplier>
    <name><![CDATA[${item.name || 'Fournisseur'}]]></name>
    <description><language id="1"><![CDATA[${item.description || ''}]]></language></description>
    <active>${item.active || '1'}</active>
  </supplier>
</prestashop>`
  return post('/suppliers', xml)
}

export const importManufacturer = async (item) => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <manufacturer>
    <name><![CDATA[${item.name || 'Marque'}]]></name>
    <description><language id="1"><![CDATA[${item.description || ''}]]></language></description>
    <active>${item.active || '1'}</active>
  </manufacturer>
</prestashop>`
  return post('/manufacturers', xml)
}

export const importCartRule = async (item) => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <cart_rule>
    <name><language id="1"><![CDATA[${item.name || 'Promotion'}]]></language></name>
    <code><![CDATA[${item.code || ''}]]></code>
    <reduction_percent>${parseFloat(item.reduction_percent || 0)}</reduction_percent>
    <reduction_amount>${parseFloat(item.reduction_amount || 0)}</reduction_amount>
    <active>${item.active || '1'}</active>
    <quantity>${item.quantity || 1}</quantity>
    <quantity_per_user>${item.quantity_per_user || 1}</quantity_per_user>
    <date_from>${item.date_from || new Date().toISOString().split('T')[0]} 00:00:00</date_from>
    <date_to>${item.date_to || '2099-12-31'} 00:00:00</date_to>
    <id_customer>0</id_customer>
    <reduction_tax>1</reduction_tax>
    <reduction_excludes_special>0</reduction_excludes_special>
    <reduction_product>0</reduction_product>
    <free_shipping>0</free_shipping>
    <partial_use>1</partial_use>
    <highlight>0</highlight>
    <priority>0</priority>
    <minimum_amount>0</minimum_amount>
    <minimum_amount_tax>0</minimum_amount_tax>
    <minimum_amount_currency>1</minimum_amount_currency>
    <minimum_amount_shipping>0</minimum_amount_shipping>
    <country_restriction>0</country_restriction>
    <carrier_restriction>0</carrier_restriction>
    <group_restriction>0</group_restriction>
    <cart_rule_restriction>0</cart_rule_restriction>
    <product_restriction>0</product_restriction>
    <shop_restriction>0</shop_restriction>
    <free_shipping_damage>0</free_shipping_damage>
  </cart_rule>
</prestashop>`
  return post('/cart_rules', xml)
}

export const importCarrier = async (item) => {
  const name = sanitize(item.name || 'Transporteur')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <carrier>
    <name><![CDATA[${name}]]></name>
    <active>${item.active || '1'}</active>
    <deleted>0</deleted>
    <shipping_handling>0</shipping_handling>
    <range_behavior>0</range_behavior>
    <is_module>0</is_module>
    <is_free>${item.is_free || '0'}</is_free>
    <shipping_external>0</shipping_external>
    <need_range>0</need_range>
    <max_width>0</max_width>
    <max_height>0</max_height>
    <max_depth>0</max_depth>
    <max_weight>0</max_weight>
    <grade>0</grade>
    <url></url>
    <delay><language id="1"><![CDATA[${sanitize(item.delay || '24-48h')}]]></language></delay>
  </carrier>
</prestashop>`
  return post('/carriers', xml)
}

export const importTax = async (item) => {
  const name = sanitize(item.name || 'Taxe')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <tax>
    <name><language id="1"><![CDATA[${name}]]></language></name>
    <rate>${parseFloat(item.rate || 0)}</rate>
    <active>${item.active || '1'}</active>
  </tax>
</prestashop>`
  return post('/taxes', xml)
}

export const deleteAllProducts = async () => {
  const ids = await getAllIds('products')
  for (const id of ids) {
    try { await del(`/products/${id}`) } catch { /* ignore */ }
  }
  return `${ids.length} produit(s) supprimé(s)`
}

export const deleteAllCustomers = async () => {
  // filter[deleted]=0 : exclut les clients déjà soft-deletés par PS (évite les 404)
  const doc = await fetchAllPages('/customers?display=[id]&filter[deleted]=0', 'customers')
  const ids = Array.from(doc.querySelectorAll('customers > customer')).map(
    n => n.getAttribute('id') || n.querySelector('id')?.textContent?.trim()
  ).filter(Boolean)
  for (const id of ids) {
    try { await del(`/customers/${id}`) } catch { /* PS peut soft-delete au lieu de supprimer */ }
  }
  return `${ids.length} client(s) supprimé(s)`
}

export const deleteAllOrders = async () => {
  const ids = await getAllIds('orders')
  for (const id of ids) {
    try { await del(`/orders/${id}`) } catch { /* ignore */ }
  }
  return `${ids.length} commande(s) supprimée(s)`
}

export const updateOrderState = async (orderId, newState) => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <order_history>
    <id_order>${orderId}</id_order>
    <id_order_state>${newState}</id_order_state>
    <id_employee>1</id_employee>
  </order_history>
</prestashop>`

  const res = await fetch(`${BASE_URL}/order_histories`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'text/xml' },
    body: xml
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`HTTP ${res.status} — ${err.slice(0, 300)}`)
  }

  // Mettre à jour aussi la commande directement
  const orderDoc = await get(`/orders/${orderId}`)
  const serializer = new XMLSerializer()
  let orderXml = serializer.serializeToString(orderDoc)
  orderXml = orderXml.replace(
    /<current_state[^>]*xlink:href[^>]*>[\s\S]*?<\/current_state>/,
    `<current_state>${newState}</current_state>`
  )

  await fetch(`${BASE_URL}/orders/${orderId}`, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'text/xml' },
    body: orderXml
  })

  return true
}

export const getOrderStates = () => get('/order_states?display=full')

export const changeOrderStatePS = async (orderId, stateLabel) => {
  const res = await fetch('/api-change-state', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(API_KEY + ':'),
    },
    body: JSON.stringify({ order_id: parseInt(orderId), state_label: stateLabel }),
  })
  if (!res.ok) {
    const txt = await res.text()
    let msg = `HTTP ${res.status}`
    try { msg = JSON.parse(txt).error || msg } catch { msg += ' — ' + txt.slice(0, 200) }
    throw new Error(msg)
  }
  return res.json()
}

export { get, del }

const callOrderPhp = async (customerId, cartItems, address, customerEmail = '', orderDate = '') => {
  const items = cartItems.map(item => ({
    product_id: parseInt(item.id),
    quantity: item.quantity,
    id_product_attribute: item.combinationId && item.combinationId !== '0'
      ? parseInt(item.combinationId) : 0,
  }))
  const res = await fetch('/api-create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(API_KEY + ':'),
    },
    body: JSON.stringify({
      customer_id: parseInt(customerId),
      customer_email: customerEmail,
      items,
      order_state_label: 'Dans le panier',
      address: address || 'Adresse',
      order_date: orderDate || '',
    }),
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`order.php ${res.status} — ${txt}`)
  }
  return res.json()
}

export const createOrder = async (form, cart, orderDate = '') => {
  // Créer le client anonyme puis déléguer à order.php
  const customerXml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <customer>
    <firstname><![CDATA[${sanitize(form.firstname)}]]></firstname>
    <lastname><![CDATA[${sanitize(form.lastname)}]]></lastname>
    <email><![CDATA[${sanitize(form.email)}]]></email>
    <passwd><![CDATA[Prestashop2024!]]></passwd>
    <active>1</active>
    <id_gender>1</id_gender>
    <id_default_group>3</id_default_group>
  </customer>
</prestashop>`
  const custRes = await post('/customers', customerXml)
  const custDoc = parseXml(custRes)
  const customerId = custDoc.querySelector('customer id')?.textContent?.trim()
  if (!customerId) throw new Error('Impossible de créer le client')

  const address = `${form.address}, ${form.city} ${form.postcode}`
  return callOrderPhp(customerId, cart, address, '', orderDate)
}

export const createOrderFromData = async (customer, cartItems, orderState, secureKey, ids = {}) => {
  return callOrderPhp(customer.customerId, cartItems, customer.address, customer.email || '', customer.orderDate || '')
}

export const uploadProductImage = async (productId, imageFile, imageBlob) => {
  const formData = new FormData()
  formData.append('image', imageBlob, imageFile)

  const res = await fetch(`${BASE_URL}/images/products/${productId}`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(API_KEY + ':'),
    },
    body: formData
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`HTTP ${res.status} — ${err.slice(0, 200)}`)
  }
  return await res.text()
}

export const loginEmployee = async (email) => {
  // Récupérer tous les employés et vérifier
  const doc = await get('/employees?display=full')
  const employees = Array.from(doc.querySelectorAll('employees > employee'))
  const found = employees.find(e =>
    e.querySelector('email')?.textContent?.trim() === email
  )
  if (!found) throw new Error('Employé introuvable')

  // PrestaShop hash les mots de passe en md5(md5(password))
  // On ne peut pas vérifier le hash côté client directement
  // On retourne les infos de l'employé trouvé
  return {
    id: found.querySelector('id')?.textContent?.trim(),
    firstname: found.querySelector('firstname')?.textContent?.trim(),
    lastname: found.querySelector('lastname')?.textContent?.trim(),
    email: found.querySelector('email')?.textContent?.trim(),
    active: found.querySelector('active')?.textContent?.trim(),
  }
}

export const loginCustomer = async (email) => {
  const filter = encodeURIComponent(`[${email}]`)
  const doc = await get(`/customers?display=full&filter[email]=${filter}&filter[active]=1&filter[deleted]=0`)
  const found = doc.querySelector('customers > customer')
  if (!found) throw new Error('Client introuvable')
  return {
    id: found.querySelector('id')?.textContent?.trim(),
    firstname: found.querySelector('firstname')?.textContent?.trim(),
    lastname: found.querySelector('lastname')?.textContent?.trim(),
    email: found.querySelector('email')?.textContent?.trim(),
  }
}

export const getProductImageUrl = (productId, imageId) => {
  return `http://localhost/Prestashop/api/images/products/${productId}/${imageId}?ws_key=${API_KEY}`
}

export const getProductImages = async (productId) => {
  try {
    const doc = await get(`/images/products/${productId}`)
    const images = Array.from(doc.querySelectorAll('image'))
    return images.map(img => {
      const href = img.getAttribute('xlink:href') || img.getAttribute('href') || ''
      const id = href.split('/').pop()
      return {
        id,
        url: `http://localhost/Prestashop/api/images/products/${productId}/${id}?ws_key=${API_KEY}`
      }
    })
  } catch {
    return []
  }
}

export const getCustomerByEmail = async (email) => {
  const filter = encodeURIComponent(`[${email}]`)
  const doc = await get(`/customers?display=full&filter[email]=${filter}`)
  const node = doc.querySelector('customers > customer')
  if (!node) return null
  return {
    id: node.querySelector('id')?.textContent?.trim(),
    secure_key: node.querySelector('secure_key')?.textContent?.trim(),
    firstname: node.querySelector('firstname')?.textContent?.trim(),
    lastname: node.querySelector('lastname')?.textContent?.trim(),
    email: node.querySelector('email')?.textContent?.trim(),
  }
}


// GERER LES COMBINAISONS ET STOCKS (USAGE FUTUR)


// Créer un groupe d'attributs — réutilise l'existant si déjà présent (évite 500)
export const createAttributeGroup = async (name) => {
  const lower = name.toLowerCase()
  // Try exact filter first, then case-insensitive scan of all groups
  try {
    const existing = await get(`/product_options?display=full&filter[name]=${encodeURIComponent(name)}`)
    const existingId = existing.querySelector('product_option id')?.textContent?.trim()
    if (existingId) return existingId
  } catch { }
  try {
    const all = await fetchAllPages('/product_options?display=full', 'product_options')
    const nodes = Array.from(all.querySelectorAll('product_option'))
    for (const node of nodes) {
      const nodeName = node.querySelector('name language')?.textContent?.trim().toLowerCase()
      if (nodeName === lower) return node.querySelector('id')?.textContent?.trim()
    }
  } catch { }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <product_option>
    <name><language id="1"><![CDATA[${sanitize(name)}]]></language></name>
    <public_name><language id="1"><![CDATA[${sanitize(name)}]]></language></public_name>
    <is_color_group>0</is_color_group>
    <group_type>select</group_type>
    <position>0</position>
  </product_option>
</prestashop>`
  const res = await post('/product_options', xml)
  const doc = parseXml(res)
  return doc.querySelector('product_option id')?.textContent?.trim()
}

// Créer une valeur d'attribut (ex: ngoza, kely), ou retourner l'existante
export const createAttributeValue = async (groupId, value) => {
  try {
    const existing = await get(`/product_option_values?display=full&filter[id_attribute_group]=[${groupId}]&filter[name]=${encodeURIComponent(value)}`)
    const existingId = existing.querySelector('product_option_value id')?.textContent?.trim()
    if (existingId) return existingId
  } catch { }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <product_option_value>
    <id_attribute_group>${groupId}</id_attribute_group>
    <name><language id="1"><![CDATA[${sanitize(value)}]]></language></name>
    <position>0</position>
  </product_option_value>
</prestashop>`
  const res = await post('/product_option_values', xml)
  const doc = parseXml(res)
  return doc.querySelector('product_option_value id')?.textContent?.trim()
}

// Créer une combinaison pour un produit
export const createCombination = async (productId, attributeValueIds, price, reference) => {
  const attrs = attributeValueIds.map(id => `
    <product_option_value>
      <id>${id}</id>
    </product_option_value>`).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <combination>
    <id_product>${productId}</id_product>
    <price>${parseFloat(price || 0).toFixed(6)}</price>
    <weight>0</weight>
    <quantity>0</quantity>
    <reference><![CDATA[${sanitize(reference)}]]></reference>
    <minimal_quantity>1</minimal_quantity>
    <associations>
      <product_option_values>${attrs}</product_option_values>
    </associations>
  </combination>
</prestashop>`
  const res = await post('/combinations', xml)
  const doc = parseXml(res)
  return doc.querySelector('combination id')?.textContent?.trim()
}

// Mettre à jour le stock d'un produit simple (sans combinaison)
export const updateProductStock = async (productId, quantity) => {
  const doc = await get(`/stock_availables?filter[id_product]=${productId}&filter[id_product_attribute]=0&display=full`)
  const stockId = doc.querySelector('stock_available id')?.textContent?.trim()
  if (!stockId) return
  const stockDoc = await get(`/stock_availables/${stockId}`)
  const serializer = new XMLSerializer()
  let xml = serializer.serializeToString(stockDoc)
  xml = xml.replace(/<quantity[^>]*>[\s\S]*?<\/quantity>/, `<quantity>${quantity}</quantity>`)
  return put(`/stock_availables/${stockId}`, xml)
}

// Mettre à jour le stock d'une combinaison
export const updateCombinationStock = async (productId, combinationId, quantity) => {
  const doc = await get(`/stock_availables?filter[id_product]=${productId}&filter[id_product_attribute]=${combinationId}&display=full`)
  const stockId = doc.querySelector('stock_available id')?.textContent?.trim()
  if (!stockId) return

  const stockDoc = await get(`/stock_availables/${stockId}`)
  const serializer = new XMLSerializer()
  let xml = serializer.serializeToString(stockDoc)
  xml = xml.replace(/<quantity[^>]*>[\s\S]*?<\/quantity>/, `<quantity>${quantity}</quantity>`)

  await fetch(`${BASE_URL}/stock_availables/${stockId}`, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'text/xml' },
    body: xml
  })
}

export const ensureGuestUser = async () => {
  const doc = await get('/customers?display=full&filter[email]=user1@newapp.com')
  const existing = doc.querySelector('customer id')?.textContent?.trim()
  if (existing) return
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <customer>
    <firstname><![CDATA[User]]></firstname>
    <lastname><![CDATA[Guest]]></lastname>
    <email><![CDATA[user1@newapp.com]]></email>
    <passwd><![CDATA[Prestashop2024!]]></passwd>
    <active>1</active>
    <id_gender>1</id_gender>
    <id_default_group>3</id_default_group>
  </customer>
</prestashop>`
  await post('/customers', xml)
}