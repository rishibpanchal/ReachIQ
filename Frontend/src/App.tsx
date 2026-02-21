import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Companies from './pages/Companies'
import CompanyDetail from './pages/CompanyDetail'
import Workflow from './pages/Workflow'
import ContentGenerator from './pages/ContentGenerator'
import Signals from './pages/Signals'
import Conversations from './pages/Conversations'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import { useUIStore } from './store'

function App() {
  const theme = useUIStore((state) => state.theme)

  // Apply theme on mount and when it changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="companies" element={<Companies />} />
          <Route path="companies/:id" element={<CompanyDetail />} />
          <Route path="workflow" element={<Workflow />} />
          <Route path="workflow/:companyId" element={<Workflow />} />
          <Route path="content-generator" element={<ContentGenerator />} />
          <Route path="signals" element={<Signals />} />
          <Route path="conversations" element={<Conversations />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
