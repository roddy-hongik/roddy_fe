import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCommunityPostDetail } from '../../api/services/communityService'
import AppTopNav from '../../shared/components/AppTopNav'
import { TAG_LABEL_MAP } from '../constants/jobTrackTags'
import CommentItem from '../components/CommentItem'
import InterviewDetailSection from '../components/InterviewDetailSection'
import { AlertIcon, EyeIcon, HeartIcon, MessageIcon } from '../components/icons'
import PostTypeBadge from '../components/PostTypeBadge'
import RoadmapDetailSection from '../components/RoadmapDetailSection'
import {
  getPostComments,
  removeComment,
  reportComment,
  reportPost,
  submitComment,
} from '../services/communityEngagementService'
import { useCommunityPostLike } from '../hooks/useCommunityLikes'
import type { CommunityComment, CommunityPostDetail } from '../types/community'
import { formatCommunityCount, formatCommunityDateTime } from '../utils/communityFormat'
import '../styles/community-pages.css'

function CommunityDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<CommunityPostDetail | null>(null)
  const [comments, setComments] = useState<CommunityComment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem('accessToken')))
  const [currentUserName, setCurrentUserName] = useState(localStorage.getItem('userName')?.trim() ?? '')
  const [commentInput, setCommentInput] = useState('')
  const [replyInput, setReplyInput] = useState('')
  const [replyingToId, setReplyingToId] = useState<string | null>(null)
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false)
  const { isLiked, isSubmitting: isLikeSubmitting, toggleLike } = useCommunityPostLike(id ?? '')

  useEffect(() => {
    const syncLoginStatus = () => {
      setIsLoggedIn(Boolean(localStorage.getItem('accessToken')))
      setCurrentUserName(localStorage.getItem('userName')?.trim() ?? '')
    }

    syncLoginStatus()
    window.addEventListener('storage', syncLoginStatus)

    return () => {
      window.removeEventListener('storage', syncLoginStatus)
    }
  }, [])

  useEffect(() => {
    if (!id) {
      navigate('/community', { replace: true })
      return
    }

    let isMounted = true

    const loadDetail = async () => {
      setIsLoading(true)
      setIsError(false)

      try {
        const resolvedPost = await getCommunityPostDetail(id)
        if (!isMounted) {
          return
        }

        setPost(resolvedPost)
      } catch {
        if (!isMounted) {
          return
        }

        setPost(null)
        setComments([])
        setIsError(true)
        return
      }

      try {
        const resolvedComments = await getPostComments(id)
        if (!isMounted) {
          return
        }

        setComments(resolvedComments)
      } catch {
        if (!isMounted) {
          return
        }

        setComments([])
        setIsError(true)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadDetail()

    return () => {
      isMounted = false
    }
  }, [id, navigate])

  const createdDate = useMemo(() => (post ? formatCommunityDateTime(post.createdAt) : ''), [post])
  const rootComments = useMemo(() => comments.filter((comment) => comment.depth === 0), [comments])
  const canDeleteComment = (comment: CommunityComment) =>
    isLoggedIn && Boolean(currentUserName) && comment.author.trim() === currentUserName

  const getRepliesByParentId = (parentId: string) => comments.filter((comment) => comment.depth === 1 && comment.parentId === parentId)

  const handleLike = async () => {
    if (!post || !isLoggedIn) {
      if (!isLoggedIn) {
        navigate('/login', { state: { from: { pathname: `/community/${id}` } } })
      }
      return
    }

    try {
      const response = await toggleLike()
      setPost((current) => (current ? { ...current, likes: response.likes } : current))
    } catch {
      // Keep previous UI state when toggling like fails.
    }
  }

  const handleReportPost = async () => {
    if (!post || !isLoggedIn) {
      if (!isLoggedIn) {
        navigate('/login', { state: { from: { pathname: `/community/${id}` } } })
      }
      return
    }

    try {
      await reportPost(post.id)
    } finally {
      alert('게시글 신고가 접수되었습니다.')
    }
  }

  const handleReportComment = async (commentId: string) => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: { pathname: `/community/${id}` } } })
      return
    }

    try {
      await reportComment(commentId)
    } finally {
      alert('댓글 신고가 접수되었습니다.')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: { pathname: `/community/${id}` } } })
      return
    }

    const previousComments = comments
    const nextComments = comments.filter((comment) => comment.id !== commentId && comment.parentId !== commentId)

    setComments(nextComments)
    setPost((current) => (current ? { ...current, commentCount: nextComments.length } : current))

    if (replyingToId === commentId) {
      setReplyingToId(null)
      setReplyInput('')
    }

    try {
      await removeComment(commentId)
    } catch {
      setComments(previousComments)
      setPost((current) => (current ? { ...current, commentCount: previousComments.length } : current))
    }
  }

  const createNextComment = async (parentId: string | null, content: string) => {
    if (!post || !content.trim()) {
      return false
    }

    if (!isLoggedIn) {
      navigate('/login', { state: { from: { pathname: `/community/${id}` } } })
      return false
    }

    setIsCommentSubmitting(true)

    try {
      const response = await submitComment(post.id, { content: content.trim(), parentId })
      setComments((current) => [...current, response])
      setPost((current) => (current ? { ...current, commentCount: current.commentCount + 1 } : current))
      return true
    } catch {
      return false
    } finally {
      setIsCommentSubmitting(false)
    }
  }

  const handleCreateRootComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const isCreated = await createNextComment(null, commentInput)
    if (isCreated) {
      setCommentInput('')
    }
  }

  const handleCreateReply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!replyingToId) {
      return
    }

    const isCreated = await createNextComment(replyingToId, replyInput)
    if (isCreated) {
      setReplyInput('')
      setReplyingToId(null)
    }
  }

  const handleReplyToggle = (commentId: string) => {
    setReplyInput('')
    setReplyingToId((current) => (current === commentId ? null : commentId))
  }

  if (isLoading) {
    return (
      <main className="community-page">
        <AppTopNav loginRedirectPath="/community" />
        <section className="community-container community-detail-panel">
          <p className="community-status-text">게시글을 불러오는 중입니다...</p>
        </section>
      </main>
    )
  }

  if (!post) {
    return (
      <main className="community-page">
        <AppTopNav loginRedirectPath="/community" />
        <section className="community-container community-detail-panel">
          <p className="community-status-text">게시글을 찾을 수 없습니다.</p>
        </section>
      </main>
    )
  }

  return (
    <main className="community-page">
      <AppTopNav loginRedirectPath="/community" />

      <article className="community-container community-detail-panel">
        <header className="community-detail-header">
          <div className="community-detail-title-wrap">
            <div className="community-post-badges">
              <span className="community-post-tag">{TAG_LABEL_MAP[post.tag]}</span>
              <PostTypeBadge post={post} />
            </div>
            <h1>{post.title}</h1>
            <div className="community-detail-meta">
              <span>{post.authorName}</span>
              <span>{createdDate}</span>
              <span className="community-inline-stat">
                <EyeIcon className="community-icon" />
                {formatCommunityCount(post.views)}
              </span>
              <span className="community-inline-stat">
                <MessageIcon className="community-icon" />
                {formatCommunityCount(post.commentCount)}
              </span>
            </div>
          </div>

          {isLoggedIn ? (
            <button type="button" className="community-outline-btn" onClick={handleReportPost}>
              <AlertIcon className="community-icon" />
              신고하기
            </button>
          ) : (
            <button type="button" className="community-outline-btn" onClick={() => navigate('/login', { state: { from: { pathname: `/community/${id}` } } })}>
              로그인 후 신고
            </button>
          )}
        </header>

        <section className="community-detail-body">
          {post.type === 'general' ? (
            <>
              <p>{post.content}</p>
              {post.imageUrls.length > 0 ? (
                <div className="community-image-grid">
                  {post.imageUrls.map((imageUrl) => (
                    <img key={imageUrl} src={imageUrl} alt="첨부 이미지" loading="lazy" />
                  ))}
                </div>
              ) : null}
            </>
          ) : null}

          {post.type === 'roadmap' ? <RoadmapDetailSection post={post} /> : null}
          {post.type === 'interview' ? <InterviewDetailSection post={post} /> : null}
        </section>

        <footer className="community-detail-actions">
          <button type="button" className={`community-primary-btn ${isLiked ? 'is-active' : ''}`.trim()} disabled={isLikeSubmitting} onClick={handleLike}>
            <HeartIcon className="community-icon" />
            {isLoggedIn ? (isLikeSubmitting ? '처리 중...' : isLiked ? '좋아요 취소' : '좋아요') : '로그인 후 좋아요'}
          </button>
          <strong>{formatCommunityCount(post.likes)}</strong>
        </footer>

        <section className="community-comments-section">
          <h2>댓글 {comments.length}</h2>
          {isError ? <p className="community-status-text">댓글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p> : null}

          <div className="community-comment-shell">
            <div className="community-comment-list">
              {rootComments.map((comment) => {
                const replies = getRepliesByParentId(comment.id)

                return (
                  <section key={comment.id} className="community-comment-thread">
                    <CommentItem
                      comment={comment}
                      isReplying={replyingToId === comment.id}
                      onReplyToggle={handleReplyToggle}
                      onReport={handleReportComment}
                      onDelete={handleDeleteComment}
                      canDelete={canDeleteComment(comment)}
                    />

                    {replies.map((reply) => (
                      <CommentItem
                        key={reply.id}
                        comment={reply}
                        isReply
                        canReply={false}
                        onReplyToggle={handleReplyToggle}
                        onReport={handleReportComment}
                        onDelete={handleDeleteComment}
                        canDelete={canDeleteComment(reply)}
                      />
                    ))}

                    {replyingToId === comment.id ? (
                      <form className="community-reply-form" onSubmit={handleCreateReply}>
                        <span>답글</span>
                        <input
                          value={replyInput}
                          onChange={(event) => setReplyInput(event.target.value)}
                          placeholder="답글을 입력해 주세요"
                          maxLength={400}
                        />
                        <button type="submit" className="community-primary-btn" disabled={isCommentSubmitting || !replyInput.trim()}>
                          등록
                        </button>
                      </form>
                    ) : null}
                  </section>
                )
              })}

              {comments.length === 0 ? <p className="community-status-text">아직 댓글이 없습니다. 첫 댓글을 남겨보세요.</p> : null}
            </div>
          </div>

          {isLoggedIn ? (
            <form className="community-comment-form" onSubmit={handleCreateRootComment}>
              <input
                type="text"
                value={commentInput}
                onChange={(event) => setCommentInput(event.target.value)}
                placeholder="댓글을 입력해 주세요"
                maxLength={400}
              />
              <button type="submit" className="community-primary-btn" disabled={isCommentSubmitting || !commentInput.trim()}>
                등록
              </button>
            </form>
          ) : (
            <div className="community-auth-notice">
              <p>댓글 작성과 좋아요는 로그인 후 사용할 수 있습니다.</p>
              <button type="button" className="community-outline-btn" onClick={() => navigate('/login', { state: { from: { pathname: `/community/${id}` } } })}>
                로그인
              </button>
            </div>
          )}
        </section>
      </article>
    </main>
  )
}

export default CommunityDetailPage
