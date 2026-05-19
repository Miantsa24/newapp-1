import { useNavigate } from 'react-router-dom'
import FrontofficeLayout from '../../components/FrontofficeLayout'

export default function Confirmation() {
  const navigate = useNavigate()

  return (
    <FrontofficeLayout>
      <div className="max-w-lg mx-auto text-center py-20">
        <p className="text-7xl mb-6">🎉</p>
        <h1 className="text-3xl font-bold text-white mb-3">Commande confirmée !</h1>
        <p className="text-slate-400 mb-2">
          Merci pour votre commande. Vous serez livré et le paiement s'effectuera à la réception.
        </p>
        <p className="text-emerald-400 text-sm mb-8">
          ✅ Livraison gratuite — Paiement à la livraison
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/mes-commandes')}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors"
          >
            📦 Mes commandes
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold transition-colors"
          >
            Continuer mes achats
          </button>
        </div>
      </div>
    </FrontofficeLayout>
  )
}