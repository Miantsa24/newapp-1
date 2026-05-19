import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrders, getOrderStates, changeOrderStatePS } from '../../services/prestashopApi'
import FrontofficeLayout from '../../components/FrontofficeLayout'
import { useAuth } from '../../context/AuthContext'

// ── 4 états utilisés dans ce projet ──────────────────────────────────────────
const ORDER_STATES = {
  '1': 'Dans le panier',
  '2': 'Paiement effectué',
  '5': 'Livré',
  '6': 'Annulé',
}

const STATE_COLORS = {
  '1': 'bg-yellow-900/50 text-yellow-400 border-yellow-700',
  '2': 'bg-emerald-900/50 text-emerald-400 border-emerald-700',
  '5': 'bg-blue-900/50 text-blue-400 border-blue-700',
  '6': 'bg-red-900/50 text-red-400 border-red-700',
}

const STATE_ICONS = {
  '1': '🛒', '2': '💳', '5': '📦', '6': '❌',
}

// Timeline linéaire : Panier → Paiement → Livré
const TIMELINE = [
  { state: '1', label: 'Panier' },
  { state: '2', label: 'Paiement effectué' },
  { state: '5', label: 'Livré' },
]

// Transitions disponibles par état
const TRANSITIONS = {
  '1': [{ target: '2', icon: '💳', text: 'Confirmer mon paiement', style: 'bg-sky-600 hover:bg-sky-500' }],
  '2': [
    { target: '5', icon: '📦', text: "J'ai reçu ma commande",  style: 'bg-emerald-600 hover:bg-emerald-500' },
    { target: '6', icon: '❌', text: 'Annuler la commande',     style: 'bg-red-700 hover:bg-red-600' },
  ],
}

