import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const mainLinks = [
  { to: '/', label: '📊 Dashboard' },
  { to: '/produits', label: 'Produits' },
  { to: '/clients', label: 'Clients' },
  { to: '/commandes', label: 'Commandes' },
  { to: '/stocks', label: 'Stocks' },
]

const catalogLinks = [
  { to: '/categories', label: '🗂️ Catégories' },
  { to: '/marques', label: '🏷️ Marques' },
  { to: '/fournisseurs', label: '🏭 Fournisseurs' },
  { to: '/promotions', label: '🎟️ Promotions' },
]

const configLinks = [
  { to: '/transporteurs', label: '🚚 Transporteurs' },
  { to: '/taxes', label: '💶 Taxes' },
  { to: '/adresses', label: '📍 Adresses' },
]

const actionLinks = [
  { to: '/import', label: 'Import' },
  { to: '/reinitialisation', label: 'Réinitialisation' },
]

function Dropdown({ label, links, menuKey, openMenu, onToggle, onClose, pathname }) {
  return (
    <div className="relative">
      <button
        onClick={() => onToggle(menuKey)}
        className={`text-sm font-medium transition-colors flex items-center gap-1 ${
          links.some(l => l.to === pathname) ? 'text-sky-400' : 'text-slate-400 hover:text-slate-100'
        }`}
      >
        {label} {openMenu === menuKey ? '▲' : '▼'}
      </button>
      {openMenu === menuKey && (
        <div className="absolute top-8 left-0 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 min-w-48 z-50">
          {links.map(link => (
            <Link key={link.to} to={link.to}
              onClick={onClose}
              className={`block px-4 py-2.5 text-sm transition-colors ${pathname === link.to ? 'text-sky-400 bg-slate-700' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const { pathname } = useLocation()
  const [openMenu, setOpenMenu] = useState(null)

  const toggle = (menu) => setOpenMenu(openMenu === menu ? null : menu)

  return (
    <nav className="bg-slate-950 px-8 py-4 flex items-center gap-6 shadow-lg border-b border-slate-800 relative">
      <span className="text-sky-400 font-bold text-xl tracking-tight mr-2">🛍️ NewApp</span>

      {mainLinks.map(link => (
        <Link key={link.to} to={link.to}
          className={`text-sm font-medium transition-colors duration-200 ${pathname === link.to ? 'text-sky-400 border-b-2 border-sky-400 pb-0.5' : 'text-slate-400 hover:text-slate-100'}`}>
          {link.label}
        </Link>
      ))}

      <Dropdown
        label="Catalogue"
        links={catalogLinks}
        menuKey="catalogue"
        openMenu={openMenu}
        onToggle={toggle}
        onClose={() => setOpenMenu(null)}
        pathname={pathname}
      />
      <Dropdown
        label="Config"
        links={configLinks}
        menuKey="config"
        openMenu={openMenu}
        onToggle={toggle}
        onClose={() => setOpenMenu(null)}
        pathname={pathname}
      />

      <div className="ml-auto flex items-center gap-4">
        {actionLinks.map(link => (
          <Link key={link.to} to={link.to}
            className={`text-sm font-medium transition-colors ${pathname === link.to ? 'text-sky-400 border-b-2 border-sky-400 pb-0.5' : 'text-slate-400 hover:text-slate-100'}`}>
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}