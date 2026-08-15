import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ROUTES } from '../../routes/paths'
import '../../profile/styles/profile-pages.css'
import { applyToStudy, cancelStudyApplication, closeStudy, getStudyDetail } from '../services/studyService'
import '../styles/study-pages.css'
import type { StudyPostDetail } from '../types/study'

const formatStudyDateTime = (value: string) =>
  new Date(value).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

function StudyDetailPage() {
  const navigate = useNavigate()
  const { studyId } = useParams<{ studyId: string }>()
  const [study, setStudy] = useState<StudyPostDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [isManaging, setIsManaging] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem('accessToken')))

  useEffect(() => {
    const syncAuth = () => {
      setIsLoggedIn(Boolean(localStorage.getItem('accessToken')))
    }

    syncAuth()
    window.addEventListener('storage', syncAuth)

    return () => {
      window.removeEventListener('storage', syncAuth)
    }
  }, [])

  useEffect(() => {
    if (!studyId) {
      navigate(ROUTES.study, { replace: true })
      return
    }

    let isMounted = true

    getStudyDetail(studyId)
      .then((data) => {
        if (isMounted) {
          setStudy(data)
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsError(true)
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
  }, [navigate, studyId])

  const isAuthor = useMemo(() => study?.isAuthor ?? false, [study])
  const myApplicationStatus = useMemo(() => study?.myApplicationStatus ?? null, [study])
  const canApply = useMemo(() => !isAuthor && study?.status === 'RECRUITING' && myApplicationStatus !== 'APPLIED', [isAuthor, myApplicationStatus, study])
  const canCancel = useMemo(() => !isAuthor && myApplicationStatus === 'APPLIED', [isAuthor, myApplicationStatus])

  const handleApply = async () => {
    if (!studyId) {
      return
    }

    if (!isLoggedIn) {
      navigate(ROUTES.login, { state: { from: { pathname: `${ROUTES.study}/${studyId}` } } })
      return
    }

    setIsApplying(true)

    try {
      const response = await applyToStudy(studyId)
      setStudy((current) =>
        current
          ? {
              ...current,
              applicantCount: response.applicantCount,
              myApplicationStatus: response.status,
              myApplicationStatusDisplayName: response.statusDisplayName,
            }
          : current,
      )
      alert('스터디 지원이 완료되었습니다.')
    } catch (error) {
      const message = error instanceof Error ? error.message : '스터디 지원에 실패했습니다.'
      alert(message)
    } finally {
      setIsApplying(false)
    }
  }

  const handleCancelApplication = async () => {
    if (!studyId) {
      return
    }

    setIsApplying(true)

    try {
      const response = await cancelStudyApplication(studyId)
      setStudy((current) =>
        current
          ? {
              ...current,
              applicantCount: response.applicantCount,
              myApplicationStatus: response.status,
              myApplicationStatusDisplayName: response.statusDisplayName,
            }
          : current,
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : '스터디 지원 취소에 실패했습니다.'
      alert(message)
    } finally {
      setIsApplying(false)
    }
  }

  const handleStudyClose = async () => {
    if (!studyId) {
      return
    }

    setIsManaging(true)

    try {
      const response = await closeStudy(studyId)
      setStudy((current) =>
        current
          ? {
              ...current,
              status: response.status,
              statusDisplayName: response.statusDisplayName,
            }
          : current,
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : '스터디 상태 변경에 실패했습니다.'
      alert(message)
    } finally {
      setIsManaging(false)
    }
  }

  if (isLoading) {
    return (
      <main className="profile-layout-shell">
        <section className="profile-layout-content study-page">
          <section className="profile-card study-page-card">
            <p className="profile-meta-text">스터디 정보를 불러오는 중입니다...</p>
          </section>
        </section>
      </main>
    )
  }

  if (isError || !study) {
    return (
      <main className="profile-layout-shell">
        <section className="profile-layout-content study-page">
          <section className="profile-card study-page-card">
            <p className="profile-error-text">스터디 정보를 불러오지 못했습니다.</p>
          </section>
        </section>
      </main>
    )
  }

  return (
    <main className="profile-layout-shell">
      <section className="profile-layout-content study-page">
        <section className="profile-card study-page-card">
          <div className="study-detail-head">
            <div>
              <div className="study-badge-row">
                <span className={`study-mode-badge is-${study.mode.toLowerCase()}`}>{study.modeDisplayName}</span>
                <span className={`study-status-badge ${study.status === 'CLOSED' ? 'is-completed' : ''}`}>
                  {study.statusDisplayName}
                </span>
              </div>
              <h1>{study.title}</h1>
              <p className="profile-meta-text">{study.authorName} · {formatStudyDateTime(study.createdAt)}</p>
            </div>

            {isAuthor ? (
              <button type="button" className="profile-action-btn" onClick={() => void handleStudyClose()} disabled={isManaging || study.status === 'CLOSED'}>
                {isManaging ? '처리 중...' : study.status === 'CLOSED' ? '모집 완료됨' : '모집 완료 처리'}
              </button>
            ) : canCancel ? (
              <button type="button" className="profile-ghost-btn" onClick={() => void handleCancelApplication()} disabled={isApplying}>
                {isApplying ? '처리 중...' : '지원 취소'}
              </button>
            ) : (
              <button type="button" className="profile-action-btn" onClick={handleApply} disabled={!canApply || isApplying}>
                {myApplicationStatus === 'APPLIED' ? '지원 완료' : isApplying ? '지원 중...' : '스터디 지원하기'}
              </button>
            )}
          </div>

          <div className="study-detail-layout">
            <section className="study-detail-summary glass-style">
              <div className="study-detail-grid">
                <div className="study-detail-meta-card">
                  <strong>진행 방식</strong>
                  <p>{study.modeDisplayName}</p>
                </div>
                <div className="study-detail-meta-card">
                  <strong>{study.mode === 'OFFLINE' ? '장소' : '진행 링크/플랫폼'}</strong>
                  <p>{study.location}</p>
                </div>
                <div className="study-detail-meta-card">
                  <strong>시간</strong>
                  <p>{formatStudyDateTime(study.scheduledAt)}</p>
                </div>
                <div className="study-detail-meta-card">
                  <strong>모집 현황</strong>
                  <p>
                    현재 지원 {study.applicantCount}명 / 모집 인원 {study.capacity}명
                  </p>
                </div>
              </div>
              <p className="study-detail-description">{study.content}</p>
            </section>

            {!isAuthor && myApplicationStatus ? (
              <section className="study-detail-section glass-style">
                <h2>내 지원 상태</h2>
                <p>{study.myApplicationStatusDisplayName ? `현재 상태: ${study.myApplicationStatusDisplayName}` : '지원 상태를 확인하는 중입니다.'}</p>
              </section>
            ) : null}

            {isAuthor ? (
              <section id="study-manage-section" className="study-manage-card glass-style">
                <div className="study-manage-head">
                  <div>
                    <h2>스터디 관리</h2>
                    <p className="profile-meta-text">현재 백엔드에서는 모집 완료 처리까지만 지원합니다.</p>
                  </div>
                </div>

                <div className="study-empty-state">
                  <p>지원자 승인/거절 기능은 백엔드 API가 준비되면 다시 열 예정입니다.</p>
                </div>
              </section>
            ) : null}
          </div>
        </section>
      </section>
    </main>
  )
}

export default StudyDetailPage
