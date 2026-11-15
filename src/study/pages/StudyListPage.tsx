import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES, routePaths } from '../../routes/paths'
import '../../profile/styles/profile-pages.css'
import { getStudies } from '../services/studyService'
import type { StudyListQuery } from '../services/studyService'
import '../styles/study-pages.css'
import type { StudyMode, StudyPostSummary, StudyStatus } from '../types/study'

const formatStudyDateTime = (value: string) =>
  new Date(value).toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

type StudyFilters = {
  status: StudyStatus | ''
  mode: StudyMode | ''
  keyword: string
}

const INITIAL_FILTERS: StudyFilters = { status: '', mode: '', keyword: '' }

const toQuery = (filters: StudyFilters, page: number): StudyListQuery => ({
  status: filters.status || undefined,
  mode: filters.mode || undefined,
  keyword: filters.keyword || undefined,
  page,
})

function StudyListPage() {
  const navigate = useNavigate()
  const [studies, setStudies] = useState<StudyPostSummary[]>([])
  const [filters, setFilters] = useState<StudyFilters>(INITIAL_FILTERS)
  const [keywordInput, setKeywordInput] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isLoadMoreError, setIsLoadMoreError] = useState(false)
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

  // 필터가 바뀌면 첫 페이지부터 다시 받는다.
  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    setIsError(false)
    setIsLoadMoreError(false)

    getStudies(toQuery(filters, 0))
      .then((data) => {
        if (!isMounted) return
        setStudies(data.studies)
        setPage(data.page)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
      })
      .catch(() => {
        if (isMounted) setIsError(true)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [filters])

  const hasMore = page + 1 < totalPages
  const hasActiveFilter = Boolean(filters.status || filters.mode || filters.keyword)
  const emptyMessage = hasActiveFilter ? '조건에 맞는 스터디가 없습니다.' : '아직 등록된 스터디 모집 글이 없습니다.'

  const handleLoadMore = async () => {
    setIsLoadingMore(true)
    setIsLoadMoreError(false)
    try {
      const data = await getStudies(toQuery(filters, page + 1))
      // 그 사이 새 글이 올라오면 페이지 경계가 밀려 같은 글이 다시 올 수 있다.
      setStudies((current) => {
        const seen = new Set(current.map((study) => study.id))
        return [...current, ...data.studies.filter((study) => !seen.has(study.id))]
      })
      setPage(data.page)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch {
      setIsLoadMoreError(true)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFilters((current) => ({ ...current, keyword: keywordInput.trim() }))
  }

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

          <form className="study-filter-bar" onSubmit={handleSearch} role="search">
            <label className="study-filter-field study-filter-keyword">
              <span>검색</span>
              <input
                type="search"
                value={keywordInput}
                placeholder="제목이나 내용으로 검색"
                onChange={(event) => setKeywordInput(event.target.value)}
              />
            </label>
            <label className="study-filter-field">
              <span>모집 상태</span>
              <select
                value={filters.status}
                onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as StudyFilters['status'] }))}
              >
                <option value="">전체</option>
                <option value="RECRUITING">모집 중</option>
                <option value="CLOSED">모집 완료</option>
              </select>
            </label>
            <label className="study-filter-field">
              <span>진행 방식</span>
              <select
                value={filters.mode}
                onChange={(event) => setFilters((current) => ({ ...current, mode: event.target.value as StudyFilters['mode'] }))}
              >
                <option value="">전체</option>
                <option value="ONLINE">비대면</option>
                <option value="OFFLINE">대면</option>
              </select>
            </label>
            <button type="submit" className="profile-ghost-btn study-filter-submit">
              검색
            </button>
          </form>

          {!isLoading && !isError ? <p className="profile-meta-text study-result-count">스터디 {totalElements}개</p> : null}
          {isLoading ? <p className="profile-meta-text">스터디 목록을 불러오는 중입니다...</p> : null}
          {isError ? <p className="profile-error-text">스터디 목록을 불러오지 못했습니다.</p> : null}
          {!isLoading && !isError && studies.length === 0 ? <div className="study-empty-state"><p>{emptyMessage}</p></div> : null}

          {!isLoading && !isError && studies.length > 0 ? (
            <div className="study-list-grid">
              {studies.map((study) => (
                <button key={study.id} type="button" className="study-card" onClick={() => navigate(routePaths.studyDetail(String(study.id)))}>
                  <div className="study-card-head">
                    <div className="study-badge-row">
                      <span className={`study-mode-badge is-${study.mode.toLowerCase()}`}>{study.modeDisplayName}</span>
                      <span className={`study-status-badge ${study.status === 'CLOSED' ? 'is-completed' : ''}`}>
                        {study.statusDisplayName}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h2>{study.title}</h2>
                  </div>
                  <p>{study.contentPreview}</p>
                  <div className="study-meta-row">
                    <span className="study-meta-pill">{study.location}</span>
                    <span className="study-meta-pill">{formatStudyDateTime(study.scheduledAt)}</span>
                    <span className="study-meta-pill">
                      지원 {study.applicantCount} / 정원 {study.capacity}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : null}

          {!isLoading && !isError && hasMore ? (
            <div className="study-load-more">
              <button type="button" className="profile-ghost-btn" disabled={isLoadingMore} onClick={() => void handleLoadMore()}>
                {isLoadingMore ? '불러오는 중...' : '더 보기'}
              </button>
            </div>
          ) : null}
          {isLoadMoreError ? <p className="profile-error-text">다음 스터디를 불러오지 못했습니다. 다시 시도해 주세요.</p> : null}
        </section>
      </section>
    </main>
  )
}

export default StudyListPage
