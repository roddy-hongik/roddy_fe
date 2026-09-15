import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { deleteAccount, getProfileSummary } from '../../api/services/profileService'
import { emitAuthChange } from '../../auth/utils/authEvents'
import { clearAuthSession } from '../../auth/utils/authStorage'
import { ROUTES } from '../../routes/paths'
import { toDesiredJobLabel, toExperienceLevelLabel } from '../../shared/utils/careerLabels'
import type { ProfileSummary } from '../types/profile'
import { clearProfileCache, readProfileCache, writeProfileCache } from '../utils/profileCache'

const emptyProfile = (): ProfileSummary => ({
  name: localStorage.getItem('userName') ?? '사용자', age: 0, profileImageUrl: null,
  desiredJob: '', desiredCompany: '', experienceYears: '', portfolioFileName: '',
  portfolioUrl: null, githubConnected: false,
})

function ProfilePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<ProfileSummary>(() => readProfileCache() ?? emptyProfile())
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let isMounted = true

    getProfileSummary()
      .then((data) => {
        if (!isMounted) {
          return
        }

        setLoadError('')
        setProfile(data)
        writeProfileCache(data)
        localStorage.setItem('userName', data.name)
      })
      .catch(() => {
        if (!isMounted) {
          return
        }

        const cached = readProfileCache()
        setProfile(cached ?? emptyProfile())
        setLoadError(cached
          ? '프로필 정보를 최신 상태로 불러오지 못했습니다. 이 계정에 저장된 정보로 표시합니다.'
          : '프로필 정보를 불러오지 못했습니다.')
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

  const profileInitial = useMemo(() => profile.name.trim().charAt(0) || 'R', [profile.name])

  const handleDeleteAccount = async () => {
    try {
      setDeleteError('')
      await deleteAccount()
      clearProfileCache()
      clearAuthSession()
      emitAuthChange()
      navigate(ROUTES.login, { replace: true })
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : '회원 탈퇴에 실패했습니다.')
    }
  }

  return (
    <div className="profile-page profile-fade-in">
      <Link className="profile-action-btn" to={ROUTES.coverLetters}>내 자기소개서 관리</Link>
      <section className="profile-card">
        <header className="profile-card-header">
          <h1>마이페이지</h1>
          <p>개인 정보와 커리어 설정을 한 화면에서 관리하세요.</p>
          {loadError ? <p className="profile-error-text">{loadError}</p> : null}
        </header>

        <section className="profile-hero-section glass-style">
          {isLoading ? (
            <p className="profile-meta-text">불러오는 중...</p>
          ) : (
            <div className="profile-hero-content">
              <div className="profile-hero-avatar-wrap">
                {profile.profileImageUrl ? (
                  <img className="profile-avatar profile-avatar-large" src={profile.profileImageUrl} alt="프로필 이미지" />
                ) : (
                  <div className="profile-avatar profile-avatar-fallback profile-avatar-large" aria-hidden="true">
                    {profileInitial}
                  </div>
                )}
              </div>

              <div className="profile-info-stack">
                <div className="profile-info-row">
                  <span>이름</span>
                  <strong>{profile.name}</strong>
                </div>
                <div className="profile-info-row">
                  <span>나이</span>
                  <strong>{profile.age}세</strong>
                </div>
                <div className="profile-info-row">
                  <span>희망 직무</span>
                  <strong>{toDesiredJobLabel(profile.desiredJob) || '-'}</strong>
                </div>
                <div className="profile-info-row">
                  <span>희망 기업</span>
                  <strong>{profile.desiredCompany || '-'}</strong>
                </div>
                <div className="profile-info-row">
                  <span>경력</span>
                  <strong>{toExperienceLevelLabel(profile.experienceYears) || '-'}</strong>
                </div>
                <div className="profile-info-row">
                  <span>GitHub 연동</span>
                  <strong>{profile.githubConnected ? '연동됨' : '미연동'}</strong>
                </div>
              </div>
            </div>
          )}
          <div className="profile-hero-actions">
            <button type="button" className="profile-action-btn" onClick={() => navigate(ROUTES.profileEdit)}>
              수정
            </button>
          </div>
        </section>

        <div className="profile-secondary-grid">
          <article className="profile-section glass-style profile-account-card">
            <h2>계정 및 정보</h2>
            <p className="profile-meta-text">포트폴리오 파일: {profile.portfolioFileName || '-'}</p>
            <div className="profile-info-links">
              <button type="button" className="profile-danger-btn" onClick={() => setIsDeleteModalOpen(true)}>
                회원 탈퇴
              </button>
              <Link to={ROUTES.terms} className="profile-terms-link">
                이용 약관 보기
              </Link>
            </div>
          </article>
        </div>
      </section>

      {isDeleteModalOpen && (
        <div className="profile-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="delete-title">
          <div className="profile-modal">
            <h3 id="delete-title">회원 탈퇴</h3>
            <p>탈퇴 후 데이터는 복구할 수 없습니다. 정말 진행할까요?</p>
            {deleteError ? <p className="profile-error-text">{deleteError}</p> : null}
            <div className="profile-modal-actions">
              <button type="button" className="profile-ghost-btn" onClick={() => setIsDeleteModalOpen(false)}>
                취소
              </button>
              <button type="button" className="profile-danger-btn" onClick={handleDeleteAccount}>
                탈퇴 진행
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfilePage
