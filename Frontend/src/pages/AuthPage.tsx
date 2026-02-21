import { SignIn } from '@clerk/clerk-react'

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/80">PolyDeal</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Welcome back</h1>
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
