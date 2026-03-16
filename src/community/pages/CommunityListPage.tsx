import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCommunityPosts } from '../../api/services/communityService'
import CommunityFilterBar from '../components/CommunityFilterBar'
import CommunityTopNav from '../components/CommunityTopNav'
import PostListItem from '../components/PostListItem'
import PostTypeTabs from '../components/PostTypeTabs'
import TagSelector from '../components/TagSelector'
import type { CommunityPostListTab, CommunityPostSummary, JobTrackTagKey } from '../types/community'
import '../styles/community-pages.css'

function CommunityListPage() {
  const navigate = useNavigate()
  const [selectedTab, setSelectedTab] = useState<CommunityPostListTab>('all')
  const [selectedTag, setSelectedTag] = useState<JobTrackTagKey | 'all'>('all')
  const [searchValue, setSearchValue] = useState('')
  const [selectedCompany, setSelectedCompany] = useState('')
  const [selectedJob, setSelectedJob] = useState('')
  const [selectedTech, setSelectedTech] = useState('')
  const [posts, setPosts] = useState<CommunityPostSummary[]>([])
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

    getCommunityPosts()
      .then((data) => {
        if (!isMounted) {
          return
        }

        setPosts(data)
      })
      .catch(() => {
        if (!isMounted) {
          return
        }

        setPosts([])
        setIsError(true)
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

  const companyOptions = useMemo(
    () =>
      Array.from(new Set(posts.filter((post) => post.type === 'interview').map((post) => post.company))).sort((a, b) => a.localeCompare(b, 'ko')),
    [posts],
  )

  const jobOptions = useMemo(
    () =>
      Array.from(
        new Set(
          posts.flatMap((post) => {
            if (post.type === 'interview') {
              return [post.jobRole]
            }

            if (post.type === 'roadmap') {
              return [post.targetJob]
            }

            return []
          }),
        ),
      ).sort((a, b) => a.localeCompare(b, 'ko')),
    [posts],
  )

  const techOptions = useMemo(
    () =>
      Array.from(
        new Set(
          posts.flatMap((post) => {
            if (post.type === 'interview') {
              return post.techStacks
            }

            if (post.type === 'roadmap') {
              return post.recommendedSkills
            }

            return []
          }),
        ),
      ).sort((a, b) => a.localeCompare(b, 'ko')),
    [posts],
  )

  const filteredPosts = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase()

    return posts.filter((post) => {
      if (selectedTab !== 'all' && post.type !== selectedTab) {
        return false
      }

      if (selectedTag !== 'all' && post.tag !== selectedTag) {
        return false
      }

      if (selectedCompany) {
        if (post.type !== 'interview' || post.company !== selectedCompany) {
          return false
        }
      }

      if (selectedJob) {
        if (post.type === 'roadmap' && post.targetJob !== selectedJob) {
          return false
        }

        if (post.type === 'interview' && post.jobRole !== selectedJob) {
          return false
        }

        if (post.type === 'general') {
          return false
        }
      }

      if (selectedTech) {
        if (post.type === 'roadmap' && !post.recommendedSkills.includes(selectedTech)) {
          return false
        }

        if (post.type === 'interview' && !post.techStacks.includes(selectedTech)) {
          return false
        }

        if (post.type === 'general') {
          return false
        }
      }

      if (!keyword) {
        return true
      }

      const searchable = [
        post.title,
        post.authorName,
        ...post.tags,
        post.type === 'general' ? `${post.excerpt}` : '',
        post.type === 'roadmap' ? `${post.summary} ${post.targetJob} ${post.targetCompany ?? ''}` : '',
        post.type === 'interview' ? `${post.company} ${post.jobRole} ${post.processSummary}` : '',
      ]
        .join(' ')
        .toLowerCase()

      return searchable.includes(keyword)
    })
  }, [posts, searchValue, selectedCompany, selectedJob, selectedTab, selectedTag, selectedTech])

  const emptyLabel = useMemo(() => {
    if (selectedTab === 'all' && selectedTag === 'all' && !searchValue && !selectedCompany && !selectedJob && !selectedTech) {
      return '등록된 게시글이 없습니다.'
    }

    return '선택한 조건에 맞는 게시글이 없습니다.'
  }, [searchValue, selectedCompany, selectedJob, selectedTab, selectedTag, selectedTech])

  const handleTabChange = (tab: CommunityPostListTab) => {
    setSelectedTab(tab)

    if (tab === 'general') {
      setSelectedCompany('')
      setSelectedJob('')
      setSelectedTech('')
    }
  }

  return (
    <main className="community-page">
      <CommunityTopNav />

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
          companyOptions={companyOptions}
          selectedCompany={selectedCompany}
          jobOptions={jobOptions}
          selectedJob={selectedJob}
          techOptions={techOptions}
          selectedTech={selectedTech}
          onSearchChange={setSearchValue}
          onCompanyChange={setSelectedCompany}
          onJobChange={setSelectedJob}
          onTechChange={setSelectedTech}
        />

        <section className="community-post-list" aria-live="polite">
          {isLoading ? <p className="community-status-text">게시글을 불러오는 중입니다...</p> : null}
          {!isLoading && isError ? <p className="community-status-text">게시글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p> : null}
          {!isLoading && !isError && filteredPosts.length === 0 ? <p className="community-status-text">{emptyLabel}</p> : null}
          {!isLoading && !isError && filteredPosts.map((post) => <PostListItem key={post.id} post={post} onClick={(postId) => navigate(`/community/${postId}`)} />)}
        </section>
      </section>
    </main>
  )
}

export default CommunityListPage
