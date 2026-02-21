import { SignIn } from '@clerk/clerk-react'
import { useUIStore } from '@/store'

export default function AuthPage() {
  const { theme } = useUIStore()
  const logoSrc = theme === 'dark' ? '/polydeal_logo_dark.png' : '/polydeal_logo_light.png'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <img
              src={logoSrc}
              alt="PolyDeal Logo"
              className="mx-auto h-16 w-16 object-contain mb-4"
            />
            <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-300">
              Sign in to access your deal intelligence dashboard.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-emerald-900/20 backdrop-blur">
            <SignIn />
          </div>
        </div>
      </div>
    </div>
  )
}
