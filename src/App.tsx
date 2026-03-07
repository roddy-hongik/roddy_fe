import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import { MainPage } from './home'
import { JobPostingDetailPage, JobPostingsPage } from './jobs'
import { LoginPage } from './login'
import { AnalysisWaitingPage, GithubConnectPage, OnboardingPage } from './onboarding'
import { ProfileEditPage, ProfileLayout, ProfilePage, ProfileReanalyzePage, TermsPage } from './profile'
import { CommunityDetailPage, CommunityListPage, CommunityWritePage } from './community'
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
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ProfilePage />} />
          <Route path="edit" element={<ProfileEditPage />} />
          <Route path="re-analyze" element={<ProfileReanalyzePage />} />
        </Route>
        <Route path="/terms" element={<TermsPage />} />
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
        <Route
          path="/onboarding/analysis-waiting"
          element={
            <ProtectedRoute>
              <AnalysisWaitingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <CommunityListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community/write"
          element={
            <ProtectedRoute>
              <CommunityWritePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community/:id"
          element={
            <ProtectedRoute>
              <CommunityDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
