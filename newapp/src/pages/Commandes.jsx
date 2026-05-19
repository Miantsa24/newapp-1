import { useState, useEffect } from 'react'
import { getOrders } from '../services/prestashopApi'

const ORDER_STATES = {
  '1': 'En attente', '2': 'Paiement accepté', '3': 'En préparation',
  '4': 'Expédié', '5': 'Livré', '6': 'Annulé', '7': 'Remboursé',
}

const STATE_COLORS = {
  '1': 'bg-yellow-900 text-yellow-400',
  '2': 'bg-emerald-900 text-emerald-400',
  '3': 'bg-blue-900 text-blue-400',
  '4': 'bg-indigo-900 text-indigo-400',
  '5': 'bg-green-900 text-green-400',
  '6': 'bg-red-900 text-red-400',
  '7': 'bg-purple-900 text-purple-400',
}

export default function Commandes() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getOrders()
      .then(doc => {
        const items = doc.querySelectorAll('orders > order')
        const list = Array.from(items).map(o => ({
          id: o.querySelector('id')?.textContent?.trim(),
          reference: o.querySelector('reference')?.textContent?.trim(),
          id_customer: o.querySelector('id_customer')?.textContent?.trim(),
          total_paid: parseFloat(o.querySelector('total_paid')?.textContent?.trim() || 0).toFixed(2),
          current_state: o.querySelector('current_state')?.textContent?.trim(),
          payment: o.querySelector('payment')?.textContent?.trim(),
          date_add: o.querySelector('date_add')?.textContent?.trim(),
        }))
        setOrders(list)
        setLoading(false)
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  const filtered = orders.filter(o =>
    o.reference?.toLowerCase().includes(search.toLowerCase()) ||
    o.id_customer?.includes(search)
  )

  if (loading) return <p className="text-slate-400 mt-8 text-center">Chargement des commandes...</p>
  if (error) return <p className="text-red-400 mt-8 text-center">Erreur : {error}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">
          Commandes
          <span className="ml-2 text-sm font-normal text-slate-400">({orders.length})</span>
        </h1>
        <input
          type="text"
          placeholder="Rechercher par référence..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg px-4 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-950 text-slate-300 text-left">
              <th className="px-5 py-3 font-semibold">ID</th>
              <th className="px-5 py-3 font-semibold">Référence</th>
              <th className="px-5 py-3 font-semibold">Client ID</th>
              <th className="px-5 py-3 font-semibold">Total</th>
              <th className="px-5 py-3 font-semibold">Paiement</th>
              <th className="px-5 py-3 font-semibold">Date</th>
              <th className="px-5 py-3 font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o, i) => (
              <tr key={o.id} className={`border-b border-slate-700 hover:bg-slate-700 transition-colors ${i % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/50'}`}>
                <td className="px-5 py-3 text-slate-400">{o.id}</td>
                <td className="px-5 py-3 font-mono font-bold text-sky-400">{o.reference}</td>
                <td className="px-5 py-3 text-slate-300">{o.id_customer}</td>
                <td className="px-5 py-3 font-bold text-white">{o.total_paid} €</td>
                <td className="px-5 py-3 text-slate-300">{o.payment}</td>
                <td className="px-5 py-3 text-slate-400">{o.date_add?.split(' ')[0]}</td>
                <td className="px-5 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATE_COLORS[o.current_state] || 'bg-slate-700 text-slate-400'}`}>
                    {ORDER_STATES[o.current_state] || 'Inconnu'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-slate-500 py-12">Aucune commande trouvée.</p>
        )}
      </div>
    </div>
  )
}