import { useState, useEffect, useCallback, Fragment } from 'react'
import { getProducts, getStockAvailables } from '../../services/prestashopApi'

const API_KEY = 'GFCDP1I7CKYKMVVN4QMGX81X4MCDMYPL'
const STOCK_HISTORY_KEY = 'newapp_stock_history'

// ─── Helpers localStorage pour l'historique ──────────────────────────────────

const loadHistory = () => {
  try { return JSON.parse(localStorage.getItem(STOCK_HISTORY_KEY) || '{}') } catch { return {} }
}

const saveSnapshot = (productId, qty) => {
  const history = loadHistory()
  const today = new Date().toISOString().split('T')[0]
  if (!history[productId]) history[productId] = []
  const existing = history[productId].find(e => e.date === today)
  if (existing) { existing.qty = qty } else { history[productId].push({ date: today, qty }) }
  // Conserver 30 derniers jours max
  history[productId] = history[productId]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30)
  localStorage.setItem(STOCK_HISTORY_KEY, JSON.stringify(history))
}

const getHistory = (productId, days = 14) => {
  const history = loadHistory()
  const entries = history[productId] || []
  const result = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const entry = entries.find(e => e.date === dateStr)
    result.push({
      date: dateStr,
      label: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      qty: entry ? entry.qty : null,
    })
  }
  return result
}

// ─── Composant graphique ──────────────────────────────────────────────────────

