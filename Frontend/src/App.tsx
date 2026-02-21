import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import Companies from '@/pages/Companies'
import CompanyDetail from '@/pages/CompanyDetail'
import Workflow from '@/pages/Workflow'
import ContentGenerator from '@/pages/ContentGenerator'
import Signals from '@/pages/Signals'
import Conversations from '@/pages/Conversations'
import Analytics from '@/pages/Analytics'
import Settings from '@/pages/Settings'
import AuthPage from '@/pages/AuthPage'
import DashboardPage from '@/pages/DashboardPage'
import LandingPage from '@/pages/LandingPage'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { useUIStore } from './store'

function ProtectedLayout() {
  return (
    <>
      <SignedIn>
        <Layout />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}

function App() {
  const theme = useUIStore((state) => state.theme)

  // Apply theme on mount and when it changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/companies/:id" element={<CompanyDetail />} />
        <Route path="/workflow" element={<Workflow />} />
        <Route path="/workflow/:companyId" element={<Workflow />} />
        <Route path="/content-generator" element={<ContentGenerator />} />
        <Route path="/signals" element={<Signals />} />
        <Route path="/conversations" element={<Conversations />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
