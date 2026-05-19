import { useState } from 'react'
import { getAllIds, getCategoryIdsForDelete, del } from '../../services/prestashopApi'

const API_KEY = 'GFCDP1I7CKYKMVVN4QMGX81X4MCDMYPL'

const callPhpDelete = async (endpoint, label) => {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(API_KEY + ':'),
    },
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`${label} ${res.status} — ${txt}`)
  }
  const data = await res.json()
  return data.deleted ?? 0
}

const MODULES = [
  {
    key: 'products',
    label: 'Produits',
    icon: '📦',
    color: 'border-red-700',
    btnColor: 'bg-red-600 hover:bg-red-700',
    description: 'Supprime tous les produits, stocks et variantes',
  },
  {
    key: 'customers',
    label: 'Clients',
    icon: '👥',
    color: 'border-orange-700',
    btnColor: 'bg-orange-600 hover:bg-orange-700',
    description: 'Supprime tous les clients',
  },
  {
    key: 'categories',
    label: 'Catégories',
    icon: '🗂️',
    color: 'border-violet-700',
    btnColor: 'bg-violet-600 hover:bg-violet-700',
    description: 'Supprime toutes les catégories sauf la racine',
  },
  {
    key: 'orders',
    label: 'Commandes',
    icon: '🛒',
    color: 'border-purple-700',
    btnColor: 'bg-purple-600 hover:bg-purple-700',
    description: 'Supprime toutes les commandes',
  },
]

export default function BackofficeReinit() {
  const [confirm, setConfirm] = useState(null)
  const [loading, setLoading] = useState(null)
  const [results, setResults] = useState({})

  const handleReset = async (mod) => {
    setLoading(mod.key)
    setConfirm(null)

    try {
      // Commandes, clients, produits : PS WS est trop restrictif → PHP direct
      const phpRoutes = {
        orders:    { endpoint: '/api-delete-orders',    label: 'supprimée(s)' },
        customers: { endpoint: '/api-delete-customers', label: 'supprimé(s)'  },
        products:  { endpoint: '/api-delete-products',  label: 'supprimé(s)'  },
      }
      if (phpRoutes[mod.key]) {
        const { endpoint, label } = phpRoutes[mod.key]
        const deleted = await callPhpDelete(endpoint, `delete_${mod.key}.php`)
        setResults(prev => ({ ...prev, [mod.key]: { type: 'success', message: `${deleted} ${label}` } }))
        setLoading(null)
        return
      }

      const ids = mod.key === 'categories'
        ? await getCategoryIdsForDelete()
        : await getAllIds(mod.key)

      let deleted = 0
      let failed = 0
      for (const id of ids) {
        try {
          await del(`/${mod.key}/${id}`)
          deleted++
        } catch {
          failed++
        }
      }

      setResults(prev => ({
        ...prev,
        [mod.key]: {
          type: failed > 0 ? 'error' : 'success',
          message: `${deleted} supprimé(s)${failed > 0 ? `, ${failed} échec(s)` : ''}`
        }
      }))
    } catch (err) {
      setResults(prev => ({
        ...prev,
        [mod.key]: { type: 'error', message: err.message }
      }))
    }
    setLoading(null)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Réinitialisation des données</h1>
      <div className="flex items-center gap-2 bg-yellow-900/30 border border-yellow-700/50 text-yellow-400 text-sm px-4 py-3 rounded-lg mb-8">
        ⚠️ Ces actions sont irréversibles. Les données supprimées ne pourront pas être récupérées.
      </div>

      <div className="grid grid-cols-2 gap-4">
        {MODULES.map(mod => (
          <div key={mod.key} className={`bg-slate-800 rounded-xl border-2 border-slate-700 p-6 transition-all ${results[mod.key]?.type === 'success' ? mod.color : ''}`}>
            <div className="flex items-start gap-4 mb-4">
              <span className="text-3xl">{mod.icon}</span>
              <div>
                <h3 className="text-white font-semibold">{mod.label}</h3>
                <p className="text-slate-400 text-sm mt-0.5">{mod.description}</p>
              </div>
            </div>

            {results[mod.key] && (
              <div className={`px-4 py-2.5 rounded-lg text-sm font-medium mb-4 ${
                results[mod.key].type === 'success'
                  ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-700'
                  : 'bg-red-900/50 text-red-400 border border-red-700'
              }`}>
                {results[mod.key].type === 'success' ? '✅' : '❌'} {results[mod.key].message}
              </div>
            )}

            {confirm === mod.key ? (
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-sm">Confirmer ?</span>
                <button
                  onClick={() => handleReset(mod)}
                  className={`px-4 py-2 rounded-lg text-white text-sm font-semibold ${mod.btnColor} transition-colors`}
                >
                  Oui, supprimer
                </button>
                <button
                  onClick={() => setConfirm(null)}
                  className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition-colors"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirm(mod.key)}
                disabled={loading === mod.key}
                className={`w-full py-2.5 rounded-lg text-white text-sm font-semibold transition-colors ${
                  loading === mod.key
                    ? 'bg-slate-600 cursor-not-allowed'
                    : mod.btnColor
                }`}
              >
                {loading === mod.key ? 'Suppression...' : `Réinitialiser ${mod.label}`}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}