import { useParams } from 'react-router-dom'

export default function ClientProfile() {
  const { uuid } = useParams()
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold text-slate-800">Perfil do Cliente #{uuid}</h1>
      <p className="mt-2 text-slate-500">Em construção.</p>
    </div>
  )
}
