import { Routes, Route } from 'react-router-dom'
import RequireAuth from './components/RequireAuth/RequireAuth'
import Home from './pages/Website/Home/Home'
import Business from './pages/Website/Business/Business'
import Partners from './pages/Website/Partners/Partners'
import Login from './pages/Login/Login'
import FirstRegisterClient from './pages/FirstRegister/FirstRegisterClient'
import FirstRegisterProvider from './pages/FirstRegister/FirstRegisterProvider'
import RegisterClient from './pages/Register/RegisterClient'
import RegisterProvider from './pages/Register/RegisterProvider'
import ContractNew from './pages/ContractNew/ContractNew'
import ContractDetail from './pages/ContractDetail/ContractDetail'
import ProviderOpportunities from './pages/ProviderOpportunities/ProviderOpportunities'
import ClientProfile from './pages/ClientProfile/ClientProfile'
import ClientBilling from './pages/ClientBilling/ClientBilling'
import ProviderProfile from './pages/ProviderProfile/ProviderProfile'
import Dashboard from './pages/Dashboard/Dashboard'
import Admin from './pages/Admin/Admin'
import ForgotPassword from './pages/ForgotPassword/ForgotPassword'
import NotFoundRedirect from './components/NotFoundRedirect/NotFoundRedirect'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Site institucional — público */}
      <Route path="/" element={<Home />} />
      <Route path="/business" element={<Business />} />
      <Route path="/partners" element={<Partners />} />

      {/* Autenticação — público */}
      <Route path="/login" element={<Login />} />
      {/* Backlog (PRD §4.1) — sem frame no Figma ainda */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      {/* Primeira etapa do cadastro: só cria a conta (login) — Figma.log Sessão 11 */}
      <Route path="/register/client" element={<FirstRegisterClient />} />
      <Route path="/register/provider" element={<FirstRegisterProvider />} />

      {/* Área logada — exige apenas estar autenticado */}
      <Route element={<RequireAuth />}>
        <Route path="/client/contracts/new" element={<ContractNew />} />
        <Route path="/contracts/:uuid" element={<ContractDetail />} />
        <Route path="/provider/opportunities" element={<ProviderOpportunities />} />
        <Route path="/client/profile/:uuid" element={<ClientProfile />} />
        <Route path="/client/profile/:uuid/billing" element={<ClientBilling />} />
        <Route path="/provider/profile/:uuid" element={<ProviderProfile />} />
      </Route>

      {/* Segunda etapa do cadastro: completar o perfil, já autenticado — só o
          papel dono da conta acessa. Status continua Pendente até liberação
          do ADMIN/ANALISTA (PRD §3.5). */}
      <Route element={<RequireAuth allowedRoles={['CLIENTE']} />}>
        <Route path="/register/client/complete" element={<RegisterClient />} />
      </Route>
      <Route element={<RequireAuth allowedRoles={['PRESTADOR']} />}>
        <Route path="/register/provider/complete" element={<RegisterProvider />} />
      </Route>

      {/* Landing pós-login de todos os papéis — Dashboard.jsx é o dispatcher
          por papel (DashboardAdmin/Client/Provider), mesmo padrão de
          ClientProfile/ContractDetail/ClientBilling. */}
      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Backlog — sem frame no Figma, sem gate de role definido ainda */}
      <Route path="/admin" element={<Admin />} />

      {/* Nenhuma rota acima bateu: manda pra Home (deslogado) ou Dashboard
          (logado) em vez de deixar a tela em branco. */}
      <Route path="*" element={<NotFoundRedirect />} />
    </Routes>
  )
}
