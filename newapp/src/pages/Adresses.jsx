import { useState, useEffect } from 'react'
import { getAddresses } from '../services/prestashopApi'

export default function Adresses() {
  const [adresses, setAdresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getAddresses()
      .then(doc => {
        const items = doc.querySelectorAll('addresses > address')
        const list = Array.from(items).map(a => ({
          id: a.querySelector('id')?.textContent?.trim(),
          alias: a.querySelector('alias')?.textContent?.trim() || '—',
          firstname: a.querySelector('firstname')?.textContent?.trim() || '',
          lastname: a.querySelector('lastname')?.textContent?.trim() || '',
          address1: a.querySelector('address1')?.textContent?.trim() || '',
          city: a.querySelector('city')?.textContent?.trim() || '',
          postcode: a.querySelector('postcode')?.textContent?.trim() || '',
          phone: a.querySelector('phone')?.textContent?.trim() || '—',
          id_customer: a.querySelector('id_customer')?.textContent?.trim(),
          deleted: a.querySelector('deleted')?.textContent?.trim(),
        })).filter(a => a.id && a.deleted !== '1')
        setAdresses(list)
        setLoading(false)
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  const filtered = adresses.filter(a =>
    `${a.firstname} ${a.lastname}`.toLowerCase().includes(search.toLowerCase()) ||
    a.city.toLowerCase().includes(search.toLowerCase()) ||
    a.alias.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <p className="text-slate-400 mt-8 text-center">Chargement des adresses...</p>
  if (error) return <p className="text-red-400 mt-8 text-center">Erreur : {error}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">
          Adresses
          <span className="ml-2 text-sm font-normal text-slate-400">({adresses.length})</span>
        </h1>
        <input
          type="text"
          placeholder="Rechercher par nom ou ville..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg px-4 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-950 text-slate-300 text-left">
              <th className="px-5 py-3 font-semibold">ID</th>
              <th className="px-5 py-3 font-semibold">Alias</th>
              <th className="px-5 py-3 font-semibold">Nom</th>
              <th className="px-5 py-3 font-semibold">Adresse</th>
              <th className="px-5 py-3 font-semibold">Ville</th>
              <th className="px-5 py-3 font-semibold">CP</th>
              <th className="px-5 py-3 font-semibold">Téléphone</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a, i) => (
              <tr key={a.id} className={`border-b border-slate-700 hover:bg-slate-700 transition-colors ${i % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/50'}`}>
                <td className="px-5 py-3 text-slate-400">{a.id}</td>
                <td className="px-5 py-3">
                  <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-xs">{a.alias}</span>
                </td>
                <td className="px-5 py-3 font-medium text-white">{a.firstname} {a.lastname}</td>
                <td className="px-5 py-3 text-slate-300 max-w-xs truncate">{a.address1}</td>
                <td className="px-5 py-3 text-slate-300">{a.city}</td>
                <td className="px-5 py-3 text-slate-400">{a.postcode}</td>
                <td className="px-5 py-3 text-slate-400">{a.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-slate-500 py-12">Aucune adresse trouvée.</p>}
      </div>
    </div>
  )
}