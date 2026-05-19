import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  importProducts,
  importCustomer,
  importCategory,
  importSupplier,
  importManufacturer,
  importCartRule,
  importCarrier,
  importTax,
} from '../services/prestashopApi'

const IMPORT_FNS = {
  importProducts,
  importCustomer,
  importCategory,
  importSupplier,
  importManufacturer,
  importCartRule,
  importCarrier,
  importTax,
}

const MODULES = [
  {
    key: 'products',
    label: 'Produits',
    icon: '📦',
    fields: ['name', 'price', 'reference', 'description', 'quantity', 'active', 'wholesale_price', 'ean13', 'weight'],
    importFn: 'importProducts'
  },
  {
    key: 'customers',
    label: 'Clients',
    icon: '👥',
    fields: ['firstname', 'lastname', 'email', 'active', 'birthday', 'newsletter'],
    importFn: 'importCustomer'
  },
  {
    key: 'categories',
    label: 'Catégories',
    icon: '🗂️',
    fields: ['name', 'description', 'active', 'parent'],
    importFn: 'importCategory'
  },
  {
    key: 'suppliers',
    label: 'Fournisseurs',
    icon: '🏭',
    fields: ['name', 'description', 'active'],
    importFn: 'importSupplier'
  },
  {
    key: 'manufacturers',
    label: 'Marques',
    icon: '🏷️',
    fields: ['name', 'description', 'active'],
    importFn: 'importManufacturer'
  },
  {
    key: 'cart_rules',
    label: 'Promotions',
    icon: '🎟️',
    fields: ['name', 'code', 'reduction_percent', 'reduction_amount', 'active', 'date_from', 'date_to', 'quantity'],
    importFn: 'importCartRule'
  },
  {
    key: 'carriers',
    label: 'Transporteurs',
    icon: '🚚',
    fields: ['name', 'delay', 'active', 'is_free'],
    importFn: 'importCarrier'
  },
  {
    key: 'taxes',
    label: 'Taxes',
    icon: '💶',
    fields: ['name', 'rate', 'active'],
    importFn: 'importTax'
  },
]

const SEPARATORS = [
  { value: ',', label: 'Virgule ( , )' },
  { value: ';', label: 'Point-virgule ( ; )' },
  { value: '|', label: 'Pipe ( | )' },
  { value: '\t', label: 'Tabulation' },
]

const MULTI_SEPARATORS = [
  { value: ',', label: 'Virgule ( , )' },
  { value: '|', label: 'Pipe ( | )' },
  { value: ';', label: 'Point-virgule ( ; )' },
]

export default function Import() {
  const [method, setMethod] = useState(null)

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Import de données</h1>
      <p className="text-slate-400 text-sm mb-8">Choisissez votre méthode d'importation</p>

      {!method ? (
        <div className="grid grid-cols-2 gap-6 max-w-2xl">
          <button
            onClick={() => setMethod('auto')}
            className="bg-slate-800 border-2 border-slate-700 hover:border-sky-500 rounded-xl p-8 text-left transition-all duration-200 group"
          >
            <span className="text-4xl mb-4 block">⚡</span>
            <h2 className="text-white font-bold text-lg mb-2 group-hover:text-sky-400 transition-colors">
              Import automatique
            </h2>
            <p className="text-slate-400 text-sm">
              Déposez votre fichier, l'application détecte automatiquement le module correspondant.
            </p>
            <span className="mt-4 inline-block text-xs bg-sky-900 text-sky-400 px-3 py-1 rounded-full">
              Rapide
            </span>
          </button>

          <button
            onClick={() => setMethod('manual')}
            className="bg-slate-800 border-2 border-slate-700 hover:border-violet-500 rounded-xl p-8 text-left transition-all duration-200 group"
          >
            <span className="text-4xl mb-4 block">⚙️</span>
            <h2 className="text-white font-bold text-lg mb-2 group-hover:text-violet-400 transition-colors">
              Import avancé
            </h2>
            <p className="text-slate-400 text-sm">
              Choisissez le module, configurez les séparateurs et mappez les colonnes manuellement.
            </p>
            <span className="mt-4 inline-block text-xs bg-violet-900 text-violet-400 px-3 py-1 rounded-full">
              Personnalisable
            </span>
          </button>
        </div>
      ) : method === 'auto' ? (
        <ImportAuto onBack={() => setMethod(null)} />
      ) : (
        <ImportManuel onBack={() => setMethod(null)} />
      )}
    </div>
  )
}

