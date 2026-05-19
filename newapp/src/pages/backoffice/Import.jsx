import { useState } from 'react'
import JSZip from 'jszip'
import {
  importCategory,
  importProducts,
  importCustomer,
  createOrderFromData,
  uploadProductImage,
  getCustomerByEmail,
  upsertStockAvailable,
  getFirstId,
  createAttributeGroup,
  createAttributeValue,
  createCombination,
  updateCombinationStock,
  updateProductStock,
} from '../../services/prestashopApi'

// ─── Parsing ────────────────────────────────────────────────────────────────

const parseCsvRobust = (content) => {
  const sep = detectSeparator(content)
  const lines = content.split('\n').filter(l => l.trim())
  const headers = lines[0].split(sep).map(h => h.trim().replace(/^"|"$/g, ''))
  const rows = lines.slice(1).map(line => {
    const values = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
          continue
        }
        inQuotes = !inQuotes
        continue
      }
      else if (line[i] === sep && !inQuotes) { values.push(current.trim()); current = '' }
      else current += line[i]
    }
    values.push(current.trim())
    const obj = {}
    headers.forEach((h, i) => {
      const key = h.toLowerCase().trim().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '_')
      obj[key] = (values[i] || '').replace(/^"|"$/g, '')
    })
    return obj
  }).filter(row => Object.values(row).some(v => v))
  return { headers, rows }
}

const detectSeparator = (content) => {
  const first = content.split('\n')[0]
  const counts = { ';': 0, ',': 0, '|': 0, '\t': 0 }
  for (const c of first) if (counts[c] !== undefined) counts[c]++
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
}

const detectModuleFromHeaders = (headers) => {
  const h = headers.map(x => x.toLowerCase())
  if (h.some(x => ['karazany', 'stock_initial', 'specificité', 'specificite'].includes(x))) return 'variants'
  if (h.some(x => ['achat', 'etat', 'pwd'].includes(x))) return 'orders'
  if (h.some(x => ['prix_ttc', 'prix_vente_ttc', 'price tax excluded'].includes(x))) return 'products'
  if (h.some(x => ['email', 'firstname', 'first name'].includes(x))) return 'customers'
  if (h.some(x => ['categorie', 'category', 'parent'].includes(x))) return 'categories'
  return 'unknown'
}

const parseNumber = (value) => {
  if (value === null || value === undefined) return 0
  const cleaned = String(value).replace(',', '.').replace(/\s/g, '')
  const num = parseFloat(cleaned)
  return Number.isNaN(num) ? 0 : num
}

// ─── Validation ─────────────────────────────────────────────────────────────

const normalizeHeader = (h) =>
  (h || '').toLowerCase().trim()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '_')

const EXPECTED_HEADERS = {
  products: ['date_availability_produit', 'nom', 'reference', 'prix_ttc', 'taxe', 'categorie', 'prix_achat'],
  variants: ['reference', 'specificite', 'karazany', 'stock_initial', 'prix_vente_ttc'],
  orders: ['date', 'nom', 'email', 'pwd', 'adresse', 'achat', 'etat'],
}

const DATE_FIELDS_BY_MODULE = {
  products: ['date_availability_produit'],
  orders: ['date'],
}

const POSITIVE_FIELDS_BY_MODULE = {
  products: ['prix_ttc', 'prix_achat'],
  variants: ['prix_vente_ttc', 'stock_initial'],
}

const DATE_REGEX = /^\d{2}\/\d{2}\/\d{4}$/

const validateCsv = (headers, rows, module) => {
  const issues = []
  if (module === 'unknown') return issues

  const normHeaders = headers.map(normalizeHeader)

  // 1 — Colonnes obligatoires
  const expected = EXPECTED_HEADERS[module]
  if (expected) {
    const missing = expected.filter(h => !normHeaders.includes(h))
    if (missing.length > 0) {
      issues.push({
        type: 'error',
        message: `Colonnes non conformes ou manquantes : ${missing.join(', ')}`
      })
    }
  }

  // 2 — Format de date et montants positifs
  const dateFields = DATE_FIELDS_BY_MODULE[module] || []
  const positiveFields = POSITIVE_FIELDS_BY_MODULE[module] || []

  rows.forEach((row, i) => {
    const line = i + 2

    for (const field of dateFields) {
      const key = Object.keys(row).find(k => normalizeHeader(k) === field)
      const val = key ? row[key] : ''
      if (val && !DATE_REGEX.test(val)) {
        issues.push({
          type: 'error',
          message: `Ligne ${line} — « ${key} » : format de date invalide « ${val} » (attendu JJ/MM/AAAA)`
        })
      }
    }

    for (const field of positiveFields) {
      const key = Object.keys(row).find(k => normalizeHeader(k) === field)
      const raw = key ? row[key] : ''
      if (raw !== '' && raw !== undefined && raw !== null) {
        const num = parseFloat(String(raw).replace(',', '.').replace(/\s/g, ''))
        if (!isNaN(num) && num < 0) {
          issues.push({
            type: 'error',
            message: `Ligne ${line} — « ${key} » : montant négatif (${raw})`
          })
        }
      }
    }
  })

  return issues
}

