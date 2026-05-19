import { useState, useEffect } from 'react'
import {
  getOrders, getProducts, getCategories,
  getOrderDetails, getStockAvailables,
} from '../../services/prestashopApi'

const ORDER_STATES = {
  '1': { label: 'Dans le panier',   color: 'text-yellow-400', bg: 'bg-yellow-900/40' },
  '2': { label: 'Paiement effectué', color: 'text-emerald-400', bg: 'bg-emerald-900/40' },
  '5': { label: 'Livré',            color: 'text-blue-400',   bg: 'bg-blue-900/40'  },
  '6': { label: 'Annulé',           color: 'text-red-400',    bg: 'bg-red-900/40'   },
}

const fmt = (n) => Number(n).toFixed(2)

export default function BackofficeDashboard() {
  const [orders,    setOrders]    = useState([])
  const [catStats,  setCatStats]  = useState([])  // [{name, ventes, achats}]
  const [catStock,  setCatStock]  = useState([])  // [{name, physique, reservé, disponible}]
  const [totals,    setTotals]    = useState({ ventesHT: 0, achatsHT: 0 })
  const [loading,   setLoading]   = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    Promise.all([
      getOrders(),
      getProducts(),
      getCategories(),
      getOrderDetails(),
      getStockAvailables(),
    ]).then(([ordDoc, prodDoc, catDoc, detailDoc, stockDoc]) => {

      // ── Orders ──
      const orderList = Array.from(ordDoc.querySelectorAll('orders > order')).map(o => ({
        id:            o.querySelector('id')?.textContent?.trim(),
        reference:     o.querySelector('reference')?.textContent?.trim(),
        total_paid:    parseFloat(o.querySelector('total_paid')?.textContent?.trim() || 0),
        current_state: o.querySelector('current_state')?.textContent?.trim(),
        date_add:      o.querySelector('date_add')?.textContent?.trim(),
      }))
      setOrders(orderList)
      const orderStateMap = {}
      orderList.forEach(o => { orderStateMap[o.id] = o.current_state })

      // ── Products ──
      const prodCatMap = {}  // id → id_category_default
      Array.from(prodDoc.querySelectorAll('products > product')).forEach(p => {
        const id  = p.querySelector('id')?.textContent?.trim()
        const cat = p.querySelector('id_category_default')?.textContent?.trim()
        if (id) prodCatMap[id] = cat
      })

      // ── Categories (exclure racine 1 et home 2) ──
      const catNameMap = {}  // id → name
      Array.from(catDoc.querySelectorAll('categories > category')).forEach(c => {
        const id   = c.querySelector('id')?.textContent?.trim()
        const name = c.querySelector('name language')?.textContent?.trim()
        if (id && id !== '1' && id !== '2') catNameMap[id] = name
      })
      const getCatName = (catId) => catNameMap[catId] || 'Autre'

      // ── Order details ──
      const details = Array.from(detailDoc.querySelectorAll('order_details > order_detail')).map(d => ({
        id_order:                 d.querySelector('id_order')?.textContent?.trim(),
        product_id:               d.querySelector('product_id')?.textContent?.trim(),
        product_quantity:         parseInt(d.querySelector('product_quantity')?.textContent?.trim() || 0),
        unit_price_tax_excl:      parseFloat(d.querySelector('unit_price_tax_excl')?.textContent?.trim() || 0),
        original_wholesale_price: parseFloat(d.querySelector('original_wholesale_price')?.textContent?.trim() || 0),
      }))

      // ── Stock disponible par produit ──
      const stockByProduct = {}
      Array.from(stockDoc.querySelectorAll('stock_availables > stock_available')).forEach(s => {
        const pid = s.querySelector('id_product')?.textContent?.trim()
        const qty = parseInt(s.querySelector('quantity')?.textContent?.trim() || 0)
        if (pid) stockByProduct[pid] = (stockByProduct[pid] || 0) + Math.max(0, qty)
      })

      // ── Stock réservé par produit (commandes état 1 ou 2, pas encore livrées) ──
      const reservedByProduct = {}
      details.forEach(d => {
        const state = orderStateMap[d.id_order]
        if (state === '1' || state === '2') {
          reservedByProduct[d.product_id] = (reservedByProduct[d.product_id] || 0) + d.product_quantity
        }
      })

      // ── Stats commerciales par catégorie (états 2 et 5 = ventes réalisées) ──
      const commercialMap = {}
      let totalVentesHT = 0, totalAchatsHT = 0
      details.forEach(d => {
        const state = orderStateMap[d.id_order]
        if (state !== '2' && state !== '5') return
        const catName = getCatName(prodCatMap[d.product_id])
        if (!commercialMap[catName]) commercialMap[catName] = { ventes: 0, achats: 0 }
        const v = d.unit_price_tax_excl * d.product_quantity
        const a = d.original_wholesale_price * d.product_quantity
        commercialMap[catName].ventes += v
        commercialMap[catName].achats += a
        totalVentesHT += v
        totalAchatsHT += a
      })
      const catStatsArr = Object.entries(commercialMap)
        .map(([name, s]) => ({ name, ventes: s.ventes, achats: s.achats, benefice: s.ventes - s.achats }))
        .sort((a, b) => b.benefice - a.benefice)
      setCatStats(catStatsArr)
      setTotals({ ventesHT: totalVentesHT, achatsHT: totalAchatsHT })

      // ── Stock par catégorie ──
      const stockCatMap = {}
      Object.entries(prodCatMap).forEach(([pid, catId]) => {
        const catName = getCatName(catId)
        if (!stockCatMap[catName]) stockCatMap[catName] = { disponible: 0, reservé: 0 }
        stockCatMap[catName].disponible += stockByProduct[pid] || 0
        stockCatMap[catName].reservé    += reservedByProduct[pid] || 0
      })
      const catStockArr = Object.entries(stockCatMap)
        .map(([name, s]) => ({ name, disponible: s.disponible, reservé: s.reservé, physique: s.disponible + s.reservé }))
        .sort((a, b) => a.name.localeCompare(b.name))
      setCatStock(catStockArr)

      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const paidOrders     = orders.filter(o => o.current_state === '2').length
  const deliveredOrders = orders.filter(o => o.current_state === '5').length
  const canceledOrders  = orders.filter(o => o.current_state === '6').length
  const cartOrders      = orders.filter(o => o.current_state === '1').length

  const totalRevenue = orders
    .filter(o => o.current_state === '2' || o.current_state === '5')
    .reduce((s, o) => s + o.total_paid, 0)

  const ordersOfDay = orders.filter(o => o.date_add?.startsWith(selectedDate))
  const dayRevenue  = ordersOfDay.filter(o => o.current_state === '2' || o.current_state === '5')
    .reduce((s, o) => s + o.total_paid, 0)

  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i)
    return d.toISOString().split('T')[0]
  }).reverse()

  const dailyStats = last7Days.map(date => {
    const dayOrders = orders.filter(o => o.date_add?.startsWith(date))
    return {
      date,
      label: new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }),
      count: dayOrders.length,
      revenue: dayOrders.filter(o => o.current_state === '2' || o.current_state === '5')
        .reduce((s, o) => s + o.total_paid, 0),
    }
  })
  const maxRevenue7 = Math.max(...dailyStats.map(d => d.revenue), 1)

  if (loading) return <p className="text-slate-400 text-center mt-8">Chargement...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Tableau de bord</h1>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Chiffre d'affaires", value: `${fmt(totalRevenue)} €`, icon: '💰', color: 'border-t-amber-500' },
          { label: 'Total commandes',    value: orders.length,            icon: '🛒', color: 'border-t-sky-500'   },
          { label: 'Livrées',            value: deliveredOrders,          icon: '📦', color: 'border-t-blue-500'  },
          { label: 'Annulées',           value: canceledOrders,           icon: '❌', color: 'border-t-red-500'   },
        ].map(s => (
          <div key={s.label} className={`bg-slate-800 border border-slate-700 border-t-4 ${s.color} rounded-xl p-5`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-sm">{s.label}</p>
              <span className="text-xl">{s.icon}</span>
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Répartition par état ── */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { state: '1', count: cartOrders      },
          { state: '2', count: paidOrders      },
          { state: '5', count: deliveredOrders },
          { state: '6', count: canceledOrders  },
        ].map(({ state, count }) => {
          const meta = ORDER_STATES[state]
          return (
            <div key={state} className={`${meta.bg} border border-slate-700 rounded-xl p-4 flex items-center gap-4`}>
              <div className="flex-1">
                <p className={`font-semibold ${meta.color}`}>{meta.label}</p>
                <p className="text-slate-400 text-xs mt-0.5">{count} commande(s)</p>
              </div>
              <p className={`text-3xl font-bold ${meta.color}`}>{count}</p>
            </div>
          )
        })}
      </div>

      {/* ── Graphique 7 jours ── */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
        <h2 className="text-white font-semibold mb-6">📈 Activité des 7 derniers jours</h2>
        <div className="flex items-end gap-3 h-40">
          {dailyStats.map(day => {
            const height  = (day.revenue / maxRevenue7) * 100
            const isToday = day.date === new Date().toISOString().split('T')[0]
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                <p className="text-slate-400 text-xs">{fmt(day.revenue)} €</p>
                <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                  <div className={`w-full rounded-t-lg transition-all ${isToday ? 'bg-sky-500' : 'bg-slate-600'}`}
                    style={{ height: `${Math.max(height, 4)}%` }} />
                </div>
                <p className={`text-xs text-center ${isToday ? 'text-sky-400 font-semibold' : 'text-slate-500'}`}>
                  {day.label}
                </p>
                <p className="text-slate-500 text-xs">{day.count} cmd</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Statistiques commerciales par catégorie ── */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
        <h2 className="text-white font-semibold mb-2">💹 Statistiques commerciales</h2>
        <p className="text-slate-500 text-xs mb-5">Basé sur les commandes en état "Paiement effectué" et "Livré"</p>

        {/* Totaux globaux */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total ventes HT',  value: `${fmt(totals.ventesHT)} €`,                         color: 'text-emerald-400' },
            { label: "Total achats HT",  value: `${fmt(totals.achatsHT)} €`,                         color: 'text-orange-400'  },
            { label: 'Bénéfice total HT',value: `${fmt(totals.ventesHT - totals.achatsHT)} €`,       color: 'text-sky-400'     },
          ].map(s => (
            <div key={s.label} className="bg-slate-900 rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-slate-400 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tableau par catégorie */}
        {catStats.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900 text-slate-400 text-left">
                <th className="px-4 py-3 font-medium">Catégorie</th>
                <th className="px-4 py-3 font-medium text-right">Ventes HT</th>
                <th className="px-4 py-3 font-medium text-right">Achats HT</th>
                <th className="px-4 py-3 font-medium text-right">Bénéfice</th>
                <th className="px-4 py-3 font-medium text-right">Marge</th>
              </tr>
            </thead>
            <tbody>
              {catStats.map((row, i) => {
                const marge = row.ventes > 0 ? (row.benefice / row.ventes) * 100 : 0
                return (
                  <tr key={row.name} className={`border-t border-slate-700 ${i % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/50'}`}>
                    <td className="px-4 py-3 font-semibold text-white">{row.name}</td>
                    <td className="px-4 py-3 text-right text-emerald-400">{fmt(row.ventes)} €</td>
                    <td className="px-4 py-3 text-right text-orange-400">{fmt(row.achats)} €</td>
                    <td className={`px-4 py-3 text-right font-bold ${row.benefice >= 0 ? 'text-sky-400' : 'text-red-400'}`}>
                      {fmt(row.benefice)} €
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400">{marge.toFixed(1)} %</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-slate-500 text-center py-6 text-sm">Aucune vente enregistrée.</p>
        )}
      </div>

      {/* ── Stock par catégorie ── */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
        <h2 className="text-white font-semibold mb-2">📊 Stock par catégorie</h2>
        <p className="text-slate-500 text-xs mb-5">
          Physique = Disponible + Réservé · Réservé = articles dans commandes non livrées
        </p>
        {catStock.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900 text-slate-400 text-left">
                <th className="px-4 py-3 font-medium">Catégorie</th>
                <th className="px-4 py-3 font-medium text-right">Qté physique</th>
                <th className="px-4 py-3 font-medium text-right">Qté réservée</th>
                <th className="px-4 py-3 font-medium text-right">Qté disponible</th>
              </tr>
            </thead>
            <tbody>
              {catStock.map((row, i) => (
                <tr key={row.name} className={`border-t border-slate-700 ${i % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/50'}`}>
                  <td className="px-4 py-3 font-semibold text-white">{row.name}</td>
                  <td className="px-4 py-3 text-right text-slate-300">{row.physique}</td>
                  <td className="px-4 py-3 text-right text-amber-400">{row.reservé}</td>
                  <td className={`px-4 py-3 text-right font-bold ${row.disponible > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {row.disponible}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-slate-500 text-center py-6 text-sm">Aucun produit en stock.</p>
        )}
      </div>

      {/* ── Détail par jour ── */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold">📅 Détail par jour</h2>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            className="bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-900 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-white">{ordersOfDay.length}</p>
            <p className="text-slate-400 text-sm mt-1">Commandes ce jour</p>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-emerald-400">{fmt(dayRevenue)} €</p>
            <p className="text-slate-400 text-sm mt-1">Montant encaissé</p>
          </div>
        </div>
        {ordersOfDay.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900 text-slate-400 text-left">
                <th className="px-4 py-2 font-medium">Référence</th>
                <th className="px-4 py-2 font-medium">Total</th>
                <th className="px-4 py-2 font-medium">Heure</th>
                <th className="px-4 py-2 font-medium">État</th>
              </tr>
            </thead>
            <tbody>
              {ordersOfDay.map((o, i) => {
                const meta = ORDER_STATES[o.current_state]
                return (
                  <tr key={o.id} className={`border-t border-slate-700 ${i % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/50'}`}>
                    <td className="px-4 py-3 font-mono text-sky-400">{o.reference}</td>
                    <td className="px-4 py-3 font-bold text-white">{fmt(o.total_paid)} €</td>
                    <td className="px-4 py-3 text-slate-400">{o.date_add?.split(' ')[1]?.slice(0, 5)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${meta?.bg} ${meta?.color}`}>
                        {meta?.label || `État ${o.current_state}`}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-slate-500 text-center py-6">Aucune commande ce jour.</p>
        )}
      </div>
    </div>
  )
}
