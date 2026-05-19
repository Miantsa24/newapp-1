import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function CustomerProtectedRoute({ children }) {
  const { customer } = useAuth()
  if (!customer) return <Navigate to="/shop/login" replace />
  return children
}