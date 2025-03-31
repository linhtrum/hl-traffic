import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuthContext } from './context/AuthContext'
import Login from './pages/Login'
import Home from './pages/Home'
import Devices from './pages/Devices'
import DeviceDetail from './pages/DeviceDetail'
import Account from './pages/Account'
import Layout from './components/Layout'
import Customer from './pages/Customer'
import CustomerUsers from './pages/CustomerUsers'

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return children
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="devices" element={<Devices />} />
            <Route path="devices/:deviceId" element={<DeviceDetail />} />
            <Route path="account" element={<Account />} />
            <Route path="customers" element={<Customer />} />
            <Route path="customers/:customerId/users" element={<CustomerUsers />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
