import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Auth from './pages/Auth'
import About from './pages/About'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Dashboard from './pages/dashboard/Dashboard'
import { AuthProvider } from './components/auth/AuthContext'
import { Toaster } from 'sonner'

function App() {

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />

          {/* Private Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard/*" element={<Dashboard />} />
          </Route>
        </Routes>

        <Toaster 
          position="top-right"
          richColors
          closeButton />

      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
