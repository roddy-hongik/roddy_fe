import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './login'
import { OnboardingPage } from './onboarding'
import ProtectedRoute from './routes/ProtectedRoute'

function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  )
}

export default App
