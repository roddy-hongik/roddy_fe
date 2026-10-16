import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLikedCommunityPosts, type CommunityPostLikeSummary } from '../../community/services/communityLikeService'
import JobScrapButton from '../../jobs/components/JobScrapButton'
import { getScrappedJobPostings } from '../../jobs/services/jobPostingService'
import type { JobPostingSummary } from '../../jobs/types/jobPosting'
import { formatDeadline, formatPostedAt } from '../../jobs/utils/jobFormat'
import { routePaths } from '../../routes/paths'
import { formatDateLabel } from '../../shared/utils/dateFormat'

type SavedTab = 'community' | 'jobs'

function ProfileSavedPage() {
  const navigate = useNavigate()
  const [selectedTab, setSelectedTab] = useState<SavedTab>('community')
  const [likedPosts, setLikedPosts] = useState<CommunityPostLikeSummary[]>([])
  /** 좋아요한 글은 페이지로 받는다. 화면에 반영된 마지막 페이지다. */
  const [likedPage, setLikedPage] = useState(0)
  const [likedTotalPages, setLikedTotalPages] = useState(0)
  const [isLoadingMoreLiked, setIsLoadingMoreLiked] = useState(false)
  const [likedMoreError, setLikedMoreError] = useState(false)
  const [scrappedJobs, setScrappedJobs] = useState<JobPostingSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  /** 탭마다 따로 들고 있어야 한쪽만 실패했을 때 그 탭을 "저장한 게 없다"고 잘못 말하지 않는다. */
  const [likedError, setLikedError] = useState(false)
  const [scrappedError, setScrappedError] = useState(false)
  const isMountedRef = useRef(true)
  const communityTabId = 'saved-community-tab'
  const jobsTabId = 'saved-jobs-tab'
  const communityPanelId = 'saved-community-panel'
  const jobsPanelId = 'saved-jobs-panel'

  const loadSavedContents = useCallback(async () => {
    setIsLoading(true)
    setLikedError(false)
    setScrappedError(false)

    try {
      const [likedResult, scrappedResult] = await Promise.allSettled([getLikedCommunityPosts(), getScrappedJobPostings()])

      if (!isMountedRef.current) {
        return
      }

      if (likedResult.status === 'fulfilled') {
        setLikedPosts(likedResult.value.posts)
        setLikedPage(likedResult.value.page)
        setLikedTotalPages(likedResult.value.totalPages)
        setLikedMoreError(false)
      } else {
        setLikedPosts([])
        setLikedError(true)
      }

      if (scrappedResult.status === 'fulfilled') {
        setScrappedJobs(scrappedResult.value)
      } else {
        setScrappedJobs([])
        setScrappedError(true)
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true

    void loadSavedContents()

    return () => {
      isMountedRef.current = false
    }
  }, [loadSavedContents])

  const hasMoreLiked = likedPage + 1 < likedTotalPages

  const handleLoadMoreLiked = async () => {
    setIsLoadingMoreLiked(true)
    setLikedMoreError(false)

    try {
      const next = await getLikedCommunityPosts(likedPage + 1)
      if (!isMountedRef.current) {
        return
      }

      // 앞 페이지를 받은 뒤 새로 좋아요한 글이 있으면 페이지 경계가 밀려 이미 받은 글이 다시 온다.
      setLikedPosts((previous) => [
        ...previous,
        ...next.posts.filter((post) => !previous.some((existing) => existing.id === post.id)),
      ])
      setLikedPage(next.page)
      setLikedTotalPages(next.totalPages)
    } catch {
      if (isMountedRef.current) {
        setLikedMoreError(true)
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingMoreLiked(false)
      }
    }
  }

  /** 스크랩을 해제하면 목록에서 바로 빼준다. 스크랩한 공고만 모아 보는 화면이기 때문이다. */
  const handleJobScrapToggled = (jobPostingId: number, isScrapped: boolean) => {
    setScrappedJobs((previous) =>
      isScrapped
        ? previous.map((job) => (job.id === jobPostingId ? { ...job, isScrapped } : job))
        : previous.filter((job) => job.id !== jobPostingId),
    )
  }

  const getPostTypeLabel = (type: CommunityPostLikeSummary['type']) => {
    if (type === 'roadmap') {
      return '로드맵 공유'
    }

    if (type === 'interview') {
      return '합격 후기 / 인터뷰'
    }

    return '일반글'
  }

  const renderLoadFailure = (panelId: string, tabId: string, message: string) => (
    <div id={panelId} role="tabpanel" aria-labelledby={tabId} className="saved-status-block">
      <p>{message}</p>
      <button type="button" className="saved-retry-button" onClick={() => void loadSavedContents()}>
        다시 시도
      </button>
    </div>
  )

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

        {!isLoading && selectedTab === 'community' ? (
          likedError ? (
            renderLoadFailure(communityPanelId, communityTabId, '좋아요한 커뮤니티 글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
          ) : likedPosts.length > 0 ? (
            <>
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
              {hasMoreLiked ? (
                <button type="button" className="saved-retry-button" disabled={isLoadingMoreLiked} onClick={() => void handleLoadMoreLiked()}>
                  {isLoadingMoreLiked ? '불러오는 중...' : '더 보기'}
                </button>
              ) : null}
              {likedMoreError ? <p className="saved-status">다음 글을 불러오지 못했습니다. 다시 시도해 주세요.</p> : null}
            </>
          ) : (
            <p id={communityPanelId} role="tabpanel" aria-labelledby={communityTabId} className="saved-status">
              좋아요한 커뮤니티 글이 없습니다.
            </p>
          )
        ) : null}

        {!isLoading && selectedTab === 'jobs' ? (
          scrappedError ? (
            renderLoadFailure(jobsPanelId, jobsTabId, '스크랩한 채용공고를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
          ) : scrappedJobs.length > 0 ? (
            <section id={jobsPanelId} role="tabpanel" aria-labelledby={jobsTabId} className="saved-card-list">
              {scrappedJobs.map((job) => (
                <article key={job.id} className="saved-content-card saved-job-card">
                  <button type="button" className="saved-content-click" onClick={() => navigate(routePaths.jobDetail(String(job.id)))}>
                    <div className="saved-content-top">
                      <span className="saved-type-badge">채용공고</span>
                      <span className="saved-date-label">등록 {formatPostedAt(job.postedAt) || '-'}</span>
                    </div>
                    <strong>{job.title}</strong>
                    <p>{job.company}</p>
                    <div className="saved-meta-row">
                      <span>{job.location ?? '근무지 정보 없음'}</span>
                      <span>마감 {formatDeadline(job.deadline)}</span>
                    </div>
                  </button>
                  <JobScrapButton
                    jobPostingId={job.id}
                    isScrapped={job.isScrapped}
                    className="saved-job-scrap-button"
                    onToggled={(isScrapped) => handleJobScrapToggled(job.id, isScrapped)}
                  />
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
