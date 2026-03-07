import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import { MainPage } from './home'
import { JobPostingDetailPage, JobPostingsPage } from './jobs'
import { LoginPage } from './login'
import { GithubConnectPage, OnboardingPage } from './onboarding'
import ProtectedRoute from './routes/ProtectedRoute'

function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/jobs" element={<JobPostingsPage />} />
        <Route path="/jobs/:jobId" element={<JobPostingDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding/github"
          element={
            <ProtectedRoute>
              <GithubConnectPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
