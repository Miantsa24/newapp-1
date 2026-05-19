import { useState, useEffect } from 'react'
import { getProducts, getCustomers, getOrders, getCategories, getSuppliers, getManufacturers, getCartRules, getStockAvailables } from '../services/prestashopApi'
import { Link } from 'react-router-dom'

const StatCard = ({ title, value, icon, color, to }) => (
  <Link to={to} className={`bg-slate-800 rounded-xl p-6 border border-slate-700 border-t-4 ${color} hover:bg-slate-700 transition-colors block`}>
    <div className="flex items-center justify-between mb-3">
      <p className="text-slate-400 text-sm font-medium">{title}</p>
      <span className="text-2xl">{icon}</span>
    </div>
    <p className="text-3xl font-bold text-white">{value ?? '...'}</p>
  </Link>
)

export default function Dashboard() {
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [recentOrders, setRecentOrders] = useState([])
  const [lowStocks, setLowStocks] = useState([])

  const ORDER_STATES = {
    '1': 'En attente', '2': 'Paiement accepté', '3': 'En préparation',
    '4': 'Expédié', '5': 'Livré', '6': 'Annulé', '7': 'Remboursé',
  }
  const STATE_COLORS = {
    '1': 'bg-yellow-900 text-yellow-400', '2': 'bg-emerald-900 text-emerald-400',
    '3': 'bg-blue-900 text-blue-400', '4': 'bg-indigo-900 text-indigo-400',
    '5': 'bg-green-900 text-green-400', '6': 'bg-red-900 text-red-400',
    '7': 'bg-purple-900 text-purple-400',
  }

  useEffect(() => {
    Promise.all([
      getProducts(), getCustomers(), getOrders(),
      getCategories(), getSuppliers(), getManufacturers(),
      getCartRules(), getStockAvailables()
    ]).then(([prodDoc, custDoc, ordDoc, catDoc, supDoc, manDoc, promoDoc, stockDoc]) => {
      const orderItems = Array.from(ordDoc.querySelectorAll('orders > order'))
      const revenue = orderItems.reduce((sum, o) =>
        sum + parseFloat(o.querySelector('total_paid')?.textContent?.trim() || 0), 0
      ).toFixed(2)
      const stockItems = Array.from(stockDoc.querySelectorAll('stock_availables > stock_available'))

      setStats({
        products: prodDoc.querySelectorAll('products > product').length,
        customers: custDoc.querySelectorAll('customers > customer').length,
        orders: orderItems.length,
        categories: catDoc.querySelectorAll('categories > category').length,
        suppliers: supDoc.querySelectorAll('suppliers > supplier').length,
        manufacturers: manDoc.querySelectorAll('manufacturers > manufacturer').length,
        promotions: promoDoc.querySelectorAll('cart_rules > cart_rule').length,
        revenue,
        outOfStock: stockItems.filter(s => parseInt(s.querySelector('quantity')?.textContent?.trim() || 0) <= 0).length,
        lowStock: stockItems.filter(s => { const q = parseInt(s.querySelector('quantity')?.textContent?.trim() || 0); return q > 0 && q <= 5 }).length,
      })

      setRecentOrders(orderItems.slice(-5).reverse().map(o => ({
        id: o.querySelector('id')?.textContent?.trim(),
        reference: o.querySelector('reference')?.textContent?.trim(),
        total: parseFloat(o.querySelector('total_paid')?.textContent?.trim() || 0).toFixed(2),
        state: o.querySelector('current_state')?.textContent?.trim(),
        date: o.querySelector('date_add')?.textContent?.trim()?.split(' ')[0],
      })))

      setLowStocks(stockItems
        .filter(s => parseInt(s.querySelector('quantity')?.textContent?.trim() || 0) <= 5)
        .slice(0, 5)
        .map(s => ({
          id_product: s.querySelector('id_product')?.textContent?.trim(),
          quantity: s.querySelector('quantity')?.textContent?.trim(),
        }))
      )

      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Dashboard</h1>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-slate-800 rounded-xl p-6 h-28 animate-pulse border border-slate-700" />
        ))}
      </div>
    </div>
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Dashboard</h1>

      {/* Stats principales */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <StatCard title="Produits" value={stats.products} icon="📦" color="border-t-blue-500" to="/" />
        <StatCard title="Clients" value={stats.customers} icon="👥" color="border-t-emerald-500" to="/clients" />
        <StatCard title="Commandes" value={stats.orders} icon="🛒" color="border-t-violet-500" to="/commandes" />
        <StatCard title="Chiffre d'affaires" value={`${stats.revenue} €`} icon="💰" color="border-t-amber-500" to="/commandes" />
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard title="Catégories" value={stats.categories} icon="🗂️" color="border-t-blue-400" to="/categories" />
        <StatCard title="Fournisseurs" value={stats.suppliers} icon="🏭" color="border-t-yellow-500" to="/fournisseurs" />
        <StatCard title="Marques" value={stats.manufacturers} icon="🏷️" color="border-t-pink-500" to="/marques" />
        <StatCard title="Promotions" value={stats.promotions} icon="🎟️" color="border-t-emerald-400" to="/promotions" />
      </div>

      {/* Alertes stock */}
      {(stats.outOfStock > 0 || stats.lowStock > 0) && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          {stats.outOfStock > 0 && (
            <Link to="/stocks" className="flex items-center gap-4 bg-red-900/30 border border-red-700 rounded-xl px-5 py-4 hover:bg-red-900/50 transition-colors">
              <span className="text-3xl">🔴</span>
              <div>
                <p className="text-red-400 font-semibold">{stats.outOfStock} rupture(s) de stock</p>
                <p className="text-red-400/70 text-sm">Produits en rupture totale</p>
              </div>
            </Link>
          )}
          {stats.lowStock > 0 && (
            <Link to="/stocks" className="flex items-center gap-4 bg-yellow-900/30 border border-yellow-700 rounded-xl px-5 py-4 hover:bg-yellow-900/50 transition-colors">
              <span className="text-3xl">⚠️</span>
              <div>
                <p className="text-yellow-400 font-semibold">{stats.lowStock} stock(s) faible(s)</p>
                <p className="text-yellow-400/70 text-sm">Quantité ≤ 5 unités</p>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Deux colonnes : commandes récentes + stocks faibles */}
      <div className="grid grid-cols-2 gap-6">
        {/* Commandes récentes */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
            <p className="text-white font-semibold">Commandes récentes</p>
            <Link to="/commandes" className="text-sky-400 text-xs hover:underline">Voir tout</Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-left">
                <th className="px-5 py-2.5 font-medium">Réf.</th>
                <th className="px-5 py-2.5 font-medium">Total</th>
                <th className="px-5 py-2.5 font-medium">Date</th>
                <th className="px-5 py-2.5 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o, i) => (
                <tr key={o.id} className={`border-b border-slate-700 hover:bg-slate-700 transition-colors ${i % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/50'}`}>
                  <td className="px-5 py-3 font-mono text-sky-400 text-xs">{o.reference}</td>
                  <td className="px-5 py-3 text-white font-semibold">{o.total} €</td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{o.date}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATE_COLORS[o.state] || 'bg-slate-700 text-slate-400'}`}>
                      {ORDER_STATES[o.state] || 'Inconnu'}
                    </span>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-500">Aucune commande</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Stocks faibles */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
            <p className="text-white font-semibold">Stocks critiques</p>
            <Link to="/stocks" className="text-sky-400 text-xs hover:underline">Voir tout</Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-left">
                <th className="px-5 py-2.5 font-medium">Produit ID</th>
                <th className="px-5 py-2.5 font-medium">Quantité</th>
                <th className="px-5 py-2.5 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {lowStocks.map((s, i) => (
                <tr key={i} className={`border-b border-slate-700 hover:bg-slate-700 transition-colors ${i % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/50'}`}>
                  <td className="px-5 py-3 text-slate-300">Produit #{s.id_product}</td>
                  <td className="px-5 py-3 font-bold">
                    <span className={parseInt(s.quantity) <= 0 ? 'text-red-400' : 'text-yellow-400'}>
                      {s.quantity}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${parseInt(s.quantity) <= 0 ? 'bg-red-900 text-red-400' : 'bg-yellow-900 text-yellow-400'}`}>
                      {parseInt(s.quantity) <= 0 ? 'Rupture' : 'Stock faible'}
                    </span>
                  </td>
                </tr>
              ))}
              {lowStocks.length === 0 && (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-slate-500">✅ Tous les stocks sont OK</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}