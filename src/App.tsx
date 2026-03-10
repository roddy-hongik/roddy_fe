import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import { MainPage } from './home'
import { JobPostingDetailPage, JobPostingsPage } from './jobs'
import { LoginPage } from './login'
import { AnalysisWaitingPage, GithubConnectPage, OnboardingPage } from './onboarding'
import {
  AnalysisPaymentPage,
  DetailedAnalysisReportPage,
  ProfileEditPage,
  ProfileLayout,
  ProfilePage,
  ProfileReanalyzePage,
  TermsPage,
} from './profile'
import { CommunityDetailPage, CommunityListPage, CommunityWritePage } from './community'
import ProtectedRoute from './routes/ProtectedRoute'
import { ROUTES, routePatterns } from './routes/paths'

function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path={ROUTES.home} element={<MainPage />} />
        <Route path={ROUTES.jobs} element={<JobPostingsPage />} />
        <Route path={routePatterns.jobDetail} element={<JobPostingDetailPage />} />
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route
          path={ROUTES.reportsDetailAnalysis}
          element={
            <ProtectedRoute>
              <DetailedAnalysisReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.reportsPayment}
          element={
            <ProtectedRoute>
              <AnalysisPaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.profile}
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
        <Route path={ROUTES.terms} element={<TermsPage />} />
        <Route
          path={ROUTES.onboarding}
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.onboardingGithub}
          element={
            <ProtectedRoute>
              <GithubConnectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.onboardingWaiting}
          element={
            <ProtectedRoute>
              <AnalysisWaitingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.community}
          element={
            <ProtectedRoute>
              <CommunityListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={`${ROUTES.community}/write`}
          element={
            <ProtectedRoute>
              <CommunityWritePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={`${ROUTES.community}/:id`}
          element={
            <ProtectedRoute>
              <CommunityDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
    </div>
  )
}

export default App
