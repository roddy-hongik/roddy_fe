import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLikedCommunityPosts, type CommunityPostLikeSummary } from '../../community/services/communityLikeService'
import JobScrapButton from '../../jobs/components/JobScrapButton'
import { getScrappedJobs, type JobPostingPreview } from '../../jobs/services/jobScrapService'
import { routePaths } from '../../routes/paths'
import { formatDateLabel } from '../../shared/utils/dateFormat'
import { RODDY_DATA_CHANGE_EVENT } from '../../shared/utils/localStorageSync'

type SavedTab = 'community' | 'jobs'

function ProfileSavedPage() {
  const navigate = useNavigate()
  const [selectedTab, setSelectedTab] = useState<SavedTab>('community')
  const [likedPosts, setLikedPosts] = useState<CommunityPostLikeSummary[]>([])
  const [scrappedJobs, setScrappedJobs] = useState<JobPostingPreview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const communityTabId = 'saved-community-tab'
  const jobsTabId = 'saved-jobs-tab'
  const communityPanelId = 'saved-community-panel'
  const jobsPanelId = 'saved-jobs-panel'

  useEffect(() => {
    let isMounted = true

    const loadSavedContents = async () => {
      setIsLoading(true)
      setIsError(false)

      try {
        const [likedResult, scrappedResult] = await Promise.allSettled([getLikedCommunityPosts(), getScrappedJobs()])

        if (!isMounted) {
          return
        }

        if (likedResult.status === 'fulfilled') {
          setLikedPosts(likedResult.value)
        } else {
          setLikedPosts([])
        }

        if (scrappedResult.status === 'fulfilled') {
          setScrappedJobs(scrappedResult.value)
        } else {
          setScrappedJobs([])
        }

        setIsError(likedResult.status === 'rejected' && scrappedResult.status === 'rejected')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadSavedContents()

    const refreshSavedContents = () => {
      void loadSavedContents()
    }

    const handleDataChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ key: string }>
      if (customEvent.detail?.key === 'roddy.jobs.scraps.v1' || customEvent.detail?.key === 'roddy.community.likes.v1') {
        refreshSavedContents()
      }
    }

    window.addEventListener(RODDY_DATA_CHANGE_EVENT, handleDataChange)
    window.addEventListener('storage', refreshSavedContents)

    return () => {
      isMounted = false
      window.removeEventListener(RODDY_DATA_CHANGE_EVENT, handleDataChange)
      window.removeEventListener('storage', refreshSavedContents)
    }
  }, [])

  const getPostTypeLabel = (type: CommunityPostLikeSummary['type']) => {
    if (type === 'roadmap') {
      return '로드맵 공유'
    }

    if (type === 'interview') {
      return '합격 후기 / 인터뷰'
    }

    return '일반글'
  }

  return (
    <div className="profile-page profile-fade-in">
      <section className="profile-card">
        <header className="saved-page-header">
          <div>
            <h1>저장한 관심 콘텐츠</h1>
            <p>좋아요한 커뮤니티 글과 스크랩한 채용공고를 한 번에 관리하세요.</p>
          </div>
          <div className="saved-tab-row" role="tablist" aria-label="저장 콘텐츠 탭">
            <button
              id={communityTabId}
              type="button"
              role="tab"
              aria-selected={selectedTab === 'community'}
              aria-controls={communityPanelId}
              className={`saved-tab-button ${selectedTab === 'community' ? 'is-active' : ''}`.trim()}
              onClick={() => setSelectedTab('community')}
            >
              좋아요한 커뮤니티
            </button>
            <button
              id={jobsTabId}
              type="button"
              role="tab"
              aria-selected={selectedTab === 'jobs'}
              aria-controls={jobsPanelId}
              className={`saved-tab-button ${selectedTab === 'jobs' ? 'is-active' : ''}`.trim()}
              onClick={() => setSelectedTab('jobs')}
            >
              스크랩한 채용공고
            </button>
          </div>
        </header>

        {isLoading ? <p className="saved-status">저장한 콘텐츠를 불러오는 중입니다...</p> : null}
        {!isLoading && isError ? <p className="saved-status">저장한 콘텐츠를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p> : null}

        {!isLoading && !isError && selectedTab === 'community' ? (
          likedPosts.length > 0 ? (
            <section id={communityPanelId} role="tabpanel" aria-labelledby={communityTabId} className="saved-card-list">
              {likedPosts.map((post) => (
                <button key={post.id} type="button" className="saved-content-card" onClick={() => navigate(`/community/${post.id}`)}>
                  <div className="saved-content-top">
                    <span className="saved-type-badge">{getPostTypeLabel(post.type)}</span>
                    <span className="saved-date-label">{formatDateLabel(post.createdAt)}</span>
                  </div>
                  <strong>{post.title}</strong>
                  <p>{post.author}</p>
                  <div className="saved-meta-row">
                    <span>좋아요 {post.likeCount}</span>
                    <span>댓글 {post.commentCount}</span>
                    <span>조회 {post.viewCount}</span>
                  </div>
                </button>
              ))}
            </section>
          ) : (
            <p id={communityPanelId} role="tabpanel" aria-labelledby={communityTabId} className="saved-status">
              좋아요한 커뮤니티 글이 없습니다.
            </p>
          )
        ) : null}

        {!isLoading && !isError && selectedTab === 'jobs' ? (
          scrappedJobs.length > 0 ? (
            <section id={jobsPanelId} role="tabpanel" aria-labelledby={jobsTabId} className="saved-card-list">
              {scrappedJobs.map((job) => (
                <article key={job.id} className="saved-content-card saved-job-card">
                  <button type="button" className="saved-content-click" onClick={() => navigate(routePaths.jobDetail(job.id))}>
                    <div className="saved-content-top">
                      <span className="saved-type-badge">채용공고</span>
                      <span className="saved-date-label">등록 {formatDateLabel(job.postedAt)}</span>
                    </div>
                    <strong>{job.title}</strong>
                    <p>{job.company}</p>
                    <div className="saved-meta-row">
                      <span>매칭률 {job.matchingScore == null ? '-' : `${job.matchingScore}%`}</span>
                      <span>마감 {job.deadline}</span>
                    </div>
                    <div className="saved-chip-row">
                      {job.techStacks.map((stack) => (
                        <span key={stack}>{stack}</span>
                      ))}
                    </div>
                  </button>
                  <JobScrapButton jobId={job.id} className="saved-job-scrap-button" />
                </article>
              ))}
            </section>
          ) : (
            <p id={jobsPanelId} role="tabpanel" aria-labelledby={jobsTabId} className="saved-status">
              스크랩한 채용공고가 없습니다.
            </p>
          )
        ) : null}
      </section>
    </div>
  )
}

export default ProfileSavedPage
