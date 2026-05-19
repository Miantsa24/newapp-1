import { useState, useEffect } from 'react'
import { getOrders, getCustomers, getOrderStates, changeOrderStatePS } from '../../services/prestashopApi'

// State IDs → display color
const STATE_COLORS = {
  '1': 'bg-yellow-900 text-yellow-400',
  '2': 'bg-emerald-900 text-emerald-400',
  '3': 'bg-blue-900 text-blue-400',
  '4': 'bg-indigo-900 text-indigo-400',
  '5': 'bg-green-900 text-green-400',
  '6': 'bg-red-900 text-red-400',
  '7': 'bg-purple-900 text-purple-400',
  '8': 'bg-rose-900 text-rose-400',
  '9': 'bg-sky-900 text-sky-400',
  '10': 'bg-teal-900 text-teal-400',
  '11': 'bg-orange-900 text-orange-400',
  '12': 'bg-pink-900 text-pink-400',
}

// 4 états : Panier(1) → Paiement(2) → Livré(5) | Annulé(6)
// Livré (logable=1) déclenche le mouvement de stock dans PS.
const TRANSITION_TARGETS = {
  '1': ['2', '6'],
  '2': ['5', '6'],
  '5': [],
  '6': [],
}

const TRANSITION_UI = {
  '2': { label: '💳 Confirmer paiement', color: 'bg-emerald-600 hover:bg-emerald-700' },
  '5': { label: '📦 Livrer',             color: 'bg-blue-600 hover:bg-blue-700'    },
  '6': { label: '❌ Annuler',            color: 'bg-red-600 hover:bg-red-700'      },
}

const DISPLAY_LABEL = {
  '1': 'Dans le panier',
  '2': 'Paiement effectué',
  '5': 'Livré',
  '6': 'Annulé',
}
const getLabel = (id, psStates) => DISPLAY_LABEL[id] || psStates[id] || `État ${id}`

