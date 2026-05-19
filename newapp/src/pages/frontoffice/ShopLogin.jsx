import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getCustomers, ensureGuestUser } from '../../services/prestashopApi'

export default function ShopLogin() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const { loginAsCustomer, customer, loginAsCustomerDirect } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/catalogue'

  useEffect(() => {
    if (customer) { navigate(redirectTo); return }
    ensureGuestUser().catch(() => {})
    getCustomers()
      .then(doc => {
        const items = Array.from(doc.querySelectorAll('customers > customer'))
          .map(c => ({
            id: c.querySelector('id')?.textContent?.trim(),
            firstname: c.querySelector('firstname')?.textContent?.trim(),
            lastname: c.querySelector('lastname')?.textContent?.trim(),
            email: c.querySelector('email')?.textContent?.trim(),
            active: c.querySelector('active')?.textContent?.trim(),
          }))
          .filter(c => c.active === '1' && c.email && c.email !== 'anonymous@psgdpr.com')
        setCustomers(items)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSelect = async (cust) => {
    loginAsCustomerDirect(cust)
    navigate(redirectTo)
  }

  const handleAnonymous = () => {
    loginAsCustomerDirect({
      id: 'anonymous',
      firstname: 'Anonyme',
      lastname: '',
      email: 'anonymous@guest.com',
    })
    navigate(redirectTo)
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <p className="text-slate-400">Chargement des utilisateurs...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <span className="text-4xl">🛍️</span>
          <h1 className="text-2xl font-bold text-white mt-3">Ma Boutique</h1>
          <p className="text-slate-400 text-sm mt-1">Choisissez un utilisateur pour continuer</p>
        </div>

        <div className="space-y-3">
          {/* Utilisateur anonyme */}
          <button
            onClick={handleAnonymous}
            className="w-full bg-slate-800 border-2 border-dashed border-slate-600 hover:border-slate-400 rounded-xl p-4 flex items-center gap-4 transition-all group"
          >
            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-xl flex-shrink-0">
              👤
            </div>
            <div className="text-left">
              <p className="text-slate-300 font-semibold group-hover:text-white transition-colors">
                Utilisateur anonyme
              </p>
              <p className="text-slate-500 text-xs">Parcourir sans compte</p>
            </div>
          </button>

          {/* Séparateur */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="text-slate-500 text-xs">ou choisir un compte</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>

          {/* Liste clients */}
          {customers.map(cust => (
            <button
              key={cust.id}
              onClick={() => handleSelect(cust)}
              className="w-full bg-slate-800 border border-slate-700 hover:border-sky-500 hover:bg-slate-700 rounded-xl p-4 flex items-center gap-4 transition-all group"
            >
              <div className="w-10 h-10 bg-sky-900 rounded-full flex items-center justify-center text-lg font-bold text-sky-400 flex-shrink-0">
                {cust.firstname?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="text-left flex-1">
                <p className="text-white font-semibold group-hover:text-sky-400 transition-colors">
                  {cust.firstname} {cust.lastname}
                </p>
                <p className="text-slate-400 text-xs">{cust.email}</p>
              </div>
              <span className="text-slate-600 group-hover:text-sky-400 transition-colors">→</span>
            </button>
          ))}

          {customers.length === 0 && (
            <p className="text-slate-500 text-center py-4 text-sm">
              Aucun client trouvé. Importez des données d'abord.
            </p>
          )}
        </div>

        <p className="text-center mt-6">
          <a href="/login" className="text-slate-600 hover:text-slate-400 text-xs transition-colors">
            Accès employé →
          </a>
        </p>
      </div>
    </div>
  )
}