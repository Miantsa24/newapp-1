import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import CustomerProtectedRoute from './components/CustomerProtectedRoute'
import BackofficeLayout from './components/BackofficeLayout'
import Login from './pages/Login'
import ShopLogin from './pages/frontoffice/ShopLogin'

// Backoffice
import BackofficeDashboard from './pages/backoffice/Dashboard'
import BackofficeCommandes from './pages/backoffice/Commandes'
import BackofficeImport from './pages/backoffice/Import'
import BackofficeReinit from './pages/backoffice/Reinitialisation'
import BackofficeStocks from './pages/backoffice/Stocks'

// Frontoffice
import Accueil from './pages/frontoffice/Accueil'
import FicheProduit from './pages/frontoffice/FicheProduit'
import Panier from './pages/frontoffice/Panier'
import Commande from './pages/frontoffice/Commande'
import Confirmation from './pages/frontoffice/Confirmation'
import MesCommandes from './pages/frontoffice/MesCommandes'

function App() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<Login />} />

      {/* Page d'accueil = liste utilisateurs (publique) */}
      <Route path="/" element={<ShopLogin />} />

      {/* Backoffice protégé employés */}
      <Route path="/backoffice/*" element={
        <ProtectedRoute>
          <BackofficeLayout>
            <Routes>
              <Route path="dashboard" element={<BackofficeDashboard />} />
              <Route path="commandes" element={<BackofficeCommandes />} />
              <Route path="import" element={<BackofficeImport />} />
              <Route path="reinitialisation" element={<BackofficeReinit />} />
              <Route path="stocks" element={<BackofficeStocks />} />
              <Route path="" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </BackofficeLayout>
        </ProtectedRoute>
      } />

      {/* Frontoffice protégé clients */}
      <Route path="/catalogue" element={
        <CustomerProtectedRoute>
          <Accueil />
        </CustomerProtectedRoute>
      } />
      <Route path="/produit/:id" element={
        <CustomerProtectedRoute>
          <FicheProduit />
        </CustomerProtectedRoute>
      } />
      <Route path="/panier" element={
        <CustomerProtectedRoute>
          <Panier />
        </CustomerProtectedRoute>
      } />
      <Route path="/commande" element={
        <CustomerProtectedRoute>
          <Commande />
        </CustomerProtectedRoute>
      } />
      <Route path="/confirmation" element={
        <CustomerProtectedRoute>
          <Confirmation />
        </CustomerProtectedRoute>
      } />
      <Route path="/mes-commandes" element={
        <CustomerProtectedRoute>
          <MesCommandes />
        </CustomerProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App