import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCommunityPosts } from '../../api/services/communityService'
import { mockCommunityPosts } from '../data/mockCommunityData'
import CommunityTopNav from '../components/CommunityTopNav'
import PostListItem from '../components/PostListItem'
import TagSelector from '../components/TagSelector'
import type { CommunityPostSummary, JobTrackTagKey } from '../types/community'
import '../styles/community-pages.css'

function CommunityListPage() {
  const navigate = useNavigate()
  const [selectedTag, setSelectedTag] = useState<JobTrackTagKey | 'all'>('all')
  const [posts, setPosts] = useState<CommunityPostSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
    setIsLoading(true)

    getCommunityPosts(selectedTag === 'all' ? undefined : selectedTag)
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
        const fallback = selectedTag === 'all' ? mockCommunityPosts : mockCommunityPosts.filter((post) => post.tag === selectedTag)
        setPosts(fallback)
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [selectedTag])

  const emptyLabel = useMemo(() => {
    if (selectedTag === 'all') {
      return '등록된 게시글이 없습니다.'
    }
    return '선택한 태그의 게시글이 없습니다.'
  }, [selectedTag])

  return (
    <main className="community-page">
      <CommunityTopNav />

      <section className="community-container community-list-panel">
        <div className="community-header-block">
          <div>
            <h1>개발자 커뮤니티</h1>
            <p>직무 트랙 기반으로 질문과 경험을 나누고, 실무 중심의 인사이트를 빠르게 확인하세요.</p>
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

        <TagSelector selectedTag={selectedTag} onSelectTag={setSelectedTag} includeAll />

        <section className="community-post-list" aria-live="polite">
          {isLoading && <p className="community-status-text">게시글을 불러오는 중입니다...</p>}
          {!isLoading && posts.length === 0 && <p className="community-status-text">{emptyLabel}</p>}
          {!isLoading && posts.map((post) => <PostListItem key={post.id} post={post} onClick={(postId) => navigate(`/community/${postId}`)} />)}
        </section>
      </section>
    </main>
  )
}

export default CommunityListPage