// ─── Labels modules ──────────────────────────────────────────────────────────

const MODULE_LABELS = {
  products: { label: 'Produits', icon: '📦', color: 'text-blue-400 border-blue-700' },
  variants: { label: 'Variantes/Stocks', icon: '🔢', color: 'text-violet-400 border-violet-700' },
  orders: { label: 'Clients & Commandes', icon: '👥', color: 'text-emerald-400 border-emerald-700' },
  customers: { label: 'Clients', icon: '👤', color: 'text-teal-400 border-teal-700' },
  categories: { label: 'Catégories', icon: '🗂️', color: 'text-amber-400 border-amber-700' },
  unknown: { label: 'Inconnu', icon: '❓', color: 'text-slate-400 border-slate-600' },
}

// ─── Sous-composant : une ligne de fichier CSV ───────────────────────────────

function CsvRow({ index, onRemove, onParsed }) {
  const [file, setFile] = useState(null)
  const [module, setModule] = useState(null)
  const [rowCount, setRowCount] = useState(0)
  const [issues, setIssues] = useState([])

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const { headers, rows } = parseCsvRobust(ev.target.result)
      const detected = detectModuleFromHeaders(headers)
      const validationIssues = validateCsv(headers, rows, detected)
      setModule(detected)
      setRowCount(rows.length)
      setIssues(validationIssues)
      onParsed(index, { file: f, rows, headers, module: detected, issues: validationIssues })
    }
    reader.readAsText(f)
  }

  const meta = MODULE_LABELS[module] || MODULE_LABELS.unknown

  return (
    <>
    <div className={`bg-slate-800 border rounded-xl p-4 flex items-center gap-4 transition-all ${
      file ? `border-2 ${meta.color.split(' ')[1]}` : 'border-slate-700'
    }`}>
      <span className="text-slate-500 text-sm w-5 text-center">{index + 1}</span>

      <label className="flex-1 cursor-pointer">
        <input type="file" accept=".csv" className="hidden" onChange={handleFile} />
        <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
          file ? 'bg-slate-700' : 'bg-slate-900 hover:bg-slate-700 border border-dashed border-slate-600'
        }`}>
          <span className="text-lg">{file ? meta.icon : '📄'}</span>
          <div className="flex-1 min-w-0">
            {file ? (
              <>
                <p className="text-white text-sm font-medium truncate">{file.name}</p>
                <p className={`text-xs mt-0.5 ${meta.color.split(' ')[0]}`}>
                  {meta.label} — {rowCount} ligne(s)
                </p>
              </>
            ) : (
              <p className="text-slate-400 text-sm">Cliquez pour choisir un fichier CSV</p>
            )}
          </div>
          {file && (
            <span className={`text-xs px-2 py-0.5 rounded-full border ${meta.color}`}>
              {meta.label}
            </span>
          )}
        </div>
      </label>

      <button
        onClick={() => onRemove(index)}
        className="text-slate-600 hover:text-red-400 transition-colors text-lg px-2"
        title="Supprimer"
      >
        ✕
      </button>
    </div>

    {/* Erreurs de validation */}
    {issues.length > 0 && (
      <div className="mt-2 bg-red-900/20 border border-red-700/50 rounded-lg px-4 py-3 space-y-1">
        <p className="text-red-400 text-xs font-semibold mb-1">⛔ {issues.length} erreur(s) de validation :</p>
        {issues.map((issue, i) => (
          <p key={i} className="text-red-300 text-xs">• {issue.message}</p>
        ))}
      </div>
    )}
    </>
  )
}

// ─── Sous-composant : une ligne de fichier ZIP ───────────────────────────────

function ZipRow({ index, onRemove, onParsed }) {
  const [file, setFile] = useState(null)
  const [imageCount, setImageCount] = useState(0)
  const [names, setNames] = useState([])

  const handleFile = async (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    try {
      const zip = await JSZip.loadAsync(f)
      const imgs = []
      zip.forEach((path, entry) => {
        if (!entry.dir && /\.(jpg|jpeg|png|gif|webp)$/i.test(path))
          imgs.push({ path, name: path.split('/').pop(), entry })
      })
      setImageCount(imgs.length)
      setNames(imgs.map(i => i.name).slice(0, 6))
      onParsed(index, { file: f, images: imgs })
    } catch (err) {
      console.warn('ZIP invalide ou illisible', err)
    }
  }

  return (
    <div className={`bg-slate-800 border rounded-xl p-4 flex items-center gap-4 transition-all ${
      file ? 'border-2 border-amber-600' : 'border-slate-700'
    }`}>
      <span className="text-slate-500 text-sm w-5 text-center">{index + 1}</span>

      <label className="flex-1 cursor-pointer">
        <input type="file" accept=".zip" className="hidden" onChange={handleFile} />
        <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
          file ? 'bg-slate-700' : 'bg-slate-900 hover:bg-slate-700 border border-dashed border-slate-600'
        }`}>
          <span className="text-lg">🖼️</span>
          <div className="flex-1 min-w-0">
            {file ? (
              <>
                <p className="text-white text-sm font-medium truncate">{file.name}</p>
                <p className="text-amber-400 text-xs mt-0.5">{imageCount} image(s) détectée(s)</p>
                {names.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {names.map(n => (
                      <span key={n} className="text-xs bg-slate-900 text-amber-300 px-1.5 py-0.5 rounded font-mono">{n}</span>
                    ))}
                    {imageCount > 6 && <span className="text-xs text-slate-500">+{imageCount - 6}</span>}
                  </div>
                )}
              </>
            ) : (
              <p className="text-slate-400 text-sm">Cliquez pour choisir un fichier ZIP d'images</p>
            )}
          </div>
          {file && (
            <span className="text-xs px-2 py-0.5 rounded-full border border-amber-700 text-amber-400">
              Images
            </span>
          )}
        </div>
      </label>

      <button
        onClick={() => onRemove(index)}
        className="text-slate-600 hover:text-red-400 transition-colors text-lg px-2"
        title="Supprimer"
      >
        ✕
      </button>
    </div>
  )
}

