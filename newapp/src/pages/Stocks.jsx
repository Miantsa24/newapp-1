import { useState, useEffect } from 'react'
import { getStockAvailables } from '../services/prestashopApi'

export default function Stocks() {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    getStockAvailables()
      .then(doc => {
        const items = doc.querySelectorAll('stock_availables > stock_available')
        const list = Array.from(items).map(s => ({
          id: s.querySelector('id')?.textContent?.trim(),
          id_product: s.querySelector('id_product')?.textContent?.trim(),
          id_product_attribute: s.querySelector('id_product_attribute')?.textContent?.trim(),
          quantity: parseInt(s.querySelector('quantity')?.textContent?.trim() || '0'),
        })).filter(s => s.id)
        setStocks(list)
        setLoading(false)
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  const filtered = stocks.filter(s => {
    if (filter === 'instock') return s.quantity > 0
    if (filter === 'outofstock') return s.quantity <= 0
    return true
  })

  const totalStock = stocks.reduce((sum, s) => sum + s.quantity, 0)
  const outOfStock = stocks.filter(s => s.quantity <= 0).length
  const lowStock = stocks.filter(s => s.quantity > 0 && s.quantity <= 5).length

  if (loading) return <p className="text-slate-400 mt-8 text-center">Chargement des stocks...</p>
  if (error) return <p className="text-red-400 mt-8 text-center">Erreur : {error}</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Stocks</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 border-t-4 border-t-blue-500">
          <p className="text-slate-400 text-sm">Total unités</p>
          <p className="text-3xl font-bold text-white mt-1">{totalStock}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 border-t-4 border-t-red-500">
          <p className="text-slate-400 text-sm">Ruptures de stock</p>
          <p className="text-3xl font-bold text-red-400 mt-1">{outOfStock}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 border-t-4 border-t-yellow-500">
          <p className="text-slate-400 text-sm">Stock faible (≤ 5)</p>
          <p className="text-3xl font-bold text-yellow-400 mt-1">{lowStock}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: 'Tous' },
          { key: 'instock', label: 'En stock' },
          { key: 'outofstock', label: 'Rupture' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f.key ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-950 text-slate-300 text-left">
              <th className="px-5 py-3 font-semibold">ID Stock</th>
              <th className="px-5 py-3 font-semibold">Produit ID</th>
              <th className="px-5 py-3 font-semibold">Variante ID</th>
              <th className="px-5 py-3 font-semibold">Quantité</th>
              <th className="px-5 py-3 font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id} className={`border-b border-slate-700 hover:bg-slate-700 transition-colors ${i % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/50'}`}>
                <td className="px-5 py-3 text-slate-400">{s.id}</td>
                <td className="px-5 py-3 text-slate-300">#{s.id_product}</td>
                <td className="px-5 py-3 text-slate-400">{s.id_product_attribute === '0' ? '—' : `#${s.id_product_attribute}`}</td>
                <td className="px-5 py-3">
                  <span className={`font-bold ${s.quantity <= 0 ? 'text-red-400' : s.quantity <= 5 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                    {s.quantity}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${s.quantity <= 0 ? 'bg-red-900 text-red-400' : s.quantity <= 5 ? 'bg-yellow-900 text-yellow-400' : 'bg-emerald-900 text-emerald-400'}`}>
                    {s.quantity <= 0 ? 'Rupture' : s.quantity <= 5 ? 'Stock faible' : 'En stock'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-slate-500 py-12">Aucun stock trouvé.</p>}
      </div>
    </div>
  )
}