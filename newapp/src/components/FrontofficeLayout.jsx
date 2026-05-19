import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function FrontofficeLayout({ children }) {
  const { cart } = useCart()
  const { customer, logoutCustomer } = useAuth()
  const navigate = useNavigate()
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleLogout = () => {
    logoutCustomer()
    navigate('/shop/login')
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="bg-slate-950 border-b border-slate-800 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
      <Link to="/catalogue" className="text-sky-400 font-bold text-xl">🛍️ Ma Boutique</Link>
        <div className="flex items-center gap-6">
          {customer && (
            <span className="text-slate-400 text-sm">
              👤 {customer.firstname} {customer.lastname}
            </span>
          )}
          <Link to="/mes-commandes" className="text-slate-400 hover:text-white text-sm transition-colors">
            📦 Mes commandes
          </Link>
          <button
            onClick={() => navigate('/panier')}
            className="relative bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            🛒 Panier
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </button>
          {customer && (
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-400 text-sm transition-colors"
            >
              Déconnexion
            </button>
          )}
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-8 py-8">
        {children}
      </main>
    </div>
  )
}