export default function MesCommandes() {
  const [orders, setOrders]     = useState([])
  const [psStates, setPsStates] = useState({})   // id → label PS (pour changeOrderStatePS)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [selected, setSelected] = useState(null)
  const [advancing, setAdvancing] = useState(null)
  const [notification, setNotification] = useState(null)
  const navigate = useNavigate()
  const { customer } = useAuth()

  useEffect(() => {
    if (!customer?.id) { setOrders([]); setLoading(false); return }

    Promise.all([getOrders(), getOrderStates()])
      .then(([ordDoc, statesDoc]) => {
        // Map id → label PS (nécessaire pour change_state.php)
        const stateMap = {}
        Array.from(statesDoc.querySelectorAll('order_states > order_state')).forEach(s => {
          const id   = s.querySelector('id')?.textContent?.trim()
          const name = s.querySelector('name language')?.textContent?.trim()
          if (id) stateMap[id] = name || `État ${id}`
        })
        setPsStates(stateMap)

        const list = Array.from(ordDoc.querySelectorAll('orders > order')).map(o => ({
          id:            o.querySelector('id')?.textContent?.trim(),
          reference:     o.querySelector('reference')?.textContent?.trim(),
          id_customer:   o.querySelector('id_customer')?.textContent?.trim(),
          total_paid:    parseFloat(o.querySelector('total_paid')?.textContent?.trim() || 0).toFixed(2),
          current_state: o.querySelector('current_state')?.textContent?.trim(),
          payment:       o.querySelector('payment')?.textContent?.trim(),
          date_add:      o.querySelector('date_add')?.textContent?.trim(),
          rows: Array.from(o.querySelectorAll('order_row')).map(r => ({
            product_name:      r.querySelector('product_name')?.textContent?.trim(),
            product_reference: r.querySelector('product_reference')?.textContent?.trim(),
            product_quantity:  r.querySelector('product_quantity')?.textContent?.trim(),
            product_price:     parseFloat(r.querySelector('product_price')?.textContent?.trim() || 0).toFixed(2),
          }))
        }))
          .filter(o => o.id_customer === String(customer.id))
          .sort((a, b) => new Date(b.date_add) - new Date(a.date_add))

        setOrders(list)
        setLoading(false)
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [customer?.id])

  const showNotif = (type, msg) => {
    setNotification({ type, msg })
    setTimeout(() => setNotification(null), 3500)
  }

  const handleTransition = async (orderId, targetState) => {
    const stateLabel = psStates[targetState]
    if (!stateLabel) { showNotif('error', `État ${targetState} introuvable dans PS`); return }

    setAdvancing(orderId + '_' + targetState)
    try {
      await changeOrderStatePS(orderId, stateLabel)
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, current_state: targetState } : o
      ))
      showNotif('success', `Commande : ${ORDER_STATES[targetState] || stateLabel}`)
    } catch (err) {
      showNotif('error', `Erreur : ${err.message}`)
    }
    setAdvancing(null)
  }

  // Index dans TIMELINE (-1 si annulé)
  const timelineIndex = (state) => TIMELINE.findIndex(s => s.state === state)

  if (loading) return (
    <FrontofficeLayout>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-slate-800 rounded-xl h-28 animate-pulse" />
        ))}
      </div>
    </FrontofficeLayout>
  )

  if (error) return (
    <FrontofficeLayout>
      <p className="text-red-400 text-center py-16">Erreur : {error}</p>
    </FrontofficeLayout>
  )

  return (
    <FrontofficeLayout>
      {/* Toast notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-xl transition-all ${
          notification.type === 'success'
            ? 'bg-emerald-800 text-emerald-200 border border-emerald-600'
            : 'bg-red-800 text-red-200 border border-red-600'
        }`}>
          {notification.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">
          Mes commandes
          <span className="ml-2 text-sm font-normal text-slate-400">({orders.length})</span>
        </h1>
        <button
          onClick={() => navigate('/')}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          ← Continuer mes achats
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-6xl mb-6">📦</p>
          <h2 className="text-xl font-bold text-white mb-3">Aucune commande pour ce compte</h2>
          <p className="text-slate-400 mb-8">
            Si vous venez d'importer des commandes, connectez-vous avec le même email, puis revenez ici.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold transition-colors"
          >
            Découvrir nos produits
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const isSelected   = selected === order.id
            const isCanceled   = order.current_state === '6'
            const tIdx         = timelineIndex(order.current_state)
            const transitions  = TRANSITIONS[order.current_state] || []

            return (
              <div key={order.id}
                className={`bg-slate-800 border rounded-xl overflow-hidden transition-all ${
                  isSelected ? 'border-sky-500' : 'border-slate-700'
                }`}
              >
                {/* ── Header ── */}
                <div
                  className="p-5 cursor-pointer hover:bg-slate-700/50 transition-colors"
                  onClick={() => setSelected(isSelected ? null : order.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sky-400">{order.reference}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          STATE_COLORS[order.current_state] || 'bg-slate-700 text-slate-400 border-slate-600'
                        }`}>
                          {STATE_ICONS[order.current_state]} {ORDER_STATES[order.current_state] || `État ${order.current_state}`}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs mt-1">
                        {order.date_add?.split(' ')[0]} — {order.rows?.length || 0} article(s)
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-white font-bold text-lg">{order.total_paid} €</p>
                        <p className="text-slate-400 text-xs">{order.payment}</p>
                      </div>
                      <span className={`text-slate-400 transition-transform ${isSelected ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                  </div>

                  {/* ── Timeline ── */}
                  {!isCanceled && (
                    <div className="mt-4 flex items-center">
                      {TIMELINE.map((step, i) => {
                        const isDone    = tIdx >= 0 && i <= tIdx
                        const isCurrent = i === tIdx
                        return (
                          <div key={step.state} className="flex items-center flex-1">
                            <div className="flex flex-col items-center">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                                isDone
                                  ? 'bg-sky-500 border-sky-500 text-white'
                                  : 'bg-slate-700 border-slate-600 text-slate-500'
                              } ${isCurrent ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-800' : ''}`}>
                                {isDone ? '✓' : i + 1}
                              </div>
                              <span className={`text-xs mt-1 text-center w-20 leading-tight ${
                                isDone ? 'text-sky-400' : 'text-slate-600'
                              }`}>
                                {step.label}
                              </span>
                            </div>
                            {i < TIMELINE.length - 1 && (
                              <div className={`flex-1 h-0.5 mb-4 mx-1 ${i < tIdx ? 'bg-sky-500' : 'bg-slate-700'}`} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {isCanceled && (
                    <div className="mt-3 flex items-center gap-2 text-sm px-3 py-2 rounded-lg border bg-red-900/50 text-red-400 border-red-700">
                      ❌ Commande annulée
                    </div>
                  )}
                </div>

                {/* ── Détail expandable ── */}
                {isSelected && (
                  <div className="border-t border-slate-700 px-5 py-5 bg-slate-900/50">
                    <h3 className="text-white font-semibold mb-4 text-sm">Détail des articles</h3>
                    <div className="space-y-3 mb-5">
                      {order.rows?.length > 0 ? order.rows.map((row, i) => (
                        <div key={i} className="flex items-center justify-between bg-slate-800 rounded-lg px-4 py-3">
                          <div>
                            <p className="text-white text-sm font-medium">{row.product_name}</p>
                            <p className="text-slate-500 text-xs font-mono">{row.product_reference}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-slate-300 text-sm">× {row.product_quantity}</p>
                            <p className="text-sky-400 font-semibold text-sm">{row.product_price} €</p>
                          </div>
                        </div>
                      )) : (
                        <p className="text-slate-500 text-sm">Aucun détail disponible</p>
                      )}
                    </div>

                    <div className="border-t border-slate-700 pt-4 flex justify-between items-center">
                      <div>
                        <p className="text-slate-400 text-sm">Paiement</p>
                        <p className="text-white text-sm font-medium">{order.payment}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-400 text-sm">Livraison</p>
                        <p className="text-emerald-400 text-sm font-medium">Gratuite</p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-400 text-sm">Total</p>
                        <p className="text-sky-400 font-bold text-xl">{order.total_paid} €</p>
                      </div>
                    </div>

                    {/* ── Boutons de transition ── */}
                    {transitions.length > 0 && (
                      <div className="mt-5 pt-4 border-t border-slate-700">
                        <p className="text-slate-500 text-xs mb-3">Mettre à jour votre commande :</p>
                        <div className={`flex gap-3 ${transitions.length > 1 ? 'flex-row' : ''}`}>
                          {transitions.map(tr => {
                            const isLoading = advancing === order.id + '_' + tr.target
                            return (
                              <button
                                key={tr.target}
                                onClick={() => handleTransition(order.id, tr.target)}
                                disabled={!!advancing}
                                className={`flex-1 py-3 rounded-xl font-semibold text-white text-sm transition-colors ${tr.style} disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {isLoading ? 'Mise à jour...' : `${tr.icon} ${tr.text}`}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {order.current_state === '5' && (
                      <div className="mt-5 pt-4 border-t border-slate-700 text-center">
                        <p className="text-emerald-400 text-sm font-medium">📦 Commande livrée — merci pour votre achat !</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </FrontofficeLayout>
  )
}
