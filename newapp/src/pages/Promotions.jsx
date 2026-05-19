import { useState, useEffect } from 'react'
import { getCartRules } from '../services/prestashopApi'

export default function Promotions() {
  const [promos, setPromos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getCartRules()
      .then(doc => {
        const items = doc.querySelectorAll('cart_rules > cart_rule')
        const list = Array.from(items).map(p => ({
          id: p.querySelector('id')?.textContent?.trim(),
          name: p.querySelector('name language')?.textContent?.trim() || 'Sans nom',
          code: p.querySelector('code')?.textContent?.trim() || '—',
          reduction_percent: p.querySelector('reduction_percent')?.textContent?.trim(),
          reduction_amount: p.querySelector('reduction_amount')?.textContent?.trim(),
          active: p.querySelector('active')?.textContent?.trim(),
          date_from: p.querySelector('date_from')?.textContent?.trim(),
          date_to: p.querySelector('date_to')?.textContent?.trim(),
          quantity: p.querySelector('quantity')?.textContent?.trim(),
        })).filter(p => p.id)
        setPromos(list)
        setLoading(false)
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  const filtered = promos.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <p className="text-slate-400 mt-8 text-center">Chargement des promotions...</p>
  if (error) return <p className="text-red-400 mt-8 text-center">Erreur : {error}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">
          Promotions
          <span className="ml-2 text-sm font-normal text-slate-400">({promos.length})</span>
        </h1>
        <input
          type="text"
          placeholder="Rechercher par nom ou code..."
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
              <th className="px-5 py-3 font-semibold">Nom</th>
              <th className="px-5 py-3 font-semibold">Code</th>
              <th className="px-5 py-3 font-semibold">Réduction</th>
              <th className="px-5 py-3 font-semibold">Validité</th>
              <th className="px-5 py-3 font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => {
              const reduction = parseFloat(p.reduction_percent) > 0
                ? `${p.reduction_percent}%`
                : parseFloat(p.reduction_amount) > 0
                ? `${p.reduction_amount} €` : '—'
              return (
                <tr key={p.id} className={`border-b border-slate-700 hover:bg-slate-700 transition-colors ${i % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/50'}`}>
                  <td className="px-5 py-3 text-slate-400">{p.id}</td>
                  <td className="px-5 py-3 font-medium text-white">{p.name}</td>
                  <td className="px-5 py-3">
                    <span className="font-mono bg-slate-700 text-sky-400 px-2 py-0.5 rounded text-xs">{p.code}</span>
                  </td>
                  <td className="px-5 py-3 font-bold text-emerald-400">{reduction}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs">
                    {p.date_from?.split(' ')[0]} → {p.date_to?.split(' ')[0]}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${p.active === '1' ? 'bg-emerald-900 text-emerald-400' : 'bg-red-900 text-red-400'}`}>
                      {p.active === '1' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-slate-500 py-12">Aucune promotion trouvée.</p>}
      </div>
    </div>
  )
}