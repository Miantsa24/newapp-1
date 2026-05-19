import { useState, useEffect } from 'react'
import { getCategories } from '../services/prestashopApi'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getCategories()
      .then(doc => {
        const items = doc.querySelectorAll('categories > category')
        const list = Array.from(items).map(c => ({
          id: c.querySelector('id')?.textContent?.trim(),
          name: c.querySelector('name language')?.textContent?.trim() || 'Sans nom',
          active: c.querySelector('active')?.textContent?.trim(),
          level_depth: c.querySelector('level_depth')?.textContent?.trim(),
          nb_products_recursive: c.querySelector('nb_products_recursive')?.textContent?.trim() || '0',
          date_add: c.querySelector('date_add')?.textContent?.trim(),
        })).filter(c => c.id)
        setCategories(list)
        setLoading(false)
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <p className="text-slate-400 mt-8 text-center">Chargement des catégories...</p>
  if (error) return <p className="text-red-400 mt-8 text-center">Erreur : {error}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">
          Catégories
          <span className="ml-2 text-sm font-normal text-slate-400">({categories.length})</span>
        </h1>
        <input
          type="text"
          placeholder="Rechercher une catégorie..."
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
              <th className="px-5 py-3 font-semibold">Niveau</th>
              <th className="px-5 py-3 font-semibold">Produits</th>
              <th className="px-5 py-3 font-semibold">Date création</th>
              <th className="px-5 py-3 font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c.id} className={`border-b border-slate-700 hover:bg-slate-700 transition-colors ${i % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/50'}`}>
                <td className="px-5 py-3 text-slate-400">{c.id}</td>
                <td className="px-5 py-3 font-medium text-white">{c.name}</td>
                <td className="px-5 py-3 text-slate-300">
                  <span className="bg-slate-700 px-2 py-0.5 rounded text-xs">Niveau {c.level_depth}</span>
                </td>
                <td className="px-5 py-3 text-slate-300">{c.nb_products_recursive}</td>
                <td className="px-5 py-3 text-slate-400">{c.date_add?.split(' ')[0]}</td>
                <td className="px-5 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${c.active === '1' ? 'bg-emerald-900 text-emerald-400' : 'bg-red-900 text-red-400'}`}>
                    {c.active === '1' ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-slate-500 py-12">Aucune catégorie trouvée.</p>}
      </div>
    </div>
  )
}