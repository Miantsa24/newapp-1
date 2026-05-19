import { useState, useEffect } from 'react'
import { getSuppliers } from '../services/prestashopApi'

export default function Fournisseurs() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getSuppliers()
      .then(doc => {
        const items = doc.querySelectorAll('suppliers > supplier')
        const list = Array.from(items).map(s => ({
          id: s.querySelector('id')?.textContent?.trim(),
          name: s.querySelector('name')?.textContent?.trim() || 'Sans nom',
          active: s.querySelector('active')?.textContent?.trim(),
          date_add: s.querySelector('date_add')?.textContent?.trim(),
        })).filter(s => s.id)
        setSuppliers(list)
        setLoading(false)
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <p className="text-slate-400 mt-8 text-center">Chargement des fournisseurs...</p>
  if (error) return <p className="text-red-400 mt-8 text-center">Erreur : {error}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">
          Fournisseurs
          <span className="ml-2 text-sm font-normal text-slate-400">({suppliers.length})</span>
        </h1>
        <input
          type="text"
          placeholder="Rechercher un fournisseur..."
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
              <th className="px-5 py-3 font-semibold">Date création</th>
              <th className="px-5 py-3 font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id} className={`border-b border-slate-700 hover:bg-slate-700 transition-colors ${i % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/50'}`}>
                <td className="px-5 py-3 text-slate-400">{s.id}</td>
                <td className="px-5 py-3 font-medium text-white">{s.name}</td>
                <td className="px-5 py-3 text-slate-400">{s.date_add?.split(' ')[0]}</td>
                <td className="px-5 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${s.active === '1' ? 'bg-emerald-900 text-emerald-400' : 'bg-red-900 text-red-400'}`}>
                    {s.active === '1' ? 'Actif' : 'Inactif'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-slate-500 py-12">Aucun fournisseur trouvé.</p>}
      </div>
    </div>
  )
}