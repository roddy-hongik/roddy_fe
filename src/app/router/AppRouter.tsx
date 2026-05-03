import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AdminGuard from '@/routes/AdminGuard'
import ProtectedRoute from '@/routes/ProtectedRoute'
import { ROUTES, routePatterns } from '@/routes/paths'

const MainPage = lazy(() => import('@/home/pages/MainPage'))
const JobPostingsPage = lazy(() => import('@/jobs/pages/JobPostingsPage'))
const JobPostingDetailPage = lazy(() => import('@/jobs/pages/JobPostingDetailPage'))
const StudyListPage = lazy(() => import('@/study/pages/StudyListPage'))
const StudyWritePage = lazy(() => import('@/study/pages/StudyWritePage'))
const StudyDetailPage = lazy(() => import('@/study/pages/StudyDetailPage'))
const LoginPage = lazy(() => import('@/login/pages/LoginPage'))
const OnboardingPage = lazy(() => import('@/onboarding/pages/OnboardingPage'))
const GithubConnectPage = lazy(() => import('@/onboarding/pages/GithubConnectPage'))
const AnalysisWaitingPage = lazy(() => import('@/onboarding/pages/AnalysisWaitingPage'))
const ProfileLayout = lazy(() => import('@/profile/components/ProfileLayout'))
const ProfilePage = lazy(() => import('@/profile/pages/ProfilePage'))
const ProfileSavedPage = lazy(() => import('@/profile/pages/ProfileSavedPage'))
const ProfileEditPage = lazy(() => import('@/profile/pages/ProfileEditPage'))
const ProfileReanalyzePage = lazy(() => import('@/profile/pages/ProfileReanalyzePage'))
const MyReportsPage = lazy(() => import('@/profile/pages/MyReportsPage'))
const DetailedAnalysisReportPage = lazy(() => import('@/profile/pages/DetailedAnalysisReportPage'))
const AnalysisPaymentPage = lazy(() => import('@/profile/pages/AnalysisPaymentPage'))
const TermsPage = lazy(() => import('@/profile/pages/TermsPage'))
const CommunityListPage = lazy(() => import('@/community/pages/CommunityListPage'))
const CommunityDetailPage = lazy(() => import('@/community/pages/CommunityDetailPage'))
const CommunityWritePage = lazy(() => import('@/community/pages/CommunityWritePage'))
const MockInterviewPage = lazy(() => import('@/mockInterview/pages/MockInterviewPage'))
const RoadmapPage = lazy(() => import('@/roadmap/pages/RoadmapPage'))
const AdminLayout = lazy(() => import('@/admin/components/AdminLayout'))
const AdminCrawlingPage = lazy(() => import('@/admin/pages/AdminCrawlingPage'))
const AdminModerationPage = lazy(() => import('@/admin/pages/AdminModerationPage'))
const AdminGraphPage = lazy(() => import('@/admin/pages/AdminGraphPage'))
const NotificationsPage = lazy(() => import('@/notifications/pages/NotificationsPage'))

function RouteFallback() {
  return (
    <div className="app-shell app-route-fallback" role="status" aria-live="polite">
      페이지를 불러오는 중입니다...
    </div>
  )
}

export function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <div className="app-shell">
        <Routes>
          <Route path={ROUTES.home} element={<MainPage />} />
          <Route path={ROUTES.jobs} element={<JobPostingsPage />} />
          <Route path={routePatterns.jobDetail} element={<JobPostingDetailPage />} />
          <Route path={ROUTES.study} element={<StudyListPage />} />
          <Route
            path={ROUTES.studyWrite}
            element={
              <ProtectedRoute>
                <StudyWritePage />
              </ProtectedRoute>
            }
          />
          <Route path={routePatterns.studyDetail} element={<StudyDetailPage />} />
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route
            path={ROUTES.reports}
            element={
              <ProtectedRoute>
                <MyReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={routePatterns.reportDetailAnalysis}
            element={
              <ProtectedRoute>
                <DetailedAnalysisReportPage />
              </ProtectedRoute>
            }
          />
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
            <Route path="saved" element={<ProfileSavedPage />} />
            <Route path="edit" element={<ProfileEditPage />} />
            <Route path="re-analyze" element={<ProfileReanalyzePage />} />
          </Route>
          <Route
            path={ROUTES.notifications}
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
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
            path={ROUTES.mockInterview}
            element={
              <ProtectedRoute>
                <MockInterviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.roadmap}
            element={
              <ProtectedRoute>
                <RoadmapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.admin}
            element={
              <AdminGuard>
                <AdminLayout />
              </AdminGuard>
            }
          >
            <Route index element={<Navigate to={ROUTES.adminCrawling} replace />} />
            <Route path="crawling" element={<AdminCrawlingPage />} />
            <Route path="moderation" element={<AdminModerationPage />} />
            <Route path="graph-db" element={<AdminGraphPage />} />
          </Route>
          <Route path={ROUTES.community} element={<CommunityListPage />} />
          <Route
            path={ROUTES.communityWrite}
            element={
              <ProtectedRoute>
                <CommunityWritePage />
              </ProtectedRoute>
            }
          />
          <Route path={`${ROUTES.community}/:id`} element={<CommunityDetailPage />} />
          <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
        </Routes>
      </div>
    </Suspense>
  )
}
