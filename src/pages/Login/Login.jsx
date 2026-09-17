import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, User } from 'lucide-react'
import { useAuth } from '@/contexts/useAuth'
import { login as loginRequest } from '@/services/authService'

const inputClassName =
  'h-11 w-full rounded-md bg-slate-100 px-4 text-base font-medium text-gray-500 outline-none placeholder:text-gray-500 focus:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60'
const labelClassName = 'text-sm font-medium text-slate-600'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await loginRequest({ email, senha: password })
      login(data)
      setLoading(false)
      // Todo papel cai no /dashboard — dashAdmin/dashClient/dashProvider
      // (dispatcher por papel, mesmo padrão de ClientProfile) chegam numa
      // próxima seção; até lá a Sidebar mantém seu próprio link de Home.
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Erro ao conectar com o servidor. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-white md:flex-row">
      <div className="relative flex h-56 shrink-0 flex-col gap-5 overflow-hidden bg-zinc-700 px-8 py-6 md:h-auto md:w-1/2 md:justify-between md:px-14 md:py-13">
        <div className="flex w-44 items-center justify-center gap-3 rounded-full bg-gray-50 px-6 py-4">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-zinc-800">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="font-dm-sans text-base font-bold text-zinc-800">LOGO</span>
        </div>

        <div className="flex max-w-md flex-col gap-2 md:gap-4">
          <h1 className="font-dm-sans text-2xl leading-8 font-bold text-white md:text-4xl md:leading-12">
            Bem-vindo ao Serviço Já
          </h1>
          <p className="text-sm leading-6 text-white md:text-lg md:leading-8">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vulputate ut laoreet velit ma.
          </p>
        </div>

        <div
          className="hidden size-56 items-center justify-center rounded-full bg-white/10 md:flex"
          aria-hidden="true"
        >
          <User className="h-20 w-20 text-white/60" strokeWidth={1.5} />
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 md:px-12">
        <div className="flex w-full max-w-96 flex-col gap-7">
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-semibold leading-8 text-zinc-800 md:text-3xl md:leading-10">
              Bem-vindo de volta!
            </h2>
            <p className="text-sm leading-6 text-zinc-800 md:text-base">Acesse sua conta.</p>
          </div>

          {error && (
            <div className="rounded-md bg-red-100 px-3 py-2 text-sm text-red-800">{error}</div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-7">
            <label className="flex flex-col gap-2">
              <span className={labelClassName}>E-mail</span>
              <input
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className={inputClassName}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className={labelClassName}>Senha</span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  className={`${inputClassName} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={loading}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 disabled:cursor-not-allowed"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Recuperação de senha ainda é backlog (PRD §4.1) — sem rota
                  para apontar, então o texto fica só informativo por ora. */}
              <span className="self-end text-xs text-slate-500">Esqueceu a senha?</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-neutral-900 px-6 py-4 text-center font-dm-sans text-base font-bold text-gray-50 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? 'Entrando...' : 'Login'}
            </button>
          </form>

          <div className="flex items-center gap-6">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-center text-xs font-medium text-slate-500">
              ou use sua conta vinculada
            </span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          {/* Login social é decisão pendente (PRD §9) — botões decorativos,
              sem provedor integrado ainda. */}
          <div className="flex justify-center gap-8">
            <button
              type="button"
              disabled
              aria-label="Login com Google"
              className="flex size-12 cursor-not-allowed items-center justify-center rounded-3xl bg-white text-base font-bold text-neutral-600 shadow-[0px_1px_3px_0px_rgba(50,50,71,0.10)]"
            >
              G
            </button>
            <button
              type="button"
              disabled
              aria-label="Login com Apple"
              className="flex size-12 cursor-not-allowed items-center justify-center rounded-3xl bg-white text-base font-bold text-stone-800 shadow-[0px_1px_3px_0px_rgba(50,50,71,0.10)]"
            >

            </button>
            <button
              type="button"
              disabled
              aria-label="Login com Facebook"
              className="flex size-12 cursor-not-allowed items-center justify-center rounded-3xl bg-white text-base font-bold text-neutral-600 shadow-[0px_1px_3px_0px_rgba(50,50,71,0.10)]"
            >
              f
            </button>
          </div>

          <div className="flex flex-col items-center gap-2 text-sm font-semibold">
            <p>
              <span className="text-slate-500">Você é Prestador de Serviços? </span>
              <Link to="/register/provider" className="text-neutral-900">
                Cadastre-se
              </Link>
            </p>
            <p>
              <span className="text-slate-500">Você tem uma Empresa? </span>
              <Link to="/register/client" className="text-neutral-900">
                Contrate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