function ImportAuto({ onBack }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState([])
  const [detectedModule, setDetectedModule] = useState(null)
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const detectModule = (headers) => {
    if (headers.some(h => ['price', 'reference', 'weight'].includes(h.toLowerCase()))) return 'products'
    if (headers.some(h => ['email', 'firstname', 'lastname'].includes(h.toLowerCase()))) return 'customers'
    if (headers.some(h => ['total_paid', 'id_customer', 'current_state'].includes(h.toLowerCase()))) return 'orders'
    return null
  }

  const detectSeparator = (content) => {
    const firstLine = content.split('\n')[0]
    const counts = {
      ';': (firstLine.match(/;/g) || []).length,
      ',': (firstLine.match(/,/g) || []).length,
      '|': (firstLine.match(/\|/g) || []).length,
      '\t': (firstLine.match(/\t/g) || []).length,
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
  }  

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'text/xml': ['.xml'], 'text/csv': ['.csv'] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const f = acceptedFiles[0]
      setFile(f)
      setStatus(null)
      setDetectedModule(null)
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target.result
        if (f.name.endsWith('.xml')) parseXml(content)
        else {
          const sep = detectSeparator(content)
          parseCsv(content, sep)
        }
      }
      reader.readAsText(f)
    }
  })

  const parseXml = (content) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'application/xml')
    const rootChildren = doc.documentElement.children
    const firstTag = rootChildren[0]?.tagName || ''
    let module = null
    if (firstTag === 'product' || firstTag === 'products') module = 'products'
    else if (firstTag === 'customer' || firstTag === 'customers') module = 'customers'
    else if (firstTag === 'order' || firstTag === 'orders') module = 'orders'
    setDetectedModule(module || 'products')
    const items = doc.querySelectorAll(firstTag)
    const list = Array.from(items).slice(0, 5).map(el => {
      const obj = {}
      Array.from(el.children).forEach(child => {
        obj[child.tagName] = child.textContent.trim()
      })
      return obj
    })
    setPreview(list)
  }

  const parseCsv = (content, sep) => {
    const lines = content.split('\n').filter(l => l.trim())
    const headers = lines[0].split(sep).map(x => x.trim().replace(/^"|"$/g, ''))
    setDetectedModule(detectModule(headers) || 'products')
    const rows = lines.slice(1, 6).map(line => {
      const values = line.split(sep)
      const obj = {}
      headers.forEach((h, i) => {
        obj[h] = (values[i] || '').trim().replace(/^"|"$/g, '')
      })
      return obj
    })
    setPreview(rows)
  }

  const handleImport = async () => {
    if (!preview.length) return
    setLoading(true)
    setStatus(null)
    try {
      const mod = MODULES.find(m => m.key === detectedModule)
      const fn = IMPORT_FNS[mod?.importFn] || importProducts
      for (const item of preview) {
        await fn(item)
      }
      setStatus({ type: 'success', message: `${preview.length} élément(s) importé(s) avec succès !` })
    } catch (err) {
      setStatus({ type: 'error', message: err.message })
    }
    setLoading(false)
  }

  const foundModule = MODULES.find(m => m.key === detectedModule)

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        ← Retour
      </button>

      <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-all duration-200 mb-6 ${isDragActive ? 'border-sky-500 bg-sky-500/10' : 'border-slate-600 bg-slate-800 hover:border-slate-500'}`}>
        <input {...getInputProps()} />
        <p className="text-4xl mb-4">📂</p>
        <p className="text-slate-300">
          {isDragActive ? 'Déposez le fichier ici...' : 'Glissez-déposez un fichier XML ou CSV'}
        </p>
        {file && <p className="mt-3 text-sky-400 font-semibold">✓ {file.name}</p>}
      </div>

      {detectedModule && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">{foundModule?.icon}</span>
          <div>
            <p className="text-white font-semibold">Module détecté : {foundModule?.label}</p>
            <p className="text-slate-400 text-sm">Le fichier sera importé dans le module {foundModule?.label}</p>
          </div>
          <span className="ml-auto bg-emerald-900 text-emerald-400 text-xs px-3 py-1 rounded-full">Auto-détecté</span>
        </div>
      )}

      {preview.length > 0 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-slate-700">
            <p className="text-white font-semibold text-sm">Aperçu des données ({preview.length} premières lignes)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-950 text-slate-300 text-left">
                  {Object.keys(preview[0]).map(k => (
                    <th key={k} className="px-4 py-3 font-semibold">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-b border-slate-700 hover:bg-slate-700 transition-colors">
                    {Object.values(row).map((v, j) => (
                      <td key={j} className="px-4 py-3 text-slate-300 max-w-xs truncate">{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {preview.length > 0 && (
        <button
          onClick={handleImport}
          disabled={loading}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${loading ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-sky-500 hover:bg-sky-600 text-white'}`}
        >
          {loading ? 'Import en cours...' : `Importer dans ${foundModule?.label}`}
        </button>
      )}

      {status && (
        <div className={`mt-4 px-4 py-3 rounded-lg text-sm font-medium ${status.type === 'success' ? 'bg-emerald-900 text-emerald-400' : 'bg-red-900 text-red-400'}`}>
          {status.message}
        </div>
      )}
    </div>
  )
}

