import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES, routePaths } from '../../routes/paths'
import '../../profile/styles/profile-pages.css'
import { getStudies } from '../services/studyService'
import '../styles/study-pages.css'
import type { StudyPost } from '../types/study'

const formatStudyDateTime = (value: string) =>
  new Date(value).toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

const getAcceptedCount = (study: StudyPost) => study.applicants.filter((applicant) => applicant.status === 'accepted').length

function StudyListPage() {
  const navigate = useNavigate()
  const [studies, setStudies] = useState<StudyPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem('accessToken')))

  useEffect(() => {
    const syncLoginStatus = () => {
      setIsLoggedIn(Boolean(localStorage.getItem('accessToken')))
    }

    syncLoginStatus()
    window.addEventListener('storage', syncLoginStatus)

    return () => {
      window.removeEventListener('storage', syncLoginStatus)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    getStudies()
      .then((data) => {
        if (isMounted) {
          setStudies(data)
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
  }, [])

  const emptyMessage = useMemo(() => '아직 등록된 스터디 모집 글이 없습니다.', [])

  return (
    <main className="profile-layout-shell">
      <section className="profile-layout-content study-page">
        <section className="profile-card study-page-card">
          <div className="study-header-block">
            <div>
              <h1>스터디</h1>
              <p>함께 공부할 멤버를 모집하고, 원하는 스터디에 지원할 수 있습니다.</p>
            </div>
            <button
              type="button"
              className="profile-action-btn"
              onClick={() =>
                navigate(isLoggedIn ? ROUTES.studyWrite : ROUTES.login, isLoggedIn ? undefined : { state: { from: { pathname: ROUTES.study } } })
              }
            >
              스터디 모집
            </button>
          </div>

          {isLoading ? <p className="profile-meta-text">스터디 목록을 불러오는 중입니다...</p> : null}
          {isError ? <p className="profile-error-text">스터디 목록을 불러오지 못했습니다.</p> : null}
          {!isLoading && !isError && studies.length === 0 ? <div className="study-empty-state"><p>{emptyMessage}</p></div> : null}

          {!isLoading && !isError && studies.length > 0 ? (
            <div className="study-list-grid">
              {studies.map((study) => (
                <button key={study.id} type="button" className="study-card" onClick={() => navigate(routePaths.studyDetail(study.id))}>
                  <div className="study-card-head">
                    <div className="study-badge-row">
                      <span className={`study-mode-badge is-${study.mode}`}>{study.mode === 'offline' ? '대면' : '비대면'}</span>
                      <span className={`study-status-badge ${study.status === 'completed' ? 'is-completed' : ''}`}>
                        {study.status === 'recruiting' ? '모집중' : '모집완료'}
                      </span>
                    </div>
                    <span className="study-meta-pill">{study.authorName}</span>
                  </div>
                  <div>
                    <h2>{study.title}</h2>
                  </div>
                  <p>{study.description}</p>
                  <div className="study-meta-row">
                    <span className="study-meta-pill">{study.location}</span>
                    <span className="study-meta-pill">{formatStudyDateTime(study.scheduledAt)}</span>
                    <span className="study-meta-pill">
                      모집 {getAcceptedCount(study)} / {study.capacity}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </section>
      </section>
    </main>
  )
}

export default StudyListPage
