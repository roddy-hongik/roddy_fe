import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCommunityPostDetail } from '../../api/services/communityService'
import { TAG_LABEL_MAP } from '../constants/jobTrackTags'
import CommentItem from '../components/CommentItem'
import { AlertIcon, EyeIcon, HeartIcon, MessageIcon } from '../components/icons'
import PostTypeBadge from '../components/PostTypeBadge'
import { deleteComment, getPostComments, reportComment, reportPost, submitComment } from '../services/communityEngagementService'
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
  const [commentInput, setCommentInput] = useState('')
  const [replyToId, setReplyToId] = useState<string | null>(null)
  const [pendingCommentId, setPendingCommentId] = useState<string | null>(null)
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false)
  const { isLiked, isSubmitting: isLikeSubmitting, toggleLike } = useCommunityPostLike(id ?? '', post?.liked ?? false)

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

    void loadDetail()

    return () => {
      isMounted = false
    }
  }, [id, navigate])

  const createdDate = useMemo(() => (post ? formatCommunityDateTime(post.createdAt) : ''), [post])

  const handleLike = async () => {
    if (!post || !isLoggedIn) {
      if (!isLoggedIn) {
        navigate('/login', { state: { from: { pathname: `/community/${id}` } } })
      }
      return
    }

    try {
      const response = await toggleLike()
      setPost((current) => (current ? { ...current, likes: response.likes, liked: response.isLiked } : current))
    } catch {
      // Keep current UI state when the API call fails.
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
      alert('게시글 신고가 접수되었습니다.')
    } catch {
      alert('게시글 신고에 실패했습니다.')
    }
  }

  const handleCreateComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!post || !commentInput.trim()) {
      return
    }

    if (!isLoggedIn) {
      navigate('/login', { state: { from: { pathname: `/community/${id}` } } })
      return
    }

    setIsCommentSubmitting(true)

    try {
      const response = await submitComment(post.id, { content: commentInput.trim(), parentId: replyToId ?? undefined })
      setComments((current) => [...current, response])
      setPost((current) => (current ? { ...current, commentCount: current.commentCount + 1 } : current))
      setCommentInput('')
      setReplyToId(null)
    } catch {
      alert('댓글 작성에 실패했습니다.')
    } finally {
      setIsCommentSubmitting(false)
    }
  }

  const handleReportComment = async (commentId: string) => {
    setPendingCommentId(commentId)
    try {
      await reportComment(commentId)
      alert('댓글 신고가 접수되었습니다.')
    } catch {
      alert('댓글 신고에 실패했습니다.')
    } finally {
      setPendingCommentId(null)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('댓글을 삭제하시겠습니까? 답글도 함께 삭제됩니다.')) {
      return
    }

    setPendingCommentId(commentId)
    try {
      await deleteComment(commentId)
      const removedIds = new Set(
        comments.filter((comment) => comment.id === commentId || comment.parentId === commentId).map((comment) => comment.id),
      )
      setComments((current) => current.filter((comment) => !removedIds.has(comment.id)))
      setPost((current) => current ? { ...current, commentCount: Math.max(0, current.commentCount - removedIds.size) } : current)
      if (replyToId && removedIds.has(replyToId)) {
        setReplyToId(null)
      }
    } catch {
      alert('댓글 삭제에 실패했습니다.')
    } finally {
      setPendingCommentId(null)
    }
  }

  if (isLoading) {
    return (
      <main className="community-page">
        <section className="community-container community-detail-panel">
          <p className="community-status-text">게시글을 불러오는 중입니다...</p>
        </section>
      </main>
    )
  }

  if (!post) {
    return (
      <main className="community-page">
        <section className="community-container community-detail-panel">
          <p className="community-status-text">게시글을 찾을 수 없습니다.</p>
        </section>
      </main>
    )
  }

  return (
    <main className="community-page">
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
          {'content' in post ? <p>{post.content}</p> : null}
          {'description' in post && post.description ? <p>{post.description}</p> : null}
          {'processSummary' in post && post.processSummary ? <p>{post.processSummary}</p> : null}

          {'imageUrls' in post && post.imageUrls && post.imageUrls.length > 0 ? (
            <div className="community-image-grid">
              {post.imageUrls.map((imageUrl) => (
                <img key={imageUrl} src={imageUrl} alt="첨부 이미지" loading="lazy" />
              ))}
            </div>
          ) : null}
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
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  isReply={comment.depth === 1}
                  canReply={isLoggedIn && comment.depth === 0 && pendingCommentId === null}
                  canReport={isLoggedIn && !comment.mine && pendingCommentId === null}
                  canDelete={comment.mine && pendingCommentId === null}
                  isReplying={replyToId === comment.id}
                  onReplyToggle={(commentId) => setReplyToId((current) => current === commentId ? null : commentId)}
                  onReport={handleReportComment}
                  onDelete={handleDeleteComment}
                />
              ))}
            </div>

            <form className="community-comment-form" onSubmit={handleCreateComment}>
              <label htmlFor="community-comment-input">{replyToId ? '답글 작성' : '댓글 작성'}</label>
              <textarea
                id="community-comment-input"
                value={commentInput}
                onChange={(event) => setCommentInput(event.target.value)}
                placeholder={isLoggedIn ? (replyToId ? '답글을 입력해 주세요' : '댓글을 입력해 주세요') : '로그인 후 댓글을 작성할 수 있습니다'}
                rows={4}
                maxLength={400}
                disabled={!isLoggedIn || isCommentSubmitting}
              />
              <button type="submit" className="community-primary-btn" disabled={!isLoggedIn || isCommentSubmitting || !commentInput.trim()}>
                {isCommentSubmitting ? '등록 중...' : '댓글 등록'}
              </button>
              {replyToId ? <button type="button" className="community-outline-btn" onClick={() => setReplyToId(null)}>답글 취소</button> : null}
            </form>
          </div>
        </section>
      </article>
    </main>
  )
}

export default CommunityDetailPage
