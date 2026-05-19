import { useState } from 'react'

const MODULES = [
  {
    key: 'products',
    label: 'Produits',
    icon: '📦',
    color: 'red',
    description: 'Produits, variantes, stocks, images, prix spéciaux',
    tables: [
      'ps_product', 'ps_product_lang', 'ps_product_shop',
      'ps_product_tag', 'ps_product_sale', 'ps_product_supplier',
      'ps_product_download', 'ps_product_country_tax',
      'ps_product_group_reduction_cache', 'ps_product_comment',
      'ps_product_comment_grade', 'ps_product_comment_usefulness',
      'ps_product_comment_report', 'ps_stock_available',
      'ps_stock', 'ps_stock_mvt', 'ps_specific_price',
      'ps_specific_price_rule', 'ps_accessory',
      'ps_attribute', 'ps_attribute_lang', 'ps_attribute_shop',
      'ps_attribute_group', 'ps_attribute_group_lang', 'ps_attribute_group_shop',
      'ps_combination', 'ps_combination_lang', 'ps_combination_shop',
    ],
  },
  {
    key: 'orders',
    label: 'Commandes',
    icon: '🛒',
    color: 'purple',
    description: 'Commandes, détails, historiques, factures, paiements',
    tables: [
      'ps_orders', 'ps_order_detail', 'ps_order_history',
      'ps_order_invoice', 'ps_order_invoice_payment', 'ps_order_invoice_tax',
      'ps_order_payment', 'ps_order_return', 'ps_order_return_detail',
      'ps_order_slip', 'ps_order_slip_detail', 'ps_order_carrier',
      'ps_order_cart_rule', 'ps_order_state', 'ps_order_state_lang',
    ],
  },
  {
    key: 'customers',
    label: 'Clients',
    icon: '👥',
    color: 'orange',
    description: 'Clients, adresses, messages, sessions, paniers',
    tables: [
      'ps_customer', 'ps_customer_group', 'ps_customer_message',
      'ps_customer_message_sync_imap', 'ps_customer_session',
      'ps_customer_thread', 'ps_address', 'ps_cart',
      'ps_cart_product', 'ps_cart_cart_rule', 'ps_connections',
      'ps_connections_page', 'ps_connections_source',
    ],
  },
  {
    key: 'categories',
    label: 'Catégories',
    icon: '🗂️',
    color: 'blue',
    description: 'Catégories, traductions, associations boutique',
    tables: [
      'ps_category', 'ps_category_lang', 'ps_category_shop',
      'ps_category_group', 'ps_category_product',
    ],
  },
  {
    key: 'carriers',
    label: 'Transporteurs',
    icon: '🚚',
    color: 'cyan',
    description: 'Transporteurs, zones, groupes, taxes',
    tables: [
      'ps_carrier', 'ps_carrier_lang', 'ps_carrier_shop',
      'ps_carrier_group', 'ps_carrier_zone',
      'ps_carrier_tax_rules_group_shop',
      'ps_range_price', 'ps_range_weight', 'ps_delivery',
    ],
  },
  {
    key: 'suppliers',
    label: 'Fournisseurs',
    icon: '🏭',
    color: 'yellow',
    description: 'Fournisseurs, commandes fournisseurs, historiques',
    tables: [
      'ps_supplier', 'ps_supplier_lang', 'ps_supplier_shop',
      'ps_supply_order', 'ps_supply_order_detail',
      'ps_supply_order_history', 'ps_supply_order_receipt_history',
      'ps_supply_order_state', 'ps_supply_order_state_lang',
    ],
  },
  {
    key: 'manufacturers',
    label: 'Marques',
    icon: '🏷️',
    color: 'pink',
    description: 'Marques et fabricants',
    tables: ['ps_manufacturer', 'ps_manufacturer_lang', 'ps_manufacturer_shop'],
  },
  {
    key: 'discounts',
    label: 'Promotions',
    icon: '🎟️',
    color: 'emerald',
    description: 'Règles de panier, remises, promotions',
    tables: [
      'ps_cart_rule', 'ps_cart_rule_lang', 'ps_cart_rule_shop',
      'ps_cart_rule_carrier', 'ps_cart_rule_combination',
      'ps_cart_rule_country', 'ps_cart_rule_group',
      'ps_cart_rule_product_rule', 'ps_cart_rule_product_rule_group',
      'ps_cart_rule_product_rule_value', 'ps_specific_price',
      'ps_specific_price_rule', 'ps_specific_price_rule_condition',
      'ps_specific_price_rule_condition_group',
    ],
  },
  {
    key: 'taxes',
    label: 'Taxes',
    icon: '💶',
    color: 'slate',
    description: 'Taxes, règles de taxes, groupes',
    tables: [
      'ps_tax', 'ps_tax_lang', 'ps_tax_rule',
      'ps_tax_rules_group', 'ps_tax_rules_group_shop',
    ],
  },
  {
    key: 'stock',
    label: 'Stocks',
    icon: '🏪',
    color: 'indigo',
    description: 'Entrepôts, mouvements de stock, localisations',
    tables: [
      'ps_warehouse', 'ps_warehouse_carrier', 'ps_warehouse_shop',
      'ps_warehouse_product_location', 'ps_stock',
      'ps_stock_available', 'ps_stock_mvt', 'ps_stock_mvt_reason',
      'ps_stock_mvt_reason_lang',
    ],
  },
  {
    key: 'cms',
    label: 'Pages CMS',
    icon: '📄',
    color: 'teal',
    description: 'Pages CMS, catégories CMS',
    tables: [
      'ps_cms', 'ps_cms_lang', 'ps_cms_shop',
      'ps_cms_category', 'ps_cms_category_lang', 'ps_cms_category_shop',
      'ps_cms_role', 'ps_cms_role_lang',
    ],
  },
  {
    key: 'search',
    label: 'Recherche',
    icon: '🔍',
    color: 'gray',
    description: 'Index de recherche, mots-clés, statistiques',
    tables: [
      'ps_search_index', 'ps_search_word',
      'ps_tag', 'ps_tag_count', 'ps_statssearch',
    ],
  },
]

