import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ROUTES } from '../../routes/paths'
import '../../profile/styles/profile-pages.css'
import { applyToStudy, getStudyDetail, updateStudyApplicationStatus, updateStudyStatus } from '../services/studyService'
import '../styles/study-pages.css'
import type { StudyPost, StudyStatus } from '../types/study'

const formatStudyDateTime = (value: string) =>
  new Date(value).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

const getAcceptedCount = (study: StudyPost) => study.applicants.filter((applicant) => applicant.status === 'accepted').length

function StudyDetailPage() {
  const navigate = useNavigate()
  const { studyId } = useParams<{ studyId: string }>()
  const [study, setStudy] = useState<StudyPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [isManaging, setIsManaging] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem('accessToken')))
  const [currentUserName, setCurrentUserName] = useState(localStorage.getItem('userName')?.trim() ?? '')

  useEffect(() => {
    const syncAuth = () => {
      setIsLoggedIn(Boolean(localStorage.getItem('accessToken')))
      setCurrentUserName(localStorage.getItem('userName')?.trim() ?? '')
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

  const isAuthor = useMemo(() => Boolean(study && currentUserName && study.authorName === currentUserName), [currentUserName, study])
  const acceptedCount = useMemo(() => (study ? getAcceptedCount(study) : 0), [study])
  const myApplication = useMemo(
    () => study?.applicants.find((applicant) => applicant.applicantName === currentUserName) ?? null,
    [currentUserName, study],
  )

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
      const nextStudy = await applyToStudy(studyId)
      setStudy(nextStudy)
      alert('스터디 지원이 완료되었습니다.')
    } catch (error) {
      const message = error instanceof Error ? error.message : '스터디 지원에 실패했습니다.'
      alert(message)
    } finally {
      setIsApplying(false)
    }
  }

  const handleStudyStatusChange = async (status: StudyStatus) => {
    if (!studyId) {
      return
    }

    setIsManaging(true)

    try {
      const nextStudy = await updateStudyStatus(studyId, status)
      setStudy(nextStudy)
    } catch (error) {
      const message = error instanceof Error ? error.message : '스터디 상태 변경에 실패했습니다.'
      alert(message)
    } finally {
      setIsManaging(false)
    }
  }

  const handleApplicantStatusChange = async (applicationId: string, status: 'accepted' | 'rejected') => {
    if (!studyId) {
      return
    }

    setIsManaging(true)

    try {
      const nextStudy = await updateStudyApplicationStatus(studyId, applicationId, status)
      setStudy(nextStudy)
    } catch (error) {
      const message = error instanceof Error ? error.message : '신청 상태 변경에 실패했습니다.'
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

  const canApply = !isAuthor && !myApplication && study.status === 'recruiting' && acceptedCount < study.capacity

  return (
    <main className="profile-layout-shell">
      <section className="profile-layout-content study-page">
        <section className="profile-card study-page-card">
          <div className="study-detail-head">
            <div>
              <div className="study-badge-row">
                <span className={`study-mode-badge is-${study.mode}`}>{study.mode === 'offline' ? '대면' : '비대면'}</span>
                <span className={`study-status-badge ${study.status === 'completed' ? 'is-completed' : ''}`}>
                  {study.status === 'recruiting' ? '모집중' : '모집완료'}
                </span>
              </div>
              <h1>{study.title}</h1>
              <p className="profile-meta-text">{study.authorName} · {formatStudyDateTime(study.createdAt)}</p>
            </div>

            {isAuthor ? (
              <button type="button" className="profile-ghost-btn" onClick={() => document.getElementById('study-manage-section')?.scrollIntoView({ behavior: 'smooth' })}>
                스터디 관리
              </button>
            ) : (
              <button type="button" className="profile-action-btn" onClick={handleApply} disabled={!canApply || isApplying}>
                {myApplication ? '지원 완료' : isApplying ? '지원 중...' : '스터디 지원하기'}
              </button>
            )}
          </div>

          <div className="study-detail-layout">
            <section className="study-detail-summary glass-style">
              <div className="study-detail-grid">
                <div className="study-detail-meta-card">
                  <strong>진행 방식</strong>
                  <p>{study.mode === 'offline' ? '대면' : '비대면'}</p>
                </div>
                <div className="study-detail-meta-card">
                  <strong>{study.mode === 'offline' ? '장소' : '진행 링크/플랫폼'}</strong>
                  <p>{study.location}</p>
                </div>
                <div className="study-detail-meta-card">
                  <strong>시간</strong>
                  <p>{formatStudyDateTime(study.scheduledAt)}</p>
                </div>
                <div className="study-detail-meta-card">
                  <strong>모집 현황</strong>
                  <p>
                    현재 모집 {acceptedCount}명 / 모집 인원 {study.capacity}명
                  </p>
                </div>
              </div>
              <p className="study-detail-description">{study.description}</p>
            </section>

            {!isAuthor && myApplication ? (
              <section className="study-detail-section glass-style">
                <h2>내 지원 상태</h2>
                <p>
                  {myApplication.status === 'pending'
                    ? '지원이 접수되었습니다. 모집자가 확인 중입니다.'
                    : myApplication.status === 'accepted'
                      ? '스터디 참여가 확정되었습니다.'
                      : '현재 지원이 거절된 상태입니다.'}
                </p>
              </section>
            ) : null}

            {isAuthor ? (
              <section id="study-manage-section" className="study-manage-card glass-style">
                <div className="study-manage-head">
                  <div>
                    <h2>스터디 관리</h2>
                    <p className="profile-meta-text">신청 인원을 확인하고 수락/거절, 모집 상태를 조정할 수 있습니다.</p>
                  </div>
                </div>

                <div className="study-manage-status-row">
                  <button
                    type="button"
                    className="profile-ghost-btn"
                    disabled={isManaging || study.status === 'recruiting'}
                    onClick={() => handleStudyStatusChange('recruiting')}
                  >
                    모집중
                  </button>
                  <button
                    type="button"
                    className="profile-action-btn"
                    disabled={isManaging || study.status === 'completed'}
                    onClick={() => handleStudyStatusChange('completed')}
                  >
                    모집완료
                  </button>
                </div>

                <div className="study-applications">
                  {study.applicants.length === 0 ? (
                    <div className="study-empty-state">
                      <p>아직 지원한 인원이 없습니다.</p>
                    </div>
                  ) : (
                    study.applicants.map((applicant) => (
                      <article key={applicant.id} className="study-application-card">
                        <div className="study-application-card-head">
                          <div>
                            <strong>{applicant.applicantName}</strong>
                            <p>{formatStudyDateTime(applicant.appliedAt)}</p>
                          </div>
                          <span className={`study-application-status is-${applicant.status}`}>
                            {applicant.status === 'pending' ? '대기중' : applicant.status === 'accepted' ? '수락됨' : '거절됨'}
                          </span>
                        </div>

                        {applicant.status === 'pending' ? (
                          <div className="study-action-row">
                            <button type="button" className="profile-action-btn" disabled={isManaging} onClick={() => handleApplicantStatusChange(applicant.id, 'accepted')}>
                              수락
                            </button>
                            <button type="button" className="profile-danger-btn" disabled={isManaging} onClick={() => handleApplicantStatusChange(applicant.id, 'rejected')}>
                              거절
                            </button>
                          </div>
                        ) : null}
                      </article>
                    ))
                  )}
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
