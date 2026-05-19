import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ login: 'admin', password: 'admin123' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const ok = await login(form.login, form.password)
      if (ok) {
        navigate('/backoffice/commandes')
      } else {
        setError('Identifiant ou mot de passe incorrect')
      }
    } catch {
      setError('Identifiant ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🛍️</span>
          <h1 className="text-2xl font-bold text-white mt-3">NewApp Backoffice</h1>
          <p className="text-slate-400 text-sm mt-1">Connectez-vous pour accéder au backoffice</p>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="text-slate-300 text-sm font-medium block mb-2">
                Identifiant
              </label>
              <input
                type="text"
                value={form.login}
                onChange={e => setForm(prev => ({ ...prev, login: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="admin"
              />
            </div>

            <div className="mb-6">
              <label className="text-slate-300 text-sm font-medium block mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-900/40 border border-red-700 text-red-400 text-sm px-4 py-3 rounded-lg mb-5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-sm font-semibold transition-colors ${
                loading
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  : 'bg-sky-500 hover:bg-sky-600 text-white'
              }`}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          NewApp v1.0 — PrestaShop 8.2.6
        </p>
      </div>
    </div>
  )
}