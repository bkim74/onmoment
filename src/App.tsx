import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import TabBar from './components/layout/TabBar'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import Main from './pages/Main'
import Response from './pages/Response'
import Timeline from './pages/Timeline'
import Gift from './pages/Gift'
import Settings from './pages/Settings'
import { useAuthStore } from './stores/useAuthStore'
import { useJourneyStore } from './stores/useJourneyStore'

const TAB_ROUTES = ['/main', '/timeline', '/settings']

export default function App() {
  const location = useLocation()
  const loadAuth = useAuthStore((s) => s.loadFromStorage)
  const loadJourney = useJourneyStore((s) => s.loadFromStorage)

  useEffect(() => {
    loadAuth()
    loadJourney()
  }, [loadAuth, loadJourney])

  const showTab = TAB_ROUTES.some((r) => location.pathname.startsWith(r))

  return (
    <div className="min-h-dvh flex flex-col">
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/main" element={<ProtectedRoute><Main /></ProtectedRoute>} />
          <Route path="/response/:day" element={<ProtectedRoute><Response /></ProtectedRoute>} />
          <Route path="/timeline" element={<ProtectedRoute><Timeline /></ProtectedRoute>} />
          <Route path="/gift/:id" element={<Gift />} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </main>
      {showTab && <TabBar />}
    </div>
  )
}
