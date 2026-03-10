import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { deleteAccount, getProfileSummary } from '../../api/services/profileService'
import { ROUTES } from '../../routes/paths'
import type { ProfileSummary } from '../types/profile'

const FALLBACK_PROFILE: ProfileSummary = {
  name: localStorage.getItem('userName') ?? '사용자',
  age: Number(localStorage.getItem('userAge') ?? 0),
  imageUrl: localStorage.getItem('userImageUrl'),
  targetRole: localStorage.getItem('userTargetRole') ?? '',
  targetIndustry: localStorage.getItem('userTargetIndustry') ?? '',
}

function ProfilePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<ProfileSummary>(FALLBACK_PROFILE)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    let isMounted = true

    getProfileSummary()
      .then((data) => {
        if (!isMounted) {
          return
        }

        setProfile(data)
        localStorage.setItem('userName', data.name)
        localStorage.setItem('userAge', String(data.age))
        if (data.imageUrl) {
          localStorage.setItem('userImageUrl', data.imageUrl)
        }
        localStorage.setItem('userTargetRole', data.targetRole ?? '')
        localStorage.setItem('userTargetIndustry', data.targetIndustry ?? '')
      })
      .catch(() => {
        if (!isMounted) {
          return
        }

        setProfile(FALLBACK_PROFILE)
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
      await deleteAccount()
    } catch {
      // Delete API failure should not block local logout flow.
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('userName')
      localStorage.removeItem('userAge')
      localStorage.removeItem('userImageUrl')
      localStorage.removeItem('userTargetRole')
      localStorage.removeItem('userTargetIndustry')
      navigate(ROUTES.login, { replace: true })
    }
  }

  return (
    <div className="profile-page profile-fade-in">
      <section className="profile-card">
        <header className="profile-card-header">
          <h1>마이페이지</h1>
          <p>개인 정보와 커리어 설정을 한 화면에서 관리하세요.</p>
        </header>

        <div className="profile-grid">
          <article className="profile-section glass-style">
            <h2>프로필 요약</h2>
            {isLoading ? (
              <p className="profile-meta-text">불러오는 중...</p>
            ) : (
              <div className="profile-summary-row">
                {profile.imageUrl ? (
                  <img className="profile-avatar" src={profile.imageUrl} alt="프로필 이미지" />
                ) : (
                  <div className="profile-avatar profile-avatar-fallback" aria-hidden="true">
                    {profileInitial}
                  </div>
                )}

                <div>
                  <strong className="profile-name">{profile.name}</strong>
                  <p className="profile-meta-text">나이 {profile.age}세</p>
                  <p className="profile-meta-text">희망 직무 {profile.targetRole || '-'}</p>
                  <p className="profile-meta-text">희망 업종 {profile.targetIndustry || '-'}</p>
                  <p className="profile-meta-text">희망 직무/업종 변경은 데이터 관리에서 가능합니다.</p>
                </div>
              </div>
            )}
            <button type="button" className="profile-action-btn" onClick={() => navigate(ROUTES.profileEdit)}>
              수정
            </button>
          </article>

          <article className="profile-section glass-style">
            <h2>데이터 관리</h2>
            <p className="profile-meta-text">이력서와 희망 직무를 다시 분석해 최신 기술 스택 지표로 갱신합니다.</p>
            <button type="button" className="profile-action-btn" onClick={() => navigate(ROUTES.profileReanalyze)}>
              다시 분석하기
            </button>
          </article>

          <article className="profile-section glass-style">
            <h2>계정 및 정보</h2>
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