export default function BackofficeCommandes() {
  const [orders, setOrders]       = useState([])
  const [customers, setCustomers] = useState({})
  const [psStates, setPsStates]   = useState({}) // id → label (from PS WS)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [search, setSearch]       = useState('')
  const [filterState, setFilterState] = useState('all')
  const [updating, setUpdating]   = useState(null)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    Promise.all([getOrders(), getCustomers(), getOrderStates()])
      .then(([ordDoc, custDoc, statesDoc]) => {
        // Build PS state label map
        const stateMap = {}
        Array.from(statesDoc.querySelectorAll('order_states > order_state')).forEach(s => {
          const id   = s.querySelector('id')?.textContent?.trim()
          const name = s.querySelector('name language')?.textContent?.trim()
          if (id) stateMap[id] = name || `État ${id}`
        })
        setPsStates(stateMap)

        // Build customer map
        const custMap = {}
        Array.from(custDoc.querySelectorAll('customers > customer')).forEach(c => {
          const id = c.querySelector('id')?.textContent?.trim()
          custMap[id] = {
            firstname: c.querySelector('firstname')?.textContent?.trim(),
            lastname:  c.querySelector('lastname')?.textContent?.trim(),
            email:     c.querySelector('email')?.textContent?.trim(),
          }
        })
        setCustomers(custMap)

        // Build orders list
        const list = Array.from(ordDoc.querySelectorAll('orders > order')).map(o => ({
          id:            o.querySelector('id')?.textContent?.trim(),
          reference:     o.querySelector('reference')?.textContent?.trim(),
          id_customer:   o.querySelector('id_customer')?.textContent?.trim(),
          total_paid:    parseFloat(o.querySelector('total_paid')?.textContent?.trim() || 0).toFixed(2),
          current_state: o.querySelector('current_state')?.textContent?.trim(),
          payment:       o.querySelector('payment')?.textContent?.trim(),
          date_add:      o.querySelector('date_add')?.textContent?.trim(),
        }))
        setOrders(list)
        setLoading(false)
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  const showNotif = (type, message) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 4000)
  }

  const handleStateChange = async (orderId, targetStateId) => {
    const stateLabel = psStates[targetStateId]
    if (!stateLabel) { showNotif('error', `État ${targetStateId} inconnu dans PS`); return }
    setUpdating(orderId)
    try {
      await changeOrderStatePS(orderId, stateLabel)
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, current_state: targetStateId } : o
      ))
      showNotif('success', `Commande → ${getLabel(targetStateId, psStates)}`)
    } catch (err) {
      showNotif('error', `Erreur : ${err.message}`)
    }
    setUpdating(null)
  }

  const filtered = orders.filter(o => {
    const cust = customers[o.id_customer]
    const matchSearch =
      o.reference?.toLowerCase().includes(search.toLowerCase()) ||
      cust?.lastname?.toLowerCase().includes(search.toLowerCase()) ||
      cust?.email?.toLowerCase().includes(search.toLowerCase())
    const matchState = filterState === 'all' || o.current_state === filterState
    return matchSearch && matchState
  })

  // States that actually appear in order list (for filter buttons)
  const activeStateIds = [...new Set(orders.map(o => o.current_state))].filter(Boolean)

  if (loading) return <p className="text-slate-400 mt-8 text-center">Chargement des commandes...</p>
  if (error)   return <p className="text-red-400 mt-8 text-center">Erreur : {error}</p>

  return (
    <div>
      {/* Notification toast */}
      {notification && (
        <div className={`fixed top-6 right-6 px-5 py-3 rounded-xl text-sm font-medium shadow-xl z-50 transition-all ${
          notification.type === 'success'
            ? 'bg-emerald-800 text-emerald-200 border border-emerald-600'
            : 'bg-red-800 text-red-200 border border-red-600'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">
          Commandes
          <span className="ml-2 text-sm font-normal text-slate-400">({orders.length})</span>
        </h1>
        <input
          type="text"
          placeholder="Rechercher par référence ou client..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg px-4 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      {/* Filtres par état */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilterState('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filterState === 'all' ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
          }`}
        >
          Tous ({orders.length})
        </button>
        {activeStateIds.map(id => {
          const count = orders.filter(o => o.current_state === id).length
          return (
            <button key={id} onClick={() => setFilterState(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterState === id ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              {getLabel(id, psStates)} ({count})
            </button>
          )
        })}
      </div>

      {/* Tableau */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-950 text-slate-300 text-left">
              <th className="px-5 py-3 font-semibold">Référence</th>
              <th className="px-5 py-3 font-semibold">Client</th>
              <th className="px-5 py-3 font-semibold">Total</th>
              <th className="px-5 py-3 font-semibold">Date</th>
              <th className="px-5 py-3 font-semibold">Statut</th>
              <th className="px-5 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o, i) => {
              const customer    = customers[o.id_customer]
              const targetIds   = TRANSITION_TARGETS[o.current_state] || []
              return (
                <tr key={o.id} className={`border-b border-slate-700 ${i % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/50'}`}>
                  <td className="px-5 py-4 font-mono font-bold text-sky-400">{o.reference}</td>
                  <td className="px-5 py-4">
                    {customer ? (
                      <div>
                        <p className="text-white font-medium">{customer.firstname} {customer.lastname}</p>
                        <p className="text-slate-500 text-xs">{customer.email}</p>
                      </div>
                    ) : (
                      <span className="text-slate-500">Client #{o.id_customer}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 font-bold text-white">{o.total_paid} €</td>
                  <td className="px-5 py-4 text-slate-400 text-xs">{o.date_add?.split(' ')[0]}</td>
                  <td className="px-5 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATE_COLORS[o.current_state] || 'bg-slate-700 text-slate-400'}`}>
                      {getLabel(o.current_state, psStates)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {updating === o.id ? (
                      <span className="text-slate-400 text-xs animate-pulse">Mise à jour...</span>
                    ) : targetIds.length > 0 ? (
                      <div className="flex gap-2 flex-wrap">
                        {targetIds.map(tid => {
                          const ui = TRANSITION_UI[tid]
                          if (!ui) return null
                          return (
                            <button key={tid}
                              onClick={() => handleStateChange(o.id, tid)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors ${ui.color}`}
                            >
                              {ui.label}
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <span className="text-slate-600 text-xs italic">Terminal</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-slate-500 py-12">Aucune commande trouvée.</p>
        )}
      </div>
    </div>
  )
}
