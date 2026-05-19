import { useState, useEffect } from 'react'
import { getManufacturers } from '../services/prestashopApi'

export default function Marques() {
  const [marques, setMarques] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getManufacturers()
      .then(doc => {
        const items = doc.querySelectorAll('manufacturers > manufacturer')
        const list = Array.from(items).map(m => ({
          id: m.querySelector('id')?.textContent?.trim(),
          name: m.querySelector('name')?.textContent?.trim() || 'Sans nom',
          active: m.querySelector('active')?.textContent?.trim(),
          date_add: m.querySelector('date_add')?.textContent?.trim(),
        })).filter(m => m.id)
        setMarques(list)
        setLoading(false)
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  const filtered = marques.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <p className="text-slate-400 mt-8 text-center">Chargement des marques...</p>
  if (error) return <p className="text-red-400 mt-8 text-center">Erreur : {error}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">
          Marques
          <span className="ml-2 text-sm font-normal text-slate-400">({marques.length})</span>
        </h1>
        <input
          type="text"
          placeholder="Rechercher une marque..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg px-4 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filtered.map(m => (
          <div key={m.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-500 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-lg">🏷️</div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.active === '1' ? 'bg-emerald-900 text-emerald-400' : 'bg-red-900 text-red-400'}`}>
                {m.active === '1' ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-white font-semibold">{m.name}</p>
            <p className="text-slate-500 text-xs mt-1">ID : {m.id}</p>
            <p className="text-slate-500 text-xs">Créé le {m.date_add?.split(' ')[0]}</p>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-slate-500 col-span-3 text-center py-12">Aucune marque trouvée.</p>}
      </div>
    </div>
  )
}