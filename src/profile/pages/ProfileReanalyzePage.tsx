import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { requestAnalysis } from '../../api/services/reportService'
import { getProfileSummary } from '../../api/services/profileService'
import { ROUTES } from '../../routes/paths'
import { toDesiredJobLabel } from '../../shared/utils/careerLabels'
import type { ProfileSummary } from '../types/profile'

function ProfileReanalyzePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<ProfileSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true
    getProfileSummary()
      .then((response) => {
        if (isMounted) {
          setProfile(response)
        }
      })
      .catch(() => {
        if (isMounted) {
          setErrorMessage('현재 분석 기준을 불러오지 못했습니다.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [])

  const handleStartAnalysis = async () => {
    setIsSubmitting(true)
    setErrorMessage('')
    try {
      await requestAnalysis()
      navigate(ROUTES.onboardingWaiting, {
        replace: true,
        state: { analysisStarted: true },
      })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '분석을 시작하지 못했습니다.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="profile-page profile-fade-in">
      <section className="profile-card">
        <header className="profile-card-header">
          <h1>다시 분석하기</h1>
          <p>현재 저장된 GitHub와 포트폴리오를 최신 상태로 다시 분석합니다.</p>
        </header>

        {isLoading ? <p className="profile-meta-text">분석 기준을 불러오는 중입니다...</p> : null}
        {errorMessage ? <p className="profile-error-text">{errorMessage}</p> : null}

        {!isLoading && profile ? (
          <section className="report-section glass-style">
            <h2>현재 분석 기준</h2>
            <p className="profile-meta-text">희망 직무: {toDesiredJobLabel(profile.desiredJob) || '미설정'}</p>
            <p className="profile-meta-text">희망 기업: {profile.desiredCompany || '미설정'}</p>
            <p className="profile-meta-text">포트폴리오: {profile.portfolioFileName || '미등록'}</p>
            <p className="profile-meta-text">GitHub: {profile.githubConnected ? '연결됨' : '연결되지 않음'}</p>
          </section>
        ) : null}

        <div className="profile-form-actions">
          <button type="button" className="profile-ghost-btn" onClick={() => navigate(ROUTES.profile)}>
            취소
          </button>
          <button
            type="button"
            className="profile-action-btn"
            disabled={!profile || isSubmitting}
            onClick={() => void handleStartAnalysis()}
          >
            {isSubmitting ? '분석 요청 중...' : '최신 기준으로 분석하기'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default ProfileReanalyzePage
