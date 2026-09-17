import { Routes, Route } from 'react-router-dom'
import RequireAuth from './components/RequireAuth/RequireAuth'
import Home from './pages/Website/Home/Home'
import Business from './pages/Website/Business/Business'
import Partners from './pages/Website/Partners/Partners'
import Login from './pages/Login/Login'
import RegisterClient from './pages/RegisterClient/RegisterClient'
import RegisterProvider from './pages/RegisterProvider/RegisterProvider'
import ContractNew from './pages/ContractNew/ContractNew'
import ContractDetail from './pages/ContractDetail/ContractDetail'
import ProviderOpportunities from './pages/ProviderOpportunities/ProviderOpportunities'
import ClientProfile from './pages/ClientProfile/ClientProfile'
import ClientBilling from './pages/ClientBilling/ClientBilling'
import ProviderProfile from './pages/ProviderProfile/ProviderProfile'
import Dashboard from './pages/Dashboard/Dashboard'
import Admin from './pages/Admin/Admin'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Site institucional — público */}
      <Route path="/" element={<Home />} />
      <Route path="/business" element={<Business />} />
      <Route path="/partners" element={<Partners />} />

      {/* Autenticação — público */}
      <Route path="/login" element={<Login />} />
      <Route path="/register/client" element={<RegisterClient />} />
      <Route path="/register/provider" element={<RegisterProvider />} />

      {/* Área logada — exige apenas estar autenticado */}
      <Route element={<RequireAuth />}>
        <Route path="/client/contracts/new" element={<ContractNew />} />
        <Route path="/contracts/:uuid" element={<ContractDetail />} />
        <Route path="/provider/opportunities" element={<ProviderOpportunities />} />
        <Route path="/client/profile/:uuid" element={<ClientProfile />} />
        <Route path="/client/profile/:uuid/billing" element={<ClientBilling />} />
        <Route path="/provider/profile/:uuid" element={<ProviderProfile />} />
      </Route>

      {/* Área interna do time Serviços Já! — landing pós-login de ADMIN/ANALISTA */}
      <Route element={<RequireAuth allowedRoles={['ADMIN', 'ANALISTA']} />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Backlog — sem frame no Figma, sem gate de role definido ainda */}
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}
