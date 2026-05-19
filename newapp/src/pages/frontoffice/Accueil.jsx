import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProducts, getCategories, getStockAvailables } from '../../services/prestashopApi'
import FrontofficeLayout from '../../components/FrontofficeLayout'
import { useAuth } from '../../context/AuthContext'
const API_KEY = 'GFCDP1I7CKYKMVVN4QMGX81X4MCDMYPL'

export default function Accueil() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const { customer } = useAuth()

  useEffect(() => {
    Promise.all([getProducts(), getCategories(), getStockAvailables()])
      .then(([prodDoc, catDoc, stockDoc]) => {
        const stockMap = {}
        Array.from(stockDoc.querySelectorAll('stock_availables > stock_available')).forEach(s => {
          const idProd = s.querySelector('id_product')?.textContent?.trim()
          const idAttr = s.querySelector('id_product_attribute')?.textContent?.trim()
          if (idAttr === '0') stockMap[idProd] = parseInt(s.querySelector('quantity')?.textContent?.trim() || '0')
        })

        const prods = Array.from(prodDoc.querySelectorAll('products > product'))
        .map(p => {
          const id = p.querySelector('id')?.textContent?.trim()
          return {
            id,
            name: p.querySelector('name language')?.textContent?.trim() || 'Sans nom',
            price: parseFloat(p.querySelector('price')?.textContent?.trim() || 0).toFixed(2),
            reference: p.querySelector('reference')?.textContent?.trim() || '',
            description_short: p.querySelector('description_short language')?.textContent?.trim() || '',
            active: p.querySelector('active')?.textContent?.trim(),
            id_category_default: p.querySelector('id_category_default')?.textContent?.trim(),
            quantity: stockMap[id] ?? 0,
            available_date: p.querySelector('available_date')?.textContent?.trim() || '',
            id_default_image: p.querySelector('id_default_image')?.textContent?.trim() || null,
          }
        })
        .filter(p => p.id && p.active === '1' && p.name)
        setProducts(prods)

        const cats = Array.from(catDoc.querySelectorAll('categories > category'))
          .map(c => ({
            id: c.querySelector('id')?.textContent?.trim(),
            name: c.querySelector('name language')?.textContent?.trim() || '',
          }))
          .filter(c => c.id && c.name && c.id !== '1')
        setCategories(cats)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = products.filter(p => {
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = selectedCategory === 'all' || p.id_category_default === selectedCategory
    const matchMin = !priceMin || parseFloat(p.price) >= parseFloat(priceMin)
    const matchMax = !priceMax || parseFloat(p.price) <= parseFloat(priceMax)
    return matchSearch && matchCat && matchMin && matchMax
  })

  if (loading) return (
    <FrontofficeLayout>
      <div className="grid grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-slate-800 rounded-xl h-64 animate-pulse" />
        ))}
      </div>
    </FrontofficeLayout>
  )

  return (
    <FrontofficeLayout>
      {/* Hero + Recherche */}
      <div className="bg-gradient-to-r from-sky-900 to-slate-800 rounded-2xl p-8 mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Bienvenue, {customer?.firstname} 👋</h1>
        <p className="text-sky-300 text-sm mb-5">Découvrez notre catalogue</p>
        <input
          type="text"
          placeholder="🔍 Rechercher par nom..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-slate-900/80 border border-slate-600 text-white placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      {/* Filtres */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">

          {/* Catégorie */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 text-sm font-medium">Catégorie :</span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedCategory === 'all' ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
            >
              Tous
            </button>
            {categories.map(c => {
              const count = products.filter(p => p.id_category_default === c.id).length
              if (count === 0) return null
              return (
                <button key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedCategory === c.id ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
                >
                  {c.name}
                </button>
              )
            })}
          </div>

          {/* Séparateur */}
          <div className="h-6 w-px bg-slate-600" />

          {/* Intervalle de prix */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm font-medium">Prix :</span>
            <input
              type="number"
              placeholder="Min"
              value={priceMin}
              onChange={e => setPriceMin(e.target.value)}
              className="w-20 bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <span className="text-slate-500 text-xs">→</span>
            <input
              type="number"
              placeholder="Max"
              value={priceMax}
              onChange={e => setPriceMax(e.target.value)}
              className="w-20 bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <span className="text-slate-400 text-xs">€</span>
            {(priceMin || priceMax) && (
              <button onClick={() => { setPriceMin(''); setPriceMax('') }}
                className="text-slate-500 hover:text-red-400 text-xs transition-colors">✕</button>
            )}
          </div>

          {/* Résultats */}
          <span className="ml-auto text-slate-500 text-xs">{filtered.length} produit(s)</span>
        </div>
      </div>
      {/* Grille produits */}
      {filtered.length === 0 ? (
        <p className="text-center text-slate-500 py-16">Aucun produit trouvé.</p>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {filtered.map(p => {
            const badge = getProductBadge(p.available_date)
            return (
              <Link key={p.id} to={`/produit/${p.id}`}
                className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-sky-500 hover:shadow-lg hover:shadow-sky-900/20 transition-all group flex flex-col">
                {/* Image */}
                <div className="relative bg-slate-900 flex items-center justify-center overflow-hidden"
                  style={{ height: '200px' }}>
                  {p.id_default_image && p.id_default_image !== '0' ? (
                    <img
                      src={`http://localhost/Prestashop/api/images/products/${p.id}/${p.id_default_image}?ws_key=${API_KEY}`}
                      alt={p.name}
                      className="max-w-full max-h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                      style={{ width: '100%', height: '100%' }}
                      onError={e => { e.target.style.display = 'none' }}
                    />
                  ) : (
                    <span className="text-5xl opacity-20">📦</span>
                  )}
                  {/* Badges */}
                  {badge && (
                    <span className={`absolute top-2 left-2 ${badge.color} text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg`}>
                      {badge.label}
                    </span>
                  )}
                  {p.quantity <= 0 && (
                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                      <span className="bg-red-900/80 text-red-300 text-xs font-bold px-3 py-1 rounded-full border border-red-700">
                        Rupture
                      </span>
                    </div>
                  )}
                </div>
                {/* Infos */}
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-slate-500 text-xs mb-1 font-mono">{p.reference}</p>
                  <h3 className="text-white font-semibold text-sm mb-auto group-hover:text-sky-400 transition-colors line-clamp-2 leading-snug">
                    {p.name}
                  </h3>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700">
                    <span className="text-sky-400 font-bold text-lg">{p.price} €</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.quantity > 0 ? 'bg-emerald-900/60 text-emerald-400' : 'bg-red-900/60 text-red-400'
                    }`}>
                      {p.quantity > 0 ? `${p.quantity} en stock` : 'Rupture'}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </FrontofficeLayout>
  )
}

const getProductBadge = (dateStr) => {
  if (!dateStr || dateStr === '0000-00-00') return null
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = (now - date) / (1000 * 60 * 60 * 24)
  if (diffDays >= 0 && diffDays <= 1) return { label: 'HOT', color: 'bg-red-500' }
  if (diffDays > 1 && diffDays <= 7) return { label: 'NEW', color: 'bg-sky-500' }
  return null
}