// ─── Page principale ─────────────────────────────────────────────────────────

export default function BackofficeImport() {
  const [csvSlots, setCsvSlots] = useState([{ id: 0 }])
  const [zipSlots, setZipSlots] = useState([{ id: 0 }])
  const [csvData, setCsvData] = useState({})
  const [zipData, setZipData] = useState({})
  const [step, setStep] = useState('idle') // idle | running | done
  const [progress, setProgress] = useState({ label: '', current: 0, total: 0 })
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  // ── Gestion des slots ──

  const addCsvSlot = () => setCsvSlots(prev => [...prev, { id: Date.now() }])
  const removeCsvSlot = (idx) => {
    setCsvSlots(prev => prev.filter((_, i) => i !== idx))
    setCsvData(prev => { const n = { ...prev }; delete n[idx]; return n })
  }

  const addZipSlot = () => setZipSlots(prev => [...prev, { id: Date.now() }])
  const removeZipSlot = (idx) => {
    setZipSlots(prev => prev.filter((_, i) => i !== idx))
    setZipData(prev => { const n = { ...prev }; delete n[idx]; return n })
  }

  const onCsvParsed = (idx, data) => setCsvData(prev => ({ ...prev, [idx]: data }))
  const onZipParsed = (idx, data) => setZipData(prev => ({ ...prev, [idx]: data }))

  // ── Résumé avant import ──

  const allCsvFiles = Object.values(csvData).filter(Boolean)
  const allZipFiles = Object.values(zipData).filter(Boolean)

  const summary = {
    categories: allCsvFiles.filter(f => f.module === 'categories').reduce((s, f) => s + [...new Set(f.rows.map(r => r.categorie || r.name).filter(Boolean))].length, 0),
    products: allCsvFiles.filter(f => f.module === 'products').reduce((s, f) => s + f.rows.length, 0),
    variants: allCsvFiles.filter(f => f.module === 'variants').reduce((s, f) => s + f.rows.length, 0),
    customers: allCsvFiles.filter(f => ['customers', 'orders'].includes(f.module)).reduce((s, f) => s + [...new Map(f.rows.map(r => [r.email, r])).values()].length, 0),
    orders: allCsvFiles.filter(f => f.module === 'orders').reduce((s, f) => s + f.rows.length, 0),
    images: allZipFiles.reduce((s, f) => s + f.images.length, 0),
  }

  // ── Validation globale ──

  const allValidationErrors = allCsvFiles.flatMap(f => f.issues || [])
  const hasBlockingErrors = allValidationErrors.length > 0

  // ── Import ──

  const normStr = (s) => (s || '').toLowerCase().trim()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')

  const ETAT_LABEL_MAP = {
    'en attente paiement a la livraison': 'en attente de paiement a la livraison',
    'en attente': 'en attente du paiement par cheque',
    'paiement accepte': 'paiement accepte',
    'en preparation': 'en cours de preparation',
    'expedie': 'expedie',
    'livre': 'livre',
    'annule': 'annule',
    'rembourse': 'rembourse',
    'erreur de paiement': 'erreur de paiement',
  }

  const parseAchat = (str) => {
    if (!str) return []
    try {
      return str
        .replace(/\[|\]/g, '')
        .split('),(')
        .map(s => {
          const cleaned = s.replace(/[()]/g, '').trim()
          const parts = cleaned.split(';').map(p => p.replace(/"/g, '').trim())
          return {
            reference: parts[0],
            quantity: parseInt(parts[1]) || 1,
            variant: parts[2] || '',
          }
        })
        .filter(i => i.reference)
    } catch { return [] }
  }

  const runImport = async () => {
    setStep('running')
    setError(null)
    const res = { categories: 0, products: 0, variants: 0, customers: 0, orders: 0, images: 0, errors: [] }
    const catIds = {}
    const productIds = {}
    const combinationIds = {} // "REF_variant" → PS combination id
    const customerIds = {}
    const customerKeys = {}
    const allProducts = []
    const stockByRef = {}

    // Récupérer les vrais états de commande depuis PrestaShop
    let orderStateLabels = {}
    try {
      const { get } = await import('../../services/prestashopApi')
      const doc = await get('/order_states?display=full')
      const nodes = Array.from(doc.querySelectorAll('order_states > order_state'))
      for (const node of nodes) {
        const id = node.querySelector('id')?.textContent?.trim()
        const names = Array.from(node.querySelectorAll('name language'))
        for (const n of names) {
          const label = normStr(n.textContent)
          if (id && label) orderStateLabels[label] = id
        }
      }
      console.log('[Import] États disponibles:', orderStateLabels)
    } catch (e) {
      console.warn('[Import] Impossible de récupérer order_states:', e)
      orderStateLabels = { fallback: '1' }
    }

    const resolveEtat = (csvEtat) => {
      if (!csvEtat) return '1'
      const n = normStr(csvEtat)
      // Correspondance directe sur le nom PrestaShop
      if (orderStateLabels[n]) return orderStateLabels[n]
      // Via mapping intermédiaire (accents supprimés)
      const mapped = ETAT_LABEL_MAP[n]
      if (mapped && orderStateLabels[normStr(mapped)]) return orderStateLabels[normStr(mapped)]
      // Fallback : premier état dispo
      return Object.values(orderStateLabels)[0] || '1'
    }

    try {
      // 1 — Catégories
      for (const file of allCsvFiles.filter(f => f.module === 'categories')) {
        const cats = [...new Set(file.rows.map(r => r.name || r.categorie).filter(Boolean))]
        setProgress({ label: 'Catégories', current: 0, total: cats.length })
        for (let i = 0; i < cats.length; i++) {
          try {
            const xml = await importCategory({ name: cats[i], active: '1' })
            const doc = new DOMParser().parseFromString(xml, 'application/xml')
            const id = doc.querySelector('category id')?.textContent?.trim()
            if (id) catIds[cats[i]] = id
            res.categories++
          } catch (e) { res.errors.push(`Catégorie "${cats[i]}": ${e.message}`) }
          setProgress(p => ({ ...p, current: i + 1 }))
        }
      }

      // 2 — Catégories extraites des produits
      for (const file of allCsvFiles.filter(f => f.module === 'products')) {
        const cats = [...new Set(file.rows.map(r => r.categorie).filter(Boolean))]
        for (const cat of cats) {
          if (!catIds[cat]) {
            try {
              const xml = await importCategory({ name: cat, active: '1' })
              const doc = new DOMParser().parseFromString(xml, 'application/xml')
              const id = doc.querySelector('category id')?.textContent?.trim()
              if (id) { catIds[cat] = id; res.categories++ }
            } catch (err) {
              console.warn('Erreur creation categorie', err)
            }
          }
        }
      }

      // 3 — Produits
      for (const file of allCsvFiles.filter(f => f.module === 'variants')) {
        for (const row of file.rows) {
          const ref = row.reference
          if (!ref) continue
          const qty = parseNumber(row.stock_initial || row.stock || 0)
          stockByRef[ref] = (stockByRef[ref] || 0) + qty
        }
      }

      for (const file of allCsvFiles.filter(f => f.module === 'products')) {
        allProducts.push(...file.rows)
        setProgress({ label: 'Produits', current: 0, total: file.rows.length })
        for (let i = 0; i < file.rows.length; i++) {
          const row = file.rows[i]
          const categoryId = catIds[row.categorie] || catIds[row.category] || '2'
          const stockQty = stockByRef[row.reference] ?? 0
          try {
            const xml = await importProducts({
              name: row.nom || row.name,
              price: parseNumber(row.prix_ttc || row['Price tax excluded'] || row.price),
              reference: row.reference,
              wholesale_price: parseNumber(row.prix_achat || row['Wholesale price']),
              active: '1',
              id_category_default: categoryId,
              available_date: row.date_availability_produit?.split('T')[0] || '',
            })
            const doc = new DOMParser().parseFromString(xml, 'application/xml')
            const id = doc.querySelector('product id')?.textContent?.trim()
            if (id) {
              productIds[row.reference] = id
              await upsertStockAvailable(id, stockQty)
            }
            res.products++
          } catch (e) { res.errors.push(`Produit "${row.reference}": ${e.message}`) }
          setProgress(p => ({ ...p, current: i + 1 }))
        }
      }

      // ═══════════════════════════════════════════════════════
      // ÉTAPE 3 — VARIANTES & COMBINAISONS
      // ═══════════════════════════════════════════════════════

      const variantFiles = allCsvFiles.filter(f => f.module === 'variants')
      if (variantFiles.length > 0) {
        const allRows = variantFiles.flatMap(f => f.rows)

        // 3a — Groupes d'attributs (specificite)
        const groups = [...new Set(allRows.map(r => r.specificite).filter(Boolean))]
        setProgress({ label: "Groupes d'attributs", current: 0, total: groups.length })
        const groupIds = {}
        for (let i = 0; i < groups.length; i++) {
          try {
            const id = await createAttributeGroup(groups[i])
            if (id) groupIds[groups[i]] = id
            else res.errors.push(`Groupe attribut "${groups[i]}": ID non retourné`)
          } catch (e) { res.errors.push(`Groupe attribut "${groups[i]}": ${e.message}`) }
          setProgress(p => ({ ...p, current: i + 1 }))
        }

        // 3b — Valeurs d'attributs (karazany)
        const valueRows = allRows.filter(r => r.karazany && r.specificite)
        setProgress({ label: "Valeurs d'attributs", current: 0, total: valueRows.length })
        const valueIds = {}
        for (let i = 0; i < valueRows.length; i++) {
          const row = valueRows[i]
          const key = `${row.specificite}_${row.karazany}`
          if (!valueIds[key]) {
            if (!groupIds[row.specificite]) {
              res.errors.push(`Valeur "${row.karazany}": groupe "${row.specificite}" introuvable`)
            } else {
              try {
                const id = await createAttributeValue(groupIds[row.specificite], row.karazany)
                if (id) valueIds[key] = id
                else res.errors.push(`Valeur attribut "${row.karazany}": ID non retourné`)
              } catch (e) { res.errors.push(`Valeur attribut "${row.karazany}": ${e.message}`) }
            }
          }
          setProgress(p => ({ ...p, current: i + 1 }))
        }

        // 3c — Combinaisons par produit
        const productVariants = {}
        allRows.forEach(row => {
          if (!productVariants[row.reference]) productVariants[row.reference] = []
          productVariants[row.reference].push(row)
        })
        const allCombinations = Object.entries(productVariants)
        setProgress({ label: 'Combinaisons', current: 0, total: allCombinations.length })
        for (let i = 0; i < allCombinations.length; i++) {
          const [ref, variants] = allCombinations[i]
          const productId = productIds[ref]
          if (!productId) { res.errors.push(`Combinaison "${ref}": produit introuvable`); setProgress(p => ({ ...p, current: i + 1 })); continue }
          // Prix de base du produit (depuis fichier1) pour calculer l'impact de prix
          const baseProductRow = allProducts.find(p => p.reference === ref)
          const basePrice = parseNumber(baseProductRow?.prix_ttc || baseProductRow?.price || 0)
          for (const variant of variants) {
            const stock = parseInt(variant.stock_initial || 0)
            if (!variant.karazany) {
              try { await updateProductStock(productId, stock) } catch (e) { res.errors.push(`Stock "${ref}": ${e.message}`) }
              continue
            }
            const key = `${variant.specificite}_${variant.karazany}`
            const attrValueId = valueIds[key]
            if (!attrValueId) { res.errors.push(`Combinaison "${ref}/${variant.karazany}": valeur attribut introuvable`); continue }
            // Impact de prix = prix de la variante - prix de base du produit
            const variantPrice = parseNumber(variant.prix_vente_ttc || 0)
            const priceImpact = variantPrice > 0 ? +(variantPrice - basePrice).toFixed(6) : 0
            try {
              const combId = await createCombination(productId, [attrValueId], priceImpact, `${ref}_${variant.karazany}`)
              if (combId) {
                combinationIds[`${ref}_${variant.karazany}`] = combId
                res.variants++
                await updateCombinationStock(productId, combId, stock)
              } else {
                res.errors.push(`Combinaison "${ref}/${variant.karazany}": ID non retourné`)
              }
            } catch (e) { res.errors.push(`Combinaison "${ref}/${variant.karazany}": ${e.message}`) }
          }
          setProgress(p => ({ ...p, current: i + 1 }))
        }
      }

      // 4 — Clients & commandes
      // Récupérer le carrier actif — cherche l'id avec active=1, sinon fallback '2'
      const getActiveCarrierId = async () => {
        try {
          const { get } = await import('../../services/prestashopApi')
          const doc = await get('/carriers?display=full')
          const carriers = Array.from(doc.querySelectorAll('carriers > carrier'))
          // Filtrer active=1 et deleted=0, trier par id croissant
          const actives = carriers
            .filter(c =>
              c.querySelector('active')?.textContent?.trim() === '1' &&
              c.querySelector('deleted')?.textContent?.trim() === '0'
            )
            .map(c => parseInt(c.querySelector('id')?.textContent?.trim() || '99'))
            .sort((a, b) => a - b)
          if (actives.length > 0) return String(actives[0])
        } catch { }
        return '2'
      }

      // Récupérer l'ID de la France (pays actif requis pour les commandes)
      const getActiveFranceId = async () => {
        try {
          const { get } = await import('../../services/prestashopApi')
          const doc = await get('/countries?display=[id,iso_code,active]&filter[iso_code]=FR&filter[active]=1')
          const node = doc.querySelector('countries > country')
          const id = node?.querySelector('id')?.textContent?.trim()
          if (id) return id
        } catch { }
        return '8' // Fallback France
      }

      const [idCarrier, idCurrency, idLang, idCountry] = await Promise.all([
        getActiveCarrierId(),
        getFirstId('currencies'),
        getFirstId('languages'),
        getActiveFranceId(),
      ])
      console.log('[Import] Carrier actif:', idCarrier, '| Currency:', idCurrency, '| Lang:', idLang, '| Country:', idCountry)
      for (const file of allCsvFiles.filter(f => f.module === 'orders')) {
        const unique = [...new Map(file.rows.map(r => [r.email, r])).values()]
        setProgress({ label: 'Clients', current: 0, total: unique.length })
        for (let i = 0; i < unique.length; i++) {
          const row = unique[i]
          try {
            const xml = await importCustomer({
              firstname: row.nom, lastname: row.nom,
              email: row.email, passwd: row.pwd, active: '1',
            })
            const doc = new DOMParser().parseFromString(xml, 'application/xml')
            const id = doc.querySelector('customer id')?.textContent?.trim()
            if (id) {
              customerIds[row.email] = id
              const existing = await getCustomerByEmail(row.email)
              if (existing?.secure_key) customerKeys[row.email] = existing.secure_key
              res.customers++
            }
          } catch (e) {
            const existing = await getCustomerByEmail(row.email)
            if (existing?.id) {
              customerIds[row.email] = existing.id
              if (existing.secure_key) customerKeys[row.email] = existing.secure_key
            } else {
              res.errors.push(`Client "${row.email}": ${e.message}`)
            }
          }
          setProgress(p => ({ ...p, current: i + 1 }))
        }

        setProgress({ label: 'Commandes', current: 0, total: file.rows.length })
        for (let i = 0; i < file.rows.length; i++) {
          const row = file.rows[i]
          const customerId = customerIds[row.email]
          const stateName = row.etat || ''
          const psItems = parseAchat(row.achat)
            .map(item => {
              const productId = parseInt(productIds[item.reference])
              const combKey = `${item.reference}_${item.variant}`
              const attrId = combinationIds[combKey] ? parseInt(combinationIds[combKey]) : 0
              return { product_id: productId, quantity: item.quantity, id_product_attribute: attrId }
            })
            .filter(it => it.product_id > 0)

          if (customerId && psItems.length > 0) {
            try {
              const r = await fetch('/api-create-order', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Basic ' + btoa('GFCDP1I7CKYKMVVN4QMGX81X4MCDMYPL:'),
                },
                body: JSON.stringify({
                  customer_id: parseInt(customerId),
                  customer_email: row.email,
                  items: psItems,
                  order_state_label: stateName,
                  address: row.adresse || 'Adresse',
                }),
              })
              const data = await r.json()
              if (!r.ok || !data.success) throw new Error(data.error || `HTTP ${r.status}`)
              res.orders++
            } catch (e) { res.errors.push(`Commande "${row.email}": ${e.message}`) }
          } else {
            res.errors.push(`Commande ignorée: client ${row.email} introuvable ou panier vide`)
          }
          setProgress(p => ({ ...p, current: i + 1 }))
        }
      }

      // 5 — Clients seuls
      for (const file of allCsvFiles.filter(f => f.module === 'customers')) {
        setProgress({ label: 'Clients', current: 0, total: file.rows.length })
        for (let i = 0; i < file.rows.length; i++) {
          const row = file.rows[i]
          try {
            await importCustomer({
              firstname: row.firstname || row['First name'] || row.nom,
              lastname: row.lastname || row['Last name'] || row.nom,
              email: row.email, active: row.active || '1',
            })
            res.customers++
          } catch (e) { res.errors.push(`Client: ${e.message}`) }
          setProgress(p => ({ ...p, current: i + 1 }))
        }
      }

      // 6 — Images ZIP
      for (const zipFile of allZipFiles) {
        setProgress({ label: 'Images', current: 0, total: zipFile.images.length })
        for (let i = 0; i < zipFile.images.length; i++) {
          const img = zipFile.images[i]
          const ref = img.name.replace(/\.[^.]+$/, '')
          const productId = productIds[ref]
          if (productId) {
            try {
              const blob = await img.entry.async('blob')
              await uploadProductImage(productId, img.name, blob)
              res.images++
            } catch (e) { res.errors.push(`Image "${img.name}": ${e.message}`) }
          }
          setProgress(p => ({ ...p, current: i + 1 }))
        }
      }

    } catch (err) {
      setError(err.message)
    }

    setResults(res)
    setStep('done')
  }

  // ─── Rendu ────────────────────────────────────────────────────────────────

  const canImport = allCsvFiles.length > 0 || allZipFiles.length > 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Import des données</h1>
      <p className="text-slate-400 text-sm mb-8">
        Ajoutez vos fichiers CSV et/ou ZIP. Le module est détecté automatiquement.
      </p>

      {step === 'idle' && (
        <div className="space-y-8">
          {/* ── Section CSV ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold flex items-center gap-2">
                📄 Fichiers CSV
                <span className="text-slate-500 text-xs font-normal">({Object.keys(csvData).length} chargé(s))</span>
              </h2>
              <button
                onClick={addCsvSlot}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
              >
                <span className="text-lg font-bold">+</span> Ajouter un fichier CSV
              </button>
            </div>
            <div className="space-y-3">
              {csvSlots.map((slot, idx) => (
                <CsvRow
                  key={slot.id}
                  index={idx}
                  onRemove={removeCsvSlot}
                  onParsed={onCsvParsed}
                />
              ))}
            </div>
          </div>

          {/* ── Section ZIP ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold flex items-center gap-2">
                🖼️ Fichiers ZIP (images)
                <span className="text-slate-500 text-xs font-normal">({Object.keys(zipData).length} chargé(s))</span>
              </h2>
              <button
                onClick={addZipSlot}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
              >
                <span className="text-lg font-bold">+</span> Ajouter un fichier ZIP
              </button>
            </div>
            <div className="space-y-3">
              {zipSlots.map((slot, idx) => (
                <ZipRow
                  key={slot.id}
                  index={idx}
                  onRemove={removeZipSlot}
                  onParsed={onZipParsed}
                />
              ))}
            </div>
          </div>

          {/* ── Résumé ── */}
          {canImport && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">📊 Résumé de l'import</h3>
              <div className="grid grid-cols-6 gap-3 text-center mb-5">
                {[
                  { label: 'Catégories', value: summary.categories, color: 'text-amber-400' },
                  { label: 'Produits', value: summary.products, color: 'text-blue-400' },
                  { label: 'Variantes', value: summary.variants, color: 'text-violet-400' },
                  { label: 'Clients', value: summary.customers, color: 'text-teal-400' },
                  { label: 'Commandes', value: summary.orders, color: 'text-emerald-400' },
                  { label: 'Images', value: summary.images, color: 'text-orange-400' },
                ].map(s => (
                  <div key={s.label} className="bg-slate-900 rounded-xl p-3">
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Erreurs de validation globales */}
              {hasBlockingErrors && (
                <div className="bg-red-900/20 border border-red-700/60 rounded-xl p-4 mb-5">
                  <p className="text-red-400 font-semibold text-sm mb-2">
                    ⛔ {allValidationErrors.length} erreur(s) bloquante(s) — corrigez les fichiers avant d'importer
                  </p>
                  <ul className="space-y-1 max-h-40 overflow-y-auto">
                    {allValidationErrors.map((e, i) => (
                      <li key={i} className="text-red-300 text-xs">• {e.message}</li>
                    ))}
                  </ul>
                </div>
              )}

              {!hasBlockingErrors && (
                <div className="bg-amber-900/20 border border-amber-700/40 text-amber-400 text-xs px-4 py-2.5 rounded-lg mb-5">
                  ⚠️ L'import créera les catégories, puis les produits, puis les clients, puis les commandes, puis les images — dans cet ordre.
                </div>
              )}

              <button
                onClick={runImport}
                disabled={hasBlockingErrors}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${
                  hasBlockingErrors
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : 'bg-sky-500 hover:bg-sky-600 text-white'
                }`}
              >
                {hasBlockingErrors ? '⛔ Corrigez les erreurs pour continuer' : '🚀 Lancer l\'import'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Import en cours ── */}
      {step === 'running' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-10 text-center">
          <p className="text-4xl mb-4">⚙️</p>
          <h2 className="text-white font-bold text-xl mb-6">Import en cours...</h2>
          {progress.total > 0 && (
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>{progress.label}</span>
                <span>{progress.current}/{progress.total}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div
                  className="bg-sky-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.round((progress.current / progress.total) * 100)}%` }}
                />
              </div>
              <p className="text-slate-500 text-xs mt-2">Ne fermez pas cette page</p>
            </div>
          )}
        </div>
      )}

      {/* ── Résultats ── */}
      {step === 'done' && results && (
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-5xl mb-4">{results.errors.length === 0 ? '✅' : '⚠️'}</p>
            <h2 className="text-white font-bold text-2xl">
              {results.errors.length === 0 ? 'Import terminé !' : 'Import terminé avec avertissements'}
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Catégories', value: results.categories, color: 'border-amber-600' },
              { label: 'Produits', value: results.products, color: 'border-blue-600' },
              { label: 'Clients', value: results.customers, color: 'border-teal-600' },
              { label: 'Commandes', value: results.orders, color: 'border-emerald-600' },
              { label: 'Images', value: results.images, color: 'border-orange-600' },
              { label: 'Erreurs', value: results.errors.length, color: results.errors.length > 0 ? 'border-red-600' : 'border-slate-600' },
            ].map(s => (
              <div key={s.label} className={`bg-slate-800 border-2 ${s.color} rounded-xl p-5 text-center`}>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-slate-400 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {results.errors.length > 0 && (
            <div className="bg-red-900/20 border border-red-700 rounded-xl p-4 max-h-48 overflow-y-auto">
              <p className="text-red-400 font-semibold text-sm mb-2">Détail des erreurs :</p>
              {results.errors.map((e, i) => (
                <p key={i} className="text-red-300 text-xs py-0.5">• {e}</p>
              ))}
            </div>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg text-sm">
              ❌ {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => { setStep('idle'); setResults(null); setCsvData({}); setZipData({}) }}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-sm font-medium transition-colors"
            >
              Nouvel import
            </button>
            <a
              href="/"
              target="_blank"
              className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold text-sm transition-colors text-center"
            >
              🛍️ Voir la boutique
            </a>
          </div>
        </div>
      )}
    </div>
  )
}