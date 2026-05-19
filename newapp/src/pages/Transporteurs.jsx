import { useState, useEffect } from 'react'
import { getCarriers } from '../services/prestashopApi'

export default function Transporteurs() {
  const [carriers, setCarriers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getCarriers()
      .then(doc => {
        const items = doc.querySelectorAll('carriers > carrier')
        const list = Array.from(items).map(c => ({
          id: c.querySelector('id')?.textContent?.trim(),
          name: c.querySelector('name')?.textContent?.trim() || 'Sans nom',
          delay: c.querySelector('delay language')?.textContent?.trim() || '—',
          active: c.querySelector('active')?.textContent?.trim(),
          is_free: c.querySelector('is_free')?.textContent?.trim(),
          shipping_handling: c.querySelector('shipping_handling')?.textContent?.trim(),
          max_weight: c.querySelector('max_weight')?.textContent?.trim(),
          grade: c.querySelector('grade')?.textContent?.trim(),
        })).filter(c => c.id)
        setCarriers(list)
        setLoading(false)
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  const filtered = carriers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <p className="text-slate-400 mt-8 text-center">Chargement des transporteurs...</p>
  if (error) return <p className="text-red-400 mt-8 text-center">Erreur : {error}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">
          Transporteurs
          <span className="ml-2 text-sm font-normal text-slate-400">({carriers.length})</span>
        </h1>
        <input
          type="text"
          placeholder="Rechercher un transporteur..."
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
              <th className="px-5 py-3 font-semibold">Délai</th>
              <th className="px-5 py-3 font-semibold">Poids max</th>
              <th className="px-5 py-3 font-semibold">Gratuit</th>
              <th className="px-5 py-3 font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c.id} className={`border-b border-slate-700 hover:bg-slate-700 transition-colors ${i % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/50'}`}>
                <td className="px-5 py-3 text-slate-400">{c.id}</td>
                <td className="px-5 py-3 font-medium text-white">{c.name}</td>
                <td className="px-5 py-3 text-slate-300">{c.delay}</td>
                <td className="px-5 py-3 text-slate-300">{c.max_weight > 0 ? `${c.max_weight} kg` : '—'}</td>
                <td className="px-5 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${c.is_free === '1' ? 'bg-emerald-900 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                    {c.is_free === '1' ? 'Gratuit' : 'Payant'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${c.active === '1' ? 'bg-emerald-900 text-emerald-400' : 'bg-red-900 text-red-400'}`}>
                    {c.active === '1' ? 'Actif' : 'Inactif'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-slate-500 py-12">Aucun transporteur trouvé.</p>}
      </div>
    </div>
  )
}