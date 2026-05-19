/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react'
import { loginEmployee, loginCustomer } from '../services/prestashopApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [employee, setEmployee] = useState(() => {
    const saved = sessionStorage.getItem('newapp_employee')
    return saved ? JSON.parse(saved) : null
  })

  const [customer, setCustomer] = useState(() => {
    const saved = sessionStorage.getItem('newapp_customer')
    return saved ? JSON.parse(saved) : null
  })

  const loginAsEmployee = async (email, password) => {
    const emp = await loginEmployee(email, password)
    if (!emp.active || emp.active === '0') throw new Error('Compte inactif')
    sessionStorage.setItem('newapp_employee', JSON.stringify(emp))
    setEmployee(emp)
    return emp
  }

  const loginAsCustomer = async (email, password) => {
    const cust = await loginCustomer(email, password)
    sessionStorage.setItem('newapp_customer', JSON.stringify(cust))
    setCustomer(cust)
    return cust
  }

  const logoutEmployee = () => {
    sessionStorage.removeItem('newapp_employee')
    setEmployee(null)
  }

  const logoutCustomer = () => {
    sessionStorage.removeItem('newapp_customer')
    setCustomer(null)
  }

  const loginAsCustomerDirect = (cust) => {
    sessionStorage.setItem('newapp_customer', JSON.stringify(cust))
    setCustomer(cust)
  }

  return (
    <AuthContext.Provider value={{
      employee, customer,
      loginAsEmployee, loginAsCustomer,
      logoutEmployee, logoutCustomer, 
      loginAsCustomerDirect,
      // Compatibilité avec l'ancien code
      user: employee?.email,
      login: async (email, password) => {
        await loginAsEmployee(email, password)
        return true
      },
      logout: () => logoutEmployee()
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
