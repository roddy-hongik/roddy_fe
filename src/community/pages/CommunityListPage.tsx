import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCommunityPosts } from '../../api/services/communityService'
import CommunityFilterBar from '../components/CommunityFilterBar'
import PostListItem from '../components/PostListItem'
import PostTypeTabs from '../components/PostTypeTabs'
import TagSelector from '../components/TagSelector'
import type { CommunityPostFilters, CommunityPostListTab, CommunityPostSummary, JobTrackTagKey } from '../types/community'
import '../styles/community-pages.css'

type FilterOptions = {
  companies: string[]
  jobs: string[]
  techs: string[]
}

const EMPTY_OPTIONS: FilterOptions = { companies: [], jobs: [], techs: [] }

/** 검색어는 입력을 멈춘 뒤에 조회한다. 글자마다 요청하지 않기 위함이다. */
const SEARCH_DEBOUNCE_MS = 300

const toSortedOptions = (values: string[]) =>
  Array.from(new Set(values.filter((value) => value && value !== '-'))).sort((a, b) => a.localeCompare(b, 'ko'))

/** 받은 글에서 필터 선택지를 모은다. 필터로 좁혀 받아도 앞서 본 선택지는 남겨 둬야 다른 값으로 바꿀 수 있다. */
const mergeOptions = (previous: FilterOptions, posts: CommunityPostSummary[]): FilterOptions => ({
  companies: toSortedOptions([
    ...previous.companies,
    ...posts.flatMap((post) => {
      if (post.type === 'interview') {
        return [post.company]
      }
      return post.type === 'roadmap' && post.targetCompany ? [post.targetCompany] : []
    }),
  ]),
  jobs: toSortedOptions([
    ...previous.jobs,
    ...posts.flatMap((post) => {
      if (post.type === 'interview') {
        return [post.jobRole]
      }
      return post.type === 'roadmap' ? [post.targetJob] : []
    }),
  ]),
  techs: toSortedOptions([
    ...previous.techs,
    ...posts.flatMap((post) => {
      if (post.type === 'interview') {
        return post.techStacks
      }
      return post.type === 'roadmap' ? post.recommendedSkills : []
    }),
  ]),
})

