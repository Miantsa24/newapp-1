import { useState, useEffect } from 'react'
import { getTaxes } from '../services/prestashopApi'

export default function Taxes() {
  const [taxes, setTaxes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getTaxes()
      .then(doc => {
        const items = doc.querySelectorAll('taxes > tax')
        const list = Array.from(items).map(t => ({
          id: t.querySelector('id')?.textContent?.trim(),
          name: t.querySelector('name language')?.textContent?.trim() || 'Sans nom',
          rate: parseFloat(t.querySelector('rate')?.textContent?.trim() || 0).toFixed(2),
          active: t.querySelector('active')?.textContent?.trim(),
        })).filter(t => t.id)
        setTaxes(list)
        setLoading(false)
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  if (loading) return <p className="text-slate-400 mt-8 text-center">Chargement des taxes...</p>
  if (error) return <p className="text-red-400 mt-8 text-center">Erreur : {error}</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">
        Taxes
        <span className="ml-2 text-sm font-normal text-slate-400">({taxes.length})</span>
      </h1>

      <div className="grid grid-cols-3 gap-4">
        {taxes.map(t => (
          <div key={t.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-500 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-lg">💶</div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.active === '1' ? 'bg-emerald-900 text-emerald-400' : 'bg-red-900 text-red-400'}`}>
                {t.active === '1' ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-white font-semibold">{t.name}</p>
            <p className="text-2xl font-bold text-amber-400 mt-2">{t.rate}%</p>
            <p className="text-slate-500 text-xs mt-1">ID : {t.id}</p>
          </div>
        ))}
        {taxes.length === 0 && <p className="text-slate-500 col-span-3 text-center py-12">Aucune taxe trouvée.</p>}
      </div>
    </div>
  )
}