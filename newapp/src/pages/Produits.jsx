import { useState, useEffect } from 'react'
import { getProducts } from '../services/prestashopApi'

export default function Produits() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getProducts()
        .then(doc => {
        const items = doc.querySelectorAll('products > product')
        const list = Array.from(items)
            .map(p => ({
            id: p.querySelector('id')?.textContent?.trim(),
            name: p.querySelector('name language')?.textContent?.trim() || 'Sans nom',
            price: parseFloat(p.querySelector('price')?.textContent?.trim() || 0).toFixed(2),
            reference: p.querySelector('reference')?.textContent?.trim() || '—',
            active: p.querySelector('active')?.textContent?.trim(),
            quantity: p.querySelector('quantity')?.textContent?.trim() || '0',
            }))
            .filter(p => p.id)
            setProducts(list)
            setLoading(false)
        })
        .catch(err => { setError(err.message); setLoading(false) })
    }, [])

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.reference?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <p className="text-slate-400 mt-8 text-center">Chargement des produits...</p>
  if (error) return <p className="text-red-400 mt-8 text-center">Erreur : {error}</p>

  return (
    <div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">
          Produits
          <span className="ml-2 text-sm font-normal text-slate-400">({products.length})</span>
        </h1>
        <input
          type="text"
          placeholder="Rechercher par nom ou référence..."
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
              <th className="px-5 py-3 font-semibold">Nom</th>
              <th className="px-5 py-3 font-semibold">Prix</th>
              <th className="px-5 py-3 font-semibold">Stock</th>
              <th className="px-5 py-3 font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} className={`border-b border-slate-700 hover:bg-slate-700 transition-colors ${i % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/50'}`}>
                <td className="px-5 py-3 text-slate-400">{p.id}</td>
                <td className="px-5 py-3 font-mono text-slate-300">{p.reference}</td>
                <td className="px-5 py-3 font-medium text-white">{p.name}</td>
                <td className="px-5 py-3 font-semibold text-slate-200">{p.price} €</td>
                <td className="px-5 py-3 text-slate-300">{p.quantity}</td>
                <td className="px-5 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    p.active === '1'
                      ? 'bg-emerald-900 text-emerald-400'
                      : 'bg-red-900 text-red-400'
                  }`}>
                    {p.active === '1' ? 'Actif' : 'Inactif'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-slate-500 py-12">Aucun produit trouvé.</p>
        )}
      </div>
    </div>
  )
}