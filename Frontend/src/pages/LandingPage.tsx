import { Link } from 'react-router-dom'
import { useUIStore } from '@/store'

export default function LandingPage() {
  const { theme } = useUIStore()
  const logoSrc = theme === 'dark' ? '/reachiq_logo_dark.png' : '/reachiq_logo_light.png'

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.15),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.18),_transparent_60%)] bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <div className="flex items-center gap-3 mb-4">
          <img
            src={logoSrc}
            alt="ReachIQ Logo"
            className="h-12 w-12 object-contain"
          />
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-300/80">ReachIQ</p>
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Deal intelligence, engineered for clarity.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
          Surface intent, align teams, and move the right accounts faster. Sign in to
          access analytics, workflow automation, and signal tracking in one place.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            to="/auth"
            className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-300"
          >
            Sign in to ReachIQ
          </Link>
          <Link
            to="/auth"
            className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/40 hover:text-white"
          >
            Continue with Google
          </Link>
        </div>
        <div className="mt-12 grid gap-6 text-sm text-slate-300 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-slate-100">Unified signals</p>
            <p className="mt-2">Track intent, news, and engagement in a single view.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-slate-100">Smart workflows</p>
            <p className="mt-2">Prioritize accounts with AI-guided task automation.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-slate-100">Secure by design</p>
            <p className="mt-2">Clerk-managed auth with Google and email sign-in.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