function StockChart({ productId, currentQty }) {
  const data = getHistory(productId, 14)
  const filled = data.map(d => ({ ...d, qty: d.qty ?? currentQty }))
  const maxQty = Math.max(...filled.map(d => d.qty), 1)

  return (
    <div className="mt-4 bg-slate-900 rounded-xl p-4">
      <p className="text-slate-400 text-xs mb-3">Évolution du stock (14 jours)</p>
      <div className="flex items-end gap-1 h-24">
        {filled.map((day, i) => {
          const height = maxQty > 0 ? Math.max((day.qty / maxQty) * 100, 4) : 4
          const isToday = day.date === new Date().toISOString().split('T')[0]
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${day.label} : ${day.qty}`}>
              <div className="w-full flex flex-col justify-end" style={{ height: '64px' }}>
                <div
                  className={`w-full rounded-t transition-all ${isToday ? 'bg-sky-500' : 'bg-slate-600'}`}
                  style={{ height: `${height}%` }}
                />
              </div>
              {i % 3 === 0 && (
                <p className={`text-center leading-tight ${isToday ? 'text-sky-400' : 'text-slate-600'}`}
                  style={{ fontSize: '9px' }}>
                  {day.label}
                </p>
              )}
            </div>
          )
        })}
      </div>
      <p className="text-slate-500 text-xs text-right mt-1">max : {maxQty}</p>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function BackofficeStocks() {
  const [products, setProducts] = useState([])
  const [stocks, setStocks] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [deltaInputs, setDeltaInputs] = useState({})
  const [updating, setUpdating] = useState(null)
  const [notification, setNotification] = useState(null)

  const notify = (type, message) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [prodDoc, stockDoc] = await Promise.all([getProducts(), getStockAvailables()])

      const stockMap = {}
      Array.from(stockDoc.querySelectorAll('stock_availables > stock_available')).forEach(s => {
        const idProd = s.querySelector('id_product')?.textContent?.trim()
        const idAttr = s.querySelector('id_product_attribute')?.textContent?.trim()
        if (idAttr === '0') {
          stockMap[idProd] = parseInt(s.querySelector('quantity')?.textContent?.trim() || '0')
        }
      })

      const prods = Array.from(prodDoc.querySelectorAll('products > product'))
        .map(p => ({
          id: p.querySelector('id')?.textContent?.trim(),
          name: p.querySelector('name language')?.textContent?.trim() || 'Sans nom',
          reference: p.querySelector('reference')?.textContent?.trim() || '',
          active: p.querySelector('active')?.textContent?.trim(),
        }))
        .filter(p => p.id && p.active === '1')

      setProducts(prods)
      setStocks(stockMap)

      // Enregistrer snapshot du jour pour chaque produit
      prods.forEach(p => {
        const qty = stockMap[p.id] ?? 0
        saveSnapshot(p.id, qty)
      })

      setLoading(false)
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleDelta = async (productId, productName) => {
    const delta = parseInt(deltaInputs[productId] || '0')
    if (isNaN(delta) || delta === 0) {
      notify('error', 'Entrez un delta non nul (ex: +10 ou -5)')
      return
    }
    setUpdating(productId)
    try {
      const res = await fetch('/api-stock-delta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(API_KEY + ':'),
        },
        body: JSON.stringify({ id_product: parseInt(productId), delta }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || `HTTP ${res.status}`)

      const newQty = data.new_quantity
      setStocks(prev => ({ ...prev, [productId]: newQty }))
      saveSnapshot(productId, newQty)
      setDeltaInputs(prev => ({ ...prev, [productId]: '' }))
      notify('success', `${productName} : stock mis à jour → ${newQty} unité(s)`)
    } catch (e) {
      notify('error', `Erreur : ${e.message}`)
    }
    setUpdating(null)
  }

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.reference.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <p className="text-slate-400 text-center mt-12">Chargement des stocks...</p>
  if (error) return <p className="text-red-400 text-center mt-12">Erreur : {error}</p>

  return (
    <div>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 px-5 py-3 rounded-xl text-sm font-medium shadow-xl z-50 transition-all ${
          notification.type === 'success'
            ? 'bg-emerald-800 text-emerald-200 border border-emerald-600'
            : 'bg-red-800 text-red-200 border border-red-600'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestion des stocks</h1>
          <p className="text-slate-400 text-sm mt-1">{products.length} produit(s) actif(s)</p>
        </div>
        <input
          type="text"
          placeholder="Rechercher par nom ou référence..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg px-4 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      {/* Tableau */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-950 text-slate-300 text-left">
              <th className="px-5 py-3 font-semibold">Produit</th>
              <th className="px-5 py-3 font-semibold">Référence</th>
              <th className="px-5 py-3 font-semibold text-right">Stock actuel</th>
              <th className="px-5 py-3 font-semibold">Ajouter / Retirer</th>
              <th className="px-5 py-3 font-semibold">Évolution</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => {
              const qty = stocks[p.id] ?? 0
              const isExpanded = selected === p.id
              return (
                <Fragment key={p.id}>
                  <tr
                    className={`border-b border-slate-700 ${i % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/50'}`}
                  >
                    <td className="px-5 py-4 text-white font-medium">{p.name}</td>
                    <td className="px-5 py-4 font-mono text-sky-400 text-xs">{p.reference}</td>
                    <td className="px-5 py-4 text-right">
                      <span className={`font-bold text-lg ${
                        qty <= 0 ? 'text-red-400' : qty <= 5 ? 'text-yellow-400' : 'text-emerald-400'
                      }`}>
                        {qty}
                      </span>
                      <span className="text-slate-500 text-xs ml-1">unité(s)</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={deltaInputs[p.id] || ''}
                          onChange={e => setDeltaInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                          placeholder="±"
                          className="w-20 bg-slate-900 border border-slate-600 text-white rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                        <button
                          onClick={() => handleDelta(p.id, p.name)}
                          disabled={updating === p.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors ${
                            updating === p.id
                              ? 'bg-slate-600 cursor-not-allowed'
                              : 'bg-sky-500 hover:bg-sky-600'
                          }`}
                        >
                          {updating === p.id ? '...' : 'Appliquer'}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelected(isExpanded ? null : p.id)}
                        className="text-xs text-slate-400 hover:text-sky-400 transition-colors border border-slate-700 hover:border-sky-500 rounded-lg px-3 py-1"
                      >
                        {isExpanded ? '▲ Masquer' : '📈 Voir'}
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`chart-${p.id}`} className="bg-slate-900/60 border-b border-slate-700">
                      <td colSpan={5} className="px-5 py-2">
                        <StockChart productId={p.id} currentQty={qty} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-slate-500 py-12">Aucun produit trouvé.</p>
        )}
      </div>

      <p className="text-slate-600 text-xs">
        💡 Entrez un nombre positif pour ajouter du stock, négatif pour en retirer. L'historique est conservé 30 jours.
      </p>
    </div>
  )
}