const COLOR_MAP = {
  red:     { badge: 'bg-red-900/60 text-red-400 border-red-800',     btn: 'bg-red-600 hover:bg-red-700',     ring: 'border-red-700',    dot: 'bg-red-400' },
  purple:  { badge: 'bg-purple-900/60 text-purple-400 border-purple-800', btn: 'bg-purple-600 hover:bg-purple-700', ring: 'border-purple-700', dot: 'bg-purple-400' },
  orange:  { badge: 'bg-orange-900/60 text-orange-400 border-orange-800', btn: 'bg-orange-600 hover:bg-orange-700', ring: 'border-orange-700', dot: 'bg-orange-400' },
  blue:    { badge: 'bg-blue-900/60 text-blue-400 border-blue-800',   btn: 'bg-blue-600 hover:bg-blue-700',   ring: 'border-blue-700',   dot: 'bg-blue-400' },
  cyan:    { badge: 'bg-cyan-900/60 text-cyan-400 border-cyan-800',   btn: 'bg-cyan-600 hover:bg-cyan-700',   ring: 'border-cyan-700',   dot: 'bg-cyan-400' },
  yellow:  { badge: 'bg-yellow-900/60 text-yellow-400 border-yellow-800', btn: 'bg-yellow-600 hover:bg-yellow-700', ring: 'border-yellow-700', dot: 'bg-yellow-400' },
  pink:    { badge: 'bg-pink-900/60 text-pink-400 border-pink-800',   btn: 'bg-pink-600 hover:bg-pink-700',   ring: 'border-pink-700',   dot: 'bg-pink-400' },
  emerald: { badge: 'bg-emerald-900/60 text-emerald-400 border-emerald-800', btn: 'bg-emerald-600 hover:bg-emerald-700', ring: 'border-emerald-700', dot: 'bg-emerald-400' },
  slate:   { badge: 'bg-slate-700/60 text-slate-300 border-slate-600', btn: 'bg-slate-600 hover:bg-slate-500', ring: 'border-slate-600',  dot: 'bg-slate-400' },
  indigo:  { badge: 'bg-indigo-900/60 text-indigo-400 border-indigo-800', btn: 'bg-indigo-600 hover:bg-indigo-700', ring: 'border-indigo-700', dot: 'bg-indigo-400' },
  teal:    { badge: 'bg-teal-900/60 text-teal-400 border-teal-800',   btn: 'bg-teal-600 hover:bg-teal-700',   ring: 'border-teal-700',   dot: 'bg-teal-400' },
  gray:    { badge: 'bg-gray-800/60 text-gray-400 border-gray-700',   btn: 'bg-gray-600 hover:bg-gray-500',   ring: 'border-gray-600',   dot: 'bg-gray-400' },
}