function CommunityListPage() {
  const navigate = useNavigate()
  const [selectedTab, setSelectedTab] = useState<CommunityPostListTab>('all')
  const [selectedTag, setSelectedTag] = useState<JobTrackTagKey | 'all'>('all')
  const [searchValue, setSearchValue] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedCompany, setSelectedCompany] = useState('')
  const [selectedJob, setSelectedJob] = useState('')
  const [selectedTech, setSelectedTech] = useState('')
  const [posts, setPosts] = useState<CommunityPostSummary[]>([])
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(EMPTY_OPTIONS)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  /** 화면에 반영된 마지막 페이지. 다음 페이지를 받아야만 앞으로 나간다. */
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isLoadMoreError, setIsLoadMoreError] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem('accessToken')))

  /** 필터가 바뀌는 사이에 먼저 떠난 요청이 나중에 도착해 화면을 덮어쓰지 않도록 한다. */
  const requestIdRef = useRef(0)

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
    const timer = window.setTimeout(() => {
      setSearchKeyword(searchValue.trim())
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [searchValue])

  /** 필터는 백엔드가 건다. 불러온 글 안에서만 거르면 뒤 페이지에만 있는 글을 찾지 못한다. */
  const filters = useMemo<CommunityPostFilters>(
    () => ({
      type: selectedTab,
      trackTag: selectedTag,
      search: searchKeyword,
      company: selectedCompany,
      jobRole: selectedJob,
      techStack: selectedTech,
    }),
    [searchKeyword, selectedCompany, selectedJob, selectedTab, selectedTag, selectedTech],
  )

  const loadPosts = useCallback(async (nextPage: number, nextFilters: CommunityPostFilters, shouldAppend: boolean) => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    if (shouldAppend) {
      setIsLoadingMore(true)
      setIsLoadMoreError(false)
    } else {
      setIsLoading(true)
      setIsError(false)
      setIsLoadingMore(false)
      setIsLoadMoreError(false)
    }

    try {
      const response = await getCommunityPosts(nextFilters, nextPage)

      if (requestIdRef.current !== requestId) {
        return
      }

      setPosts((previous) =>
        shouldAppend
          ? [
              ...previous,
              // 앞 페이지를 받은 뒤 새 글이 올라오면 페이지 경계가 밀려 이미 받은 글이 다시 온다.
              ...response.posts.filter((post) => !previous.some((existing) => existing.id === post.id)),
            ]
          : response.posts,
      )
      setPage(response.page)
      setTotalPages(response.totalPages)
      setFilterOptions((previous) => mergeOptions(previous, response.posts))
    } catch {
      if (requestIdRef.current !== requestId) {
        return
      }

      if (shouldAppend) {
        setIsLoadMoreError(true)
      } else {
        setPosts([])
        setTotalPages(0)
        setIsError(true)
      }
    } finally {
      if (requestIdRef.current === requestId) {
        if (shouldAppend) {
          setIsLoadingMore(false)
        } else {
          setIsLoading(false)
        }
      }
    }
  }, [])

  useEffect(() => {
    void loadPosts(0, filters, false)
  }, [filters, loadPosts])

  const hasMore = page + 1 < totalPages

  const handleLoadMore = () => {
    void loadPosts(page + 1, filters, true)
  }

  const emptyLabel = useMemo(() => {
    if (selectedTab === 'all' && selectedTag === 'all' && !searchKeyword && !selectedCompany && !selectedJob && !selectedTech) {
      return '등록된 게시글이 없습니다.'
    }

    return '선택한 조건에 맞는 게시글이 없습니다.'
  }, [searchKeyword, selectedCompany, selectedJob, selectedTab, selectedTag, selectedTech])

  const handleTabChange = (tab: CommunityPostListTab) => {
    setSelectedTab(tab)

    if (tab !== 'interview') {
      setSelectedCompany('')
    }

    if (tab === 'general' || tab === 'all') {
      setSelectedJob('')
      setSelectedTech('')
    }
  }

  return (
    <main className="community-page">
      <section className="community-container community-list-panel">
        <div className="community-header-block">
          <div>
            <h1>개발자 커뮤니티</h1>
            <p>자유 토론, 로드맵 공유, 합격 후기와 현직자 인터뷰를 한 곳에서 탐색하세요.</p>
          </div>
          {isLoggedIn ? (
            <button type="button" className="community-primary-btn" onClick={() => navigate('/community/write')}>
              새 글 작성
            </button>
          ) : (
            <button type="button" className="community-outline-btn" onClick={() => navigate('/login', { state: { from: { pathname: '/community' } } })}>
              로그인 후 글쓰기
            </button>
          )}
        </div>

        <PostTypeTabs selectedTab={selectedTab} onSelectTab={handleTabChange} />
        <TagSelector selectedTag={selectedTag} onSelectTag={setSelectedTag} includeAll />

        <CommunityFilterBar
          selectedTab={selectedTab}
          searchValue={searchValue}
          companyOptions={filterOptions.companies}
          selectedCompany={selectedCompany}
          jobOptions={filterOptions.jobs}
          selectedJob={selectedJob}
          techOptions={filterOptions.techs}
          selectedTech={selectedTech}
          onSearchChange={setSearchValue}
          onCompanyChange={setSelectedCompany}
          onJobChange={setSelectedJob}
          onTechChange={setSelectedTech}
        />

        <section className="community-post-list" aria-live="polite">
          {isLoading ? <p className="community-status-text">게시글을 불러오는 중입니다...</p> : null}
          {!isLoading && isError ? <p className="community-status-text">게시글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p> : null}
          {!isLoading && !isError && posts.length === 0 ? <p className="community-status-text">{emptyLabel}</p> : null}
          {!isLoading && !isError && posts.map((post) => <PostListItem key={post.id} post={post} onClick={(postId) => navigate(`/community/${postId}`)} />)}
        </section>

        {!isLoading && !isError && hasMore ? (
          <button type="button" className="community-outline-btn" disabled={isLoadingMore} onClick={handleLoadMore}>
            {isLoadingMore ? '불러오는 중...' : '더 보기'}
          </button>
        ) : null}
        {isLoadMoreError ? <p className="community-status-text">다음 게시글을 불러오지 못했습니다. 다시 시도해 주세요.</p> : null}
      </section>
    </main>
  )
}

export default CommunityListPage