function ImportManuel({ onBack }) {
  const [step, setStep] = useState(1)
  const [selectedModule, setSelectedModule] = useState(null)
  const [file, setFile] = useState(null)
  const [separator, setSeparator] = useState(',')
  const [multiSeparator, setMultiSeparator] = useState('|')
  const [skipFirst, setSkipFirst] = useState(true)
  const [preview, setPreview] = useState([])
  const [headers, setHeaders] = useState([])
  const [mapping, setMapping] = useState({})
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'text/xml': ['.xml'], 'text/csv': ['.csv'] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0])
      setStatus(null)
    }
  })

  const handleParseFile = () => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
        const content = e.target.result
        if (file.name.endsWith('.csv')) {
        const sep = separator
        const lines = content.split('\n').filter(l => l.trim())
        const h = lines[0].split(sep).map(x => x.trim())
        setHeaders(h)
        const initMapping = {}
        h.forEach(col => {
            const match = selectedModule.fields.find(f =>
            f.toLowerCase() === col.toLowerCase() ||
            col.toLowerCase().includes(f.toLowerCase())
            )
            if (match) initMapping[col] = match
        })
        setMapping(initMapping)
        const rows = lines.slice(skipFirst ? 1 : 0, 6).map(line => {
            const values = line.split(sep)
            const obj = {}
            h.forEach((hdr, i) => { obj[hdr] = values[i]?.trim() || '' })
            return obj
        })
        setPreview(rows)
        } else {
        const parser = new DOMParser()
        const doc = parser.parseFromString(content, 'application/xml')
        const tag = selectedModule.key.slice(0, -1)
        const items = doc.querySelectorAll(tag)
        const h = selectedModule.fields
        setHeaders(h)
        const initMapping = {}
        h.forEach(f => { initMapping[f] = f })
        setMapping(initMapping)
        const rows = Array.from(items).slice(0, 5).map(el => {
            const obj = {}
            h.forEach(f => { obj[f] = el.querySelector(f)?.textContent?.trim() || '' })
            return obj
        })
        setPreview(rows)
        }
        setStep(3)
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    setLoading(true)
    try {
      const fn = IMPORT_FNS[selectedModule?.importFn] || importProducts
      for (const row of preview) {
        const mapped = {}
        Object.entries(mapping).forEach(([col, field]) => {
          if (field) mapped[field] = row[col]
        })
        await fn(mapped)
      }
      setStatus({ type: 'success', message: `Import réussi — ${preview.length} éléments importés` })
      setStep(4)
    } catch (err) {
      setStatus({ type: 'error', message: err.message })
      setStep(4)
    }
    setLoading(false)
  }

  const steps = ['Module', 'Fichier & Config', 'Mapping', 'Résultat']

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        ← Retour
      </button>

      {/* Stepper */}
      <div className="flex items-center gap-0 mb-10">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className={`flex items-center gap-2 ${i + 1 === step ? 'text-sky-400' : i + 1 < step ? 'text-emerald-400' : 'text-slate-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${i + 1 === step ? 'border-sky-400 bg-sky-400/10' : i + 1 < step ? 'border-emerald-400 bg-emerald-400/10' : 'border-slate-600 bg-slate-800'}`}>
                {i + 1 < step ? '✓' : i + 1}
              </div>
              <span className="text-sm font-medium">{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 ${i + 1 < step ? 'bg-emerald-400' : 'bg-slate-700'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Étape 1 — Choix du module */}
      {step === 1 && (
        <div>
          <h2 className="text-white font-bold text-lg mb-4">Choisissez le module à importer</h2>
          <div className="grid grid-cols-2 gap-4 max-w-xl">
            {MODULES.map(m => (
              <button
                key={m.key}
                onClick={() => { setSelectedModule(m); setStep(2) }}
                className="bg-slate-800 border-2 border-slate-700 hover:border-violet-500 rounded-xl p-6 text-left transition-all group"
              >
                <span className="text-3xl mb-3 block">{m.icon}</span>
                <p className="text-white font-semibold group-hover:text-violet-400 transition-colors">{m.label}</p>
                <p className="text-slate-500 text-xs mt-1">{m.fields.slice(0, 3).join(', ')}...</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Étape 2 — Fichier et configuration */}
      {step === 2 && (
        <div className="max-w-2xl">
          <h2 className="text-white font-bold text-lg mb-4">
            Configuration — {selectedModule?.icon} {selectedModule?.label}
          </h2>

          <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all mb-6 ${isDragActive ? 'border-violet-500 bg-violet-500/10' : 'border-slate-600 bg-slate-800 hover:border-slate-500'}`}>
            <input {...getInputProps()} />
            <p className="text-3xl mb-3">📂</p>
            <p className="text-slate-300 text-sm">Glissez-déposez votre fichier XML ou CSV</p>
            {file && <p className="mt-2 text-violet-400 font-semibold text-sm">✓ {file.name}</p>}
          </div>

          {file?.name.endsWith('.csv') && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
              <h3 className="text-white font-semibold mb-4">Options CSV</h3>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Séparateur de champs</label>
                  <select
                    value={separator}
                    onChange={e => setSeparator(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {SEPARATORS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 text-sm block mb-2">Séparateur valeurs multiples</label>
                  <select
                    value={multiSeparator}
                    onChange={e => setMultiSeparator(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {MULTI_SEPARATORS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="skipFirst"
                  checked={skipFirst}
                  onChange={e => setSkipFirst(e.target.checked)}
                  className="w-4 h-4 accent-violet-500"
                />
                <label htmlFor="skipFirst" className="text-slate-300 text-sm">
                  La première ligne contient les en-têtes de colonnes
                </label>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-medium transition-colors"
            >
              Retour
            </button>
            <button
              onClick={handleParseFile}
              disabled={!file}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${!file ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-violet-500 hover:bg-violet-600 text-white'}`}
            >
              Suivant — Mapper les colonnes
            </button>
          </div>
        </div>
      )}

      {/* Étape 3 — Mapping des colonnes */}
      {step === 3 && (
        <div>
          <h2 className="text-white font-bold text-lg mb-2">Mapping des colonnes</h2>
          <p className="text-slate-400 text-sm mb-6">Associez les colonnes de votre fichier aux champs PrestaShop</p>

          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden mb-6">
            <div className="grid grid-cols-3 bg-slate-950 px-5 py-3 text-slate-300 text-sm font-semibold">
              <span>Colonne fichier</span>
              <span>Champ PrestaShop</span>
              <span>Aperçu</span>
            </div>
            {headers.map(col => (
              <div key={col} className="grid grid-cols-3 px-5 py-3 border-t border-slate-700 items-center hover:bg-slate-700/50 transition-colors">
                <span className="text-white font-mono text-sm">{col}</span>
                <select
                  value={mapping[col] || ''}
                  onChange={e => setMapping(prev => ({ ...prev, [col]: e.target.value }))}
                  className="bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 mr-4"
                >
                  <option value="">-- Ignorer --</option>
                  {selectedModule?.fields.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <span className="text-slate-400 text-xs truncate">
                  {preview[0]?.[col] || '—'}
                </span>
              </div>
            ))}
          </div>

          {/* Aperçu des données */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden mb-6">
            <div className="px-5 py-3 border-b border-slate-700">
              <p className="text-white font-semibold text-sm">Aperçu des données importées</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-950 text-slate-300 text-left">
                    {headers.map(h => (
                      <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-b border-slate-700 hover:bg-slate-700 transition-colors">
                      {headers.map((h, j) => (
                        <td key={j} className="px-4 py-3 text-slate-300 max-w-xs truncate">{row[h]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-medium transition-colors"
            >
              Retour
            </button>
            <button
              onClick={handleImport}
              disabled={loading}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${loading ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-violet-500 hover:bg-violet-600 text-white'}`}
            >
              {loading ? 'Import en cours...' : `Importer ${preview.length} élément(s)`}
            </button>
          </div>
        </div>
      )}

      {/* Étape 4 — Résultat */}
      {step === 4 && (
        <div className="max-w-md">
          {status?.type === 'success' ? (
            <div className="bg-slate-800 border border-emerald-700 rounded-xl p-8 text-center">
              <p className="text-5xl mb-4">✅</p>
              <h2 className="text-white font-bold text-xl mb-2">Import réussi !</h2>
              <p className="text-emerald-400 mb-6">{status.message}</p>
              <button
                onClick={() => { setStep(1); setFile(null); setPreview([]); setStatus(null); setSelectedModule(null) }}
                className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Nouvel import
              </button>
            </div>
          ) : (
            <div className="bg-slate-800 border border-red-700 rounded-xl p-8 text-center">
              <p className="text-5xl mb-4">❌</p>
              <h2 className="text-white font-bold text-xl mb-2">Erreur d'import</h2>
              <p className="text-red-400 mb-6">{status?.message}</p>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Réessayer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}