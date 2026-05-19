import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { createOrder, createOrderFromData } from '../../services/prestashopApi'
import FrontofficeLayout from '../../components/FrontofficeLayout'

export default function Commande() {
  const { cart, total, clearCart } = useCart()
  const { customer } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const isLoggedIn = customer && customer.id !== 'anonymous'

  const [form, setForm] = useState({
    firstname: isLoggedIn ? (customer.firstname || '') : '',
    lastname: isLoggedIn ? (customer.lastname || '') : '',
    email: isLoggedIn ? (customer.email || '') : '',
    address: '',
    city: '',
    postcode: '',
    phone: '',
  })

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const isValid = form.firstname && form.lastname && form.email &&
    form.address && form.city && form.postcode

  const handleSubmit = async () => {
    if (!isValid || cart.length === 0) return
    setLoading(true)
    setError(null)
    try {
      if (isLoggedIn) {
        // Client existant : pas de doublon — on réutilise son ID PS
        const cartItems = cart.map(item => ({
          id: item.id,
          reference: item.reference || '',
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          combinationId: item.combinationId || '0',
        }))
        await createOrderFromData(
          { customerId: customer.id, nom: customer.firstname, email: customer.email, address: `${form.address}, ${form.city} ${form.postcode}` },
          cartItems,
          '1',
          null,
          {}
        )
      } else {
        // Utilisateur anonyme : création d'un nouveau client
        await createOrder(form, cart, total)
      }
      clearCart()
      navigate('/confirmation')
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (cart.length === 0) navigate('/')
  }, [cart.length])

  if (cart.length === 0) return null

  if (!isLoggedIn) {
    return (
      <FrontofficeLayout>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="text-5xl mb-6">🔒</span>
          <h2 className="text-2xl font-bold text-white mb-3">Connexion requise</h2>
          <p className="text-slate-400 text-sm mb-6">
            Veuillez vous connecter pour confirmer votre commande.<br />
            Utilisez le compte <span className="text-sky-400 font-semibold">User Guest</span> si vous n'avez pas de compte personnel.
          </p>
          <button
            onClick={() => navigate('/shop-login?redirect=/commande')}
            className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-8 py-3 rounded-xl transition-colors"
          >
            Se connecter pour commander
          </button>
          <button
            onClick={() => navigate('/')}
            className="mt-3 text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            ← Continuer mes achats
          </button>
        </div>
      </FrontofficeLayout>
    )
  }

  return (
    <FrontofficeLayout>
      <h1 className="text-2xl font-bold text-white mb-8">Validation de la commande</h1>

      <div className="grid grid-cols-3 gap-8">
        {/* Formulaire */}
        <div className="col-span-2 space-y-6">
          {/* Informations personnelles */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-white font-semibold mb-5">👤 Informations personnelles</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm block mb-1.5">Prénom *</label>
                <input name="firstname" value={form.firstname} onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Jean" />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-1.5">Nom *</label>
                <input name="lastname" value={form.lastname} onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Dupont" />
              </div>
              <div className="col-span-2">
                <label className="text-slate-400 text-sm block mb-1.5">Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="jean.dupont@email.com" />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-1.5">Téléphone</label>
                <input name="phone" value={form.phone} onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="+33 6 00 00 00 00" />
              </div>
            </div>
          </div>

          {/* Adresse de livraison */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-white font-semibold mb-5">📍 Adresse de livraison</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-slate-400 text-sm block mb-1.5">Adresse *</label>
                <input name="address" value={form.address} onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="123 rue de la Paix" />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-1.5">Ville *</label>
                <input name="city" value={form.city} onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Paris" />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-1.5">Code postal *</label>
                <input name="postcode" value={form.postcode} onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="75001" />
              </div>
            </div>
          </div>

          {/* Mode de paiement */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-white font-semibold mb-4">💳 Mode de paiement</h2>
            <div className="flex items-center gap-4 bg-slate-900 border-2 border-sky-500 rounded-xl p-4">
              <div className="w-10 h-10 bg-sky-500/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">🚚</span>
              </div>
              <div>
                <p className="text-white font-semibold">Paiement à la livraison</p>
                <p className="text-slate-400 text-sm">Payez en espèces à la réception de votre colis</p>
              </div>
              <span className="ml-auto text-sky-400 font-bold">✓</span>
            </div>
            <div className="flex items-center gap-2 mt-3 text-emerald-400 text-sm">
              <span>✅</span>
              <span>Livraison gratuite sur toutes les commandes</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-400 px-4 py-3 rounded-lg text-sm">
              ❌ {error}
            </div>
          )}
        </div>

        {/* Récapitulatif */}
        <div className="col-span-1">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 sticky top-24">
            <h2 className="text-white font-bold text-lg mb-5">Récapitulatif</h2>

            <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-slate-400 truncate flex-1 mr-2">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="text-slate-300 font-medium flex-shrink-0">
                    {(parseFloat(item.price) * item.quantity).toFixed(2)} €
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-700 pt-4 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Livraison</span>
                <span className="text-emerald-400">Gratuite</span>
              </div>
              <div className="flex justify-between text-lg font-bold mt-3 pt-3 border-t border-slate-700">
                <span className="text-white">Total</span>
                <span className="text-sky-400">{total} €</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isValid || loading}
              className={`w-full py-3 rounded-xl font-bold transition-colors text-sm ${
                !isValid || loading
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  : 'bg-sky-500 hover:bg-sky-600 text-white'
              }`}
            >
              {loading ? 'Traitement...' : '✅ Confirmer la commande'}
            </button>
          </div>
        </div>
      </div>
    </FrontofficeLayout>
  )
}