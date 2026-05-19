import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProducts, getProductStock, fetchProductCombinations } from '../../services/prestashopApi'
import { useCart } from '../../context/CartContext'
import FrontofficeLayout from '../../components/FrontofficeLayout'
const API_KEY = 'GFCDP1I7CKYKMVVN4QMGX81X4MCDMYPL'

export default function FicheProduit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [combinations, setCombinations] = useState([])
  const [selectedOptions, setSelectedOptions] = useState({})
  const [hasCombinations, setHasCombinations] = useState(false)

  useEffect(() => {
    Promise.all([getProducts(), getProductStock(id), fetchProductCombinations(id)])
      .then(([doc, stockDoc, combs]) => {
        const items = Array.from(doc.querySelectorAll('products > product'))
        const found = items.find(p => p.querySelector('id')?.textContent?.trim() === id)
        const stockNode = stockDoc.querySelector('stock_availables > stock_available')
        const qty = stockNode ? parseInt(stockNode.querySelector('quantity')?.textContent?.trim() || '0') : 0
        if (found) {
          setProduct({
            id: found.querySelector('id')?.textContent?.trim(),
            name: found.querySelector('name language')?.textContent?.trim() || 'Sans nom',
            price: parseFloat(found.querySelector('price')?.textContent?.trim() || 0).toFixed(2),
            id_default_image: found.querySelector('id_default_image')?.textContent?.trim() || null,
            reference: found.querySelector('reference')?.textContent?.trim() || '',
            description: found.querySelector('description language')?.textContent?.trim() || '',
            description_short: found.querySelector('description_short language')?.textContent?.trim() || '',
            active: found.querySelector('active')?.textContent?.trim(),
            quantity: qty,
            weight: found.querySelector('weight')?.textContent?.trim(),
            condition: found.querySelector('condition')?.textContent?.trim(),
            manufacturer_name: found.querySelector('manufacturer_name')?.textContent?.trim() || '—',
          })
        }
        if (combs.length > 0) {
          setCombinations(combs)
          setHasCombinations(true)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])
  

  // Groupe les options des combinaisons : { groupName → Set<valueName> }
  const optionGroups = {}
  combinations.forEach(c => {
    c.options.forEach(o => {
      if (!optionGroups[o.groupName]) optionGroups[o.groupName] = []
      if (!optionGroups[o.groupName].find(v => v.valueId === o.valueId))
        optionGroups[o.groupName].push({ valueId: o.valueId, valueName: o.valueName })
    })
  })

  // Trouve la combinaison correspondant aux options sélectionnées
  const selectedCombination = hasCombinations
    ? combinations.find(c =>
        Object.values(selectedOptions).every(vid =>
          c.options.some(o => o.valueId === vid)
        ) && c.options.length === Object.keys(selectedOptions).length
      )
    : null

  const availableStock = selectedCombination ? selectedCombination.stock
    : hasCombinations ? null
    : product?.quantity ?? 0

  const handleAddToCart = () => {
    if (!product) return
    if (availableStock === null || availableStock <= 0) return
    const cartProduct = selectedCombination
      ? { ...product, combinationId: selectedCombination.id,
          combination_label: selectedCombination.options.map(o => o.valueName).join(' / ') }
      : product
    addToCart(cartProduct, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) return (
    <FrontofficeLayout>
      <div className="animate-pulse">
        <div className="h-8 bg-slate-700 rounded w-48 mb-8" />
        <div className="grid grid-cols-2 gap-8">
          <div className="h-96 bg-slate-700 rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-700 rounded w-3/4" />
            <div className="h-4 bg-slate-700 rounded w-1/2" />
            <div className="h-16 bg-slate-700 rounded" />
          </div>
        </div>
      </div>
    </FrontofficeLayout>
  )

  if (!product) return (
    <FrontofficeLayout>
      <p className="text-slate-400 text-center py-16">Produit introuvable.</p>
    </FrontofficeLayout>
  )

  return (
    <FrontofficeLayout>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <button onClick={() => navigate('/')} className="hover:text-white transition-colors">
          Accueil
        </button>
        <span>›</span>
        <span className="text-white">{product.name}</span>
      </div>

      <div className="grid grid-cols-2 gap-10">
        {/* Image */}
        <div className="bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-700"
          style={{ height: '420px' }}>
          {product.id_default_image && product.id_default_image !== '0' ? (
            <img
              src={`http://localhost/Prestashop/api/images/products/${product.id}/${product.id_default_image}?ws_key=${API_KEY}`}
              alt={product.name}
              className="object-contain rounded-2xl p-6"
              style={{ maxWidth: '100%', maxHeight: '420px', width: '100%', height: '100%' }}
              onError={e => {
                e.target.style.display = 'none'
                e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><span style="font-size:5rem;opacity:0.2">📦</span></div>'
              }}
            />
          ) : (
            <span className="text-8xl opacity-20">📦</span>
          )}
        </div>

        {/* Infos */}
        <div>
          <p className="text-slate-400 text-sm font-mono mb-1">{product.reference}</p>
          <h1 className="text-3xl font-bold text-white mb-3">{product.name}</h1>

          {product.description_short && (
            <div
              className="text-slate-300 text-sm mb-4 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.description_short }}
            />
          )}

          {/* Prix */}
          <p className="text-4xl font-bold text-sky-400 mb-5">
            {selectedCombination
              ? (parseFloat(product.price) + (selectedCombination.priceImpact || 0)).toFixed(2)
              : product.price} €
          </p>

          {/* ── Déclinaisons (karazany) ── */}
          {hasCombinations && (
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 mb-5">
              {Object.entries(optionGroups).map(([groupName, values]) => (
                <div key={groupName} className="mb-3 last:mb-0">
                  <p className="text-slate-300 text-sm font-semibold mb-2">
                    {groupName || 'Variante'}
                    {selectedOptions[groupName]
                      ? <span className="text-sky-400 font-normal ml-2">
                          — {values.find(v => v.valueId === selectedOptions[groupName])?.valueName}
                        </span>
                      : <span className="text-red-400 text-xs font-normal ml-2">* obligatoire</span>
                    }
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {values.map(v => (
                      <button
                        key={v.valueId}
                        onClick={() => { setSelectedOptions(prev => ({ ...prev, [groupName]: v.valueId })); setQuantity(1) }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                          selectedOptions[groupName] === v.valueId
                            ? 'bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-900/40'
                            : 'bg-slate-900 border-slate-600 text-slate-300 hover:border-sky-400 hover:text-white'
                        }`}
                      >
                        {v.valueName}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Stock de la déclinaison sélectionnée */}
              {selectedCombination && (
                <p className={`mt-3 text-sm font-medium ${selectedCombination.stock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {selectedCombination.stock > 0
                    ? `En stock — ${selectedCombination.stock} unité(s) disponible(s)`
                    : 'Rupture de stock pour cette déclinaison'}
                </p>
              )}
            </div>
          )}

          {/* Stock produit simple */}
          {!hasCombinations && (
            <p className={`text-sm font-medium mb-5 ${(product.quantity ?? 0) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {(product.quantity ?? 0) > 0
                ? `En stock — ${product.quantity} unité(s) disponible(s)`
                : 'Rupture de stock'}
            </p>
          )}

          {/* Quantité + Ajout panier */}
          <div className="flex items-center gap-3 mb-6">
            {/* Sélecteur quantité — masqué si pas de déclinaison choisie ou rupture */}
            {(!hasCombinations ? (product.quantity ?? 0) > 0
                               : selectedCombination && selectedCombination.stock > 0) && (
              <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors text-lg">−</button>
                <span className="px-5 py-3 text-white font-semibold min-w-12 text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(availableStock ?? 99, q + 1))}
                  className="px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors text-lg">+</button>
              </div>
            )}

            {/* Bouton panier — désactivé si déclinaison non choisie */}
            <button
              onClick={handleAddToCart}
              disabled={hasCombinations
                ? !selectedCombination || selectedCombination.stock <= 0
                : (product.quantity ?? 0) <= 0}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                added
                  ? 'bg-emerald-600 text-white scale-95'
                  : hasCombinations && !selectedCombination
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : (availableStock ?? 0) <= 0
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-sky-500 hover:bg-sky-600 text-white'
              }`}
            >
              {added ? '✅ Ajouté au panier !'
                : hasCombinations && !selectedCombination ? 'Choisissez une déclinaison'
                : (availableStock ?? 0) <= 0 ? 'Rupture de stock'
                : '🛒 Ajouter au panier'}
            </button>
          </div>

          {/* Détails */}
          <div className="bg-slate-800 rounded-xl p-4 mb-6 grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-400">Marque</span>
              <p className="text-white font-medium">{product.manufacturer_name}</p>
            </div>
            <div>
              <span className="text-slate-400">Poids</span>
              <p className="text-white font-medium">{product.weight} kg</p>
            </div>
            <div>
              <span className="text-slate-400">État</span>
              <p className="text-white font-medium capitalize">{product.condition}</p>
            </div>
            <div>
              <span className="text-slate-400">Référence</span>
              <p className="text-white font-mono text-xs">{product.reference}</p>
            </div>
          </div>

          {/* Description complète */}
          {product.description && (
            <div>
              <h3 className="text-white font-semibold mb-3">Description</h3>
              <div
                className="text-slate-400 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}
        </div>
      </div>
    </FrontofficeLayout>
  )
}
