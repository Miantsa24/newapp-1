import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import FrontofficeLayout from '../../components/FrontofficeLayout'

export default function Panier() {
  const { cart, removeFromCart, updateQuantity, total, clearCart } = useCart()
  const navigate = useNavigate()

  if (cart.length === 0) return (
    <FrontofficeLayout>
      <div className="text-center py-24">
        <p className="text-6xl mb-6">🛒</p>
        <h2 className="text-2xl font-bold text-white mb-3">Votre panier est vide</h2>
        <p className="text-slate-400 mb-8">Ajoutez des produits pour continuer</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold transition-colors"
        >
          Continuer mes achats
        </button>
      </div>
    </FrontofficeLayout>
  )

  return (
    <FrontofficeLayout>
      <h1 className="text-2xl font-bold text-white mb-8">
        Mon panier
        <span className="ml-2 text-sm font-normal text-slate-400">({cart.length} article(s))</span>
      </h1>

      <div className="grid grid-cols-3 gap-8">
        {/* Liste articles */}
        <div className="col-span-2 space-y-4">
          {cart.map(item => (
            <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-center gap-5">
              {/* Image */}
              <div className="w-20 h-20 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-3xl opacity-50">📦</span>
              </div>

              {/* Infos */}
              <div className="flex-1">
                <p className="text-slate-400 text-xs font-mono mb-1">{item.reference}</p>
                <h3 className="text-white font-semibold">{item.name}</h3>
                <p className="text-sky-400 font-bold mt-1">{item.price} € / unité</p>
              </div>

              {/* Quantité */}
              <div className="flex items-center bg-slate-900 border border-slate-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  −
                </button>
                <span className="px-4 py-2 text-white font-semibold min-w-10 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  +
                </button>
              </div>

              {/* Sous-total */}
              <p className="text-white font-bold text-lg w-24 text-right">
                {(parseFloat(item.price) * item.quantity).toFixed(2)} €
              </p>

              {/* Supprimer */}
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-slate-500 hover:text-red-400 transition-colors ml-2"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-slate-500 hover:text-red-400 text-sm transition-colors"
          >
            🗑️ Vider le panier
          </button>
        </div>

        {/* Résumé commande */}
        <div className="col-span-1">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 sticky top-24">
            <h2 className="text-white font-bold text-lg mb-5">Résumé</h2>

            <div className="space-y-3 mb-5">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-slate-400 truncate flex-1 mr-2">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="text-slate-300 font-medium">
                    {(parseFloat(item.price) * item.quantity).toFixed(2)} €
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-700 pt-4 mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Sous-total</span>
                <span className="text-white">{total} €</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Livraison</span>
                <span className="text-emerald-400 font-medium">Gratuite</span>
              </div>
              <div className="flex justify-between text-lg font-bold mt-3 pt-3 border-t border-slate-700">
                <span className="text-white">Total</span>
                <span className="text-sky-400">{total} €</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/commande')}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold transition-colors"
            >
              Commander →
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full py-2.5 mt-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-sm transition-colors"
            >
              ← Continuer mes achats
            </button>
          </div>
        </div>
      </div>
    </FrontofficeLayout>
  )
}