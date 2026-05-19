import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { to: '/backoffice/dashboard', label: '📊 Dashboard' },
  { to: '/backoffice/commandes', label: '🛒 Commandes' },
  { to: '/backoffice/stocks', label: '📦 Stocks' },
  { to: '/backoffice/import', label: '📥 Import' },
  { to: '/backoffice/reinitialisation', label: '🗑️ Réinitialisation' },
]

export default function BackofficeLayout({ children }) {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <nav className="bg-slate-950 px-8 py-4 flex items-center gap-6 border-b border-slate-800">
        <span className="text-sky-400 font-bold text-lg mr-4">🛍️ Backoffice</span>

        {navLinks.map(link => (
          <Link key={link.to} to={link.to}
            className={`text-sm font-medium transition-colors ${
              pathname === link.to
                ? 'text-sky-400 border-b-2 border-sky-400 pb-0.5'
                : 'text-slate-400 hover:text-slate-100'
            }`}>
            {link.label}
          </Link>
        ))}

        <div className="ml-auto flex items-center gap-4">
          
          <a  href="/"
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            🛍️ Voir la boutique
          </a>
          <span className="text-slate-700">|</span>
          <span className="text-slate-500 text-sm">👤 {user}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-400 hover:text-red-400 transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {children}
      </div>
    </div>
  )
}