export default function Reinitialisation() {
  const [selected, setSelected] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [filter, setFilter] = useState('')

  const toggleSelect = (key) => {
    setSelected(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const selectAll = () => setSelected(MODULES.map(m => m.key))
  const clearAll = () => setSelected([])

  const handleReset = async () => {
    setLoading(true)
    setConfirm(false)
    const res = {}
    const selectedModules = MODULES.filter(m => selected.includes(m.key))
    for (const mod of selectedModules) {
      try {
        // Appel API PrestaShop pour chaque ressource
        const apiKey = mod.key
        const response = await fetch(`/api-prestashop/${apiKey}`, {
          headers: { Authorization: 'Basic ' + btoa(import.meta.env.VITE_API_KEY + ':') }
        })
        if (response.ok) {
          const text = await response.text()
          const doc = new DOMParser().parseFromString(text, 'application/xml')
          const tag = apiKey.slice(0, -1)
          const ids = Array.from(doc.querySelectorAll(`${apiKey} > ${tag}`))
            .map(el => el.getAttribute('id'))
            .filter(Boolean)
          let deleted = 0
          for (const id of ids) {
            await fetch(`/api-prestashop/${apiKey}/${id}`, {
              method: 'DELETE',
              headers: { Authorization: 'Basic ' + btoa(import.meta.env.VITE_API_KEY + ':') }
            })
            deleted++
          }
          res[mod.key] = { type: 'success', message: `${deleted} élément(s) supprimé(s)` }
        } else {
          res[mod.key] = { type: 'warning', message: 'Module non accessible via API' }
        }
      } catch (err) {
        res[mod.key] = { type: 'error', message: err.message }
      }
    }
    setResults(res)
    setLoading(false)
    setSelected([])
  }

  const filtered = MODULES.filter(m =>
    m.label.toLowerCase().includes(filter.toLowerCase()) ||
    m.description.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-white">Réinitialisation des données</h1>
          <p className="text-slate-400 text-sm mt-1">
            Sélectionnez les modules à réinitialiser. Les tables liées seront également vidées.
          </p>
        </div>
        {selected.length > 0 && (
          <button
            onClick={() => setConfirm(true)}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
          >
            🗑️ Réinitialiser {selected.length} module(s)
          </button>
        )}
      </div>

      {/* Avertissement */}
      <div className="flex items-center gap-2 bg-yellow-900/30 border border-yellow-700/50 text-yellow-400 text-sm px-4 py-3 rounded-lg mb-6">
        ⚠️ Ces actions sont irréversibles. Les données supprimées ne pourront pas être récupérées.
      </div>

      {/* Barre de recherche + actions */}
      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Rechercher un module..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button onClick={selectAll} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors">
          Tout sélectionner
        </button>
        <button onClick={clearAll} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors">
          Tout désélectionner
        </button>
        {selected.length > 0 && (
          <span className="text-slate-400 text-sm ml-auto">
            {selected.length} module(s) sélectionné(s)
          </span>
        )}
      </div>

      {/* Grille des modules */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {filtered.map(mod => {
          const c = COLOR_MAP[mod.color]
          const isSelected = selected.includes(mod.key)
          const isExpanded = expanded === mod.key
          const result = results?.[mod.key]

          return (
            <div
              key={mod.key}
              className={`bg-slate-800 rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                isSelected ? `${c.ring} shadow-lg` : 'border-slate-700'
              }`}
            >
              {/* Card header */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer flex-shrink-0 transition-all"
                      style={{ borderColor: isSelected ? 'currentColor' : '#475569', backgroundColor: isSelected ? 'transparent' : 'transparent' }}
                      onClick={() => toggleSelect(mod.key)}
                    >
                      {isSelected && <span className={`text-xs font-bold ${c.badge.split(' ')[1]}`}>✓</span>}
                    </div>
                    <span className="text-xl">{mod.icon}</span>
                    <span className="text-white font-semibold text-sm">{mod.label}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${c.badge}`}>
                    {mod.tables.length} tables
                  </span>
                </div>

                <p className="text-slate-400 text-xs mb-3 ml-8">{mod.description}</p>

                {/* Result */}
                {result && (
                  <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${
                    result.type === 'success' ? 'bg-emerald-900/50 text-emerald-400' :
                    result.type === 'warning' ? 'bg-yellow-900/50 text-yellow-400' :
                    'bg-red-900/50 text-red-400'
                  }`}>
                    {result.type === 'success' ? '✓' : result.type === 'warning' ? '⚠' : '✗'} {result.message}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 ml-8">
                  <button
                    onClick={() => toggleSelect(mod.key)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                        : `${c.btn} text-white`
                    }`}
                  >
                    {isSelected ? 'Désélectionner' : 'Sélectionner'}
                  </button>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : mod.key)}
                    className="py-1.5 px-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition-colors"
                  >
                    {isExpanded ? '▲' : '▼'}
                  </button>
                </div>
              </div>

              {/* Tables list (expandable) */}
              {isExpanded && (
                <div className="border-t border-slate-700 px-5 py-4 bg-slate-900/50">
                  <p className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wide">Tables concernées</p>
                  <div className="flex flex-wrap gap-1.5">
                    {mod.tables.map(t => (
                      <span key={t} className={`text-xs px-2 py-0.5 rounded border font-mono ${c.badge}`}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Barre de confirmation flottante */}
      {selected.length > 0 && !confirm && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-600 rounded-xl px-6 py-4 shadow-2xl flex items-center gap-4 z-50">
          <span className="text-white text-sm font-medium">
            {selected.length} module(s) sélectionné(s) :
          </span>
          <div className="flex gap-1.5">
            {selected.map(k => {
              const mod = MODULES.find(m => m.key === k)
              return (
                <span key={k} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-lg">
                  {mod?.icon} {mod?.label}
                </span>
              )
            })}
          </div>
          <button
            onClick={() => setConfirm(true)}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            🗑️ Réinitialiser
          </button>
          <button
            onClick={clearAll}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Modal de confirmation */}
      {confirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-600 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <p className="text-3xl text-center mb-4">⚠️</p>
            <h2 className="text-white font-bold text-xl text-center mb-2">Confirmer la réinitialisation</h2>
            <p className="text-slate-400 text-sm text-center mb-6">
              Vous allez supprimer définitivement les données de{' '}
              <span className="text-white font-semibold">{selected.length} module(s)</span>.
              Cette action est irréversible.
            </p>

            <div className="bg-slate-900 rounded-xl p-4 mb-6">
              {selected.map(k => {
                const mod = MODULES.find(m => m.key === k)
                return (
                  <div key={k} className="flex items-center justify-between py-1.5 border-b border-slate-700 last:border-0">
                    <span className="text-slate-300 text-sm">{mod?.icon} {mod?.label}</span>
                    <span className="text-slate-500 text-xs">{mod?.tables.length} tables</span>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirm(false)}
                className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleReset}
                disabled={loading}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                {loading ? 'Suppression...' : 'Oui, tout supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-600 rounded-xl p-8 text-center">
            <p className="text-3xl mb-4 animate-spin inline-block">⚙️</p>
            <p className="text-white font-semibold">Réinitialisation en cours...</p>
            <p className="text-slate-400 text-sm mt-1">Suppression des données liées</p>
          </div>
        </div>
      )}
    </div>
  )
}