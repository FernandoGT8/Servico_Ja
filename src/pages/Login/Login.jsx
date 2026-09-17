import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, User } from 'lucide-react'
import { useAuth } from '@/contexts/useAuth'
import { login as loginRequest } from '@/services/authService'

const inputClassName =
  'h-11 w-full rounded-md bg-slate-100 px-4 text-base font-medium text-gray-500 outline-none placeholder:text-gray-500 focus:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60'
const labelClassName = 'text-sm font-medium text-slate-600'

// lucide-react não traz logos de marca (o "Apple" dele é a fruta) — os três
// glyphs abaixo são os traçados oficiais (mesmos usados em botões de "Entrar
// com X"), embutidos como SVG em vez de mais uma dependência.
function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" {...props}>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20c11.045 0 20-8.955 20-20 0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  )
}

function AppleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" {...props}>
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zm3.532-3.221c.843-1.012 1.4-2.427 1.245-3.831-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.701z" />
    </svg>
  )
}

function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="#1877F2" className="h-5 w-5" {...props}>
      <path d="M22 12.06C22 6.48 17.52 2 11.94 2 6.36 2 1.88 6.48 1.88 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.42V9.91c0-2.39 1.42-3.71 3.6-3.71 1.04 0 2.13.19 2.13.19v2.35h-1.2c-1.18 0-1.55.73-1.55 1.48v1.77h2.64l-.42 2.91h-2.22V22c4.78-.76 8.44-4.92 8.44-9.94z" />
    </svg>
  )
}

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
              {/* Recuperação de senha ainda é backlog (PRD §4.1) — aponta
                  para o stub em pages/ForgotPassword/ até a tela existir. */}
              <Link to="/forgot-password" className="self-end text-xs text-slate-500">
                Esqueceu a senha?
              </Link>
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
              className="flex size-12 cursor-not-allowed items-center justify-center rounded-3xl bg-white shadow-[0px_1px_3px_0px_rgba(50,50,71,0.10)]"
            >
              <GoogleIcon />
            </button>
            <button
              type="button"
              disabled
              aria-label="Login com Apple"
              className="flex size-12 cursor-not-allowed items-center justify-center rounded-3xl bg-white text-stone-800 shadow-[0px_1px_3px_0px_rgba(50,50,71,0.10)]"
            >
              <AppleIcon />
            </button>
            <button
              type="button"
              disabled
              aria-label="Login com Facebook"
              className="flex size-12 cursor-not-allowed items-center justify-center rounded-3xl bg-white shadow-[0px_1px_3px_0px_rgba(50,50,71,0.10)]"
            >
              <FacebookIcon />
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
