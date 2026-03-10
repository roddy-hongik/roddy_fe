import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  addCommunityComment,
  deleteCommunityComment,
  getCommunityComments,
  getCommunityPostDetail,
  likeCommunityPost,
  reportCommunityComment,
  reportCommunityPost,
} from '../../api/services/communityService'
import { TAG_LABEL_MAP } from '../constants/jobTrackTags'
import { mockCommunityPostDetails } from '../data/mockCommunityData'
import CommentItem from '../components/CommentItem'
import CommunityTopNav from '../components/CommunityTopNav'
import { AlertIcon, EyeIcon, HeartIcon } from '../components/icons'
import type { CommunityComment, CommunityPostDetail } from '../types/community'
import '../styles/community-pages.css'

function CommunityDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<CommunityPostDetail | null>(null)
  const [comments, setComments] = useState<CommunityComment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem('accessToken')))
  const [commentInput, setCommentInput] = useState('')
  const [replyInput, setReplyInput] = useState('')
  const [replyingToId, setReplyingToId] = useState<string | null>(null)
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false)

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

      const fallbackPost = mockCommunityPostDetails.find((item) => item.id === id) ?? null
      let resolvedPost: CommunityPostDetail | null = null

      try {
        resolvedPost = await getCommunityPostDetail(id)
      } catch {
        resolvedPost = fallbackPost
      }

      if (!isMounted) {
        return
      }

      setPost(resolvedPost)

      if (!resolvedPost) {
        setComments([])
        setIsLoading(false)
        return
      }

      try {
        const remoteComments = await getCommunityComments(id)
        if (!isMounted) {
          return
        }
        setComments(remoteComments)
      } catch {
        if (!isMounted) {
          return
        }
        setComments(resolvedPost.comments ?? fallbackPost?.comments ?? [])
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

  const createdDate = useMemo(() => {
    if (!post) {
      return ''
    }
    return new Date(post.createdAt).toLocaleDateString('ko-KR')
  }, [post])

  const rootComments = useMemo(() => comments.filter((comment) => comment.depth === 0), [comments])

  const getRepliesByParentId = (parentId: string) => comments.filter((comment) => comment.depth === 1 && comment.parentId === parentId)

  const handleLike = async () => {
    if (!post || !isLoggedIn) {
      if (!isLoggedIn) {
        navigate('/login', { state: { from: { pathname: `/community/${id}` } } })
      }
      return
    }

    const previousLikes = post.likes
    setPost({ ...post, likes: previousLikes + 1 })

    try {
      await likeCommunityPost(post.id)
    } catch {
      setPost((current) => (current ? { ...current, likes: previousLikes } : current))
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
      await reportCommunityPost(post.id)
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
      await reportCommunityComment(commentId)
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

    setComments((current) => current.filter((comment) => comment.id !== commentId && comment.parentId !== commentId))

    if (replyingToId === commentId) {
      setReplyingToId(null)
      setReplyInput('')
    }

    try {
      await deleteCommunityComment(commentId)
    } catch {
      setComments(previousComments)
    }
  }

  const createComment = async (parentId: string | null, content: string) => {
    if (!post || !content.trim()) {
      return
    }

    if (!isLoggedIn) {
      navigate('/login', { state: { from: { pathname: `/community/${id}` } } })
      return
    }

    setIsCommentSubmitting(true)

    try {
      const response = await addCommunityComment(post.id, { content: content.trim(), parentId })
      setComments((current) => [...current, response])
    } catch {
      const fallbackComment: CommunityComment = {
        id: `local-${Date.now()}`,
        author: '나',
        content: content.trim(),
        depth: parentId ? 1 : 0,
        parentId,
        createdAt: new Date().toISOString(),
      }
      setComments((current) => [...current, fallbackComment])
    } finally {
      setIsCommentSubmitting(false)
    }
  }

  const handleCreateRootComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await createComment(null, commentInput)
    setCommentInput('')
  }

  const handleCreateReply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!replyingToId) {
      return
    }

    await createComment(replyingToId, replyInput)
    setReplyInput('')
    setReplyingToId(null)
  }

  const handleReplyToggle = (commentId: string) => {
    setReplyInput('')
    setReplyingToId((current) => (current === commentId ? null : commentId))
  }

  if (isLoading) {
    return (
      <main className="community-page">
        <CommunityTopNav />
        <section className="community-container community-detail-panel">
          <p className="community-status-text">게시글을 불러오는 중입니다...</p>
        </section>
      </main>
    )
  }

  if (!post) {
    return (
      <main className="community-page">
        <CommunityTopNav />
        <section className="community-container community-detail-panel">
          <p className="community-status-text">게시글을 찾을 수 없습니다.</p>
        </section>
      </main>
    )
  }

  return (
    <main className="community-page">
      <CommunityTopNav />

      <article className="community-container community-detail-panel">
        <header className="community-detail-header">
          <div className="community-detail-title-wrap">
            <span className="community-post-tag">{TAG_LABEL_MAP[post.tag]}</span>
            <h1>{post.title}</h1>
            <div className="community-detail-meta">
              <span>{post.authorName}</span>
              <span>{createdDate}</span>
              <span className="community-inline-stat">
                <EyeIcon className="community-icon" />
                {post.views}
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
          <p>{post.content}</p>
          {post.imageUrls.length > 0 && (
            <div className="community-image-grid">
              {post.imageUrls.map((imageUrl) => (
                <img key={imageUrl} src={imageUrl} alt="첨부 이미지" loading="lazy" />
              ))}
            </div>
          )}
        </section>

        <footer className="community-detail-actions">
          <button
            type="button"
            className="community-primary-btn"
            onClick={handleLike}
          >
            <HeartIcon className="community-icon" />
            {isLoggedIn ? '좋아요' : '로그인 후 좋아요'}
          </button>
          <strong>{post.likes}</strong>
        </footer>

        <section className="community-comments-section">
          <h2>댓글 {comments.length}</h2>

          <div className="community-comment-shell">
            <div className="community-comment-list">
              {rootComments.map((comment) => {
                const replies = getRepliesByParentId(comment.id)

                return (
                  <div key={comment.id} className="community-comment-thread">
                    <CommentItem
                      comment={comment}
                      canReply={isLoggedIn}
                      canReport={isLoggedIn}
                      canDelete={isLoggedIn}
                      isReplying={replyingToId === comment.id}
                      onReplyToggle={handleReplyToggle}
                      onReport={handleReportComment}
                      onDelete={handleDeleteComment}
                    />

                    {isLoggedIn && replyingToId === comment.id && (
                      <form className="community-reply-form" onSubmit={handleCreateReply}>
                        <span className="community-reply-prefix">└</span>
                        <input
                          type="text"
                          value={replyInput}
                          onChange={(event) => setReplyInput(event.target.value)}
                          placeholder="답글을 입력해 주세요"
                        />
                        <button type="submit" className="community-primary-btn" disabled={isCommentSubmitting}>
                          {isCommentSubmitting ? '등록 중...' : '답글 등록'}
                        </button>
                      </form>
                    )}

                    {replies.map((reply) => (
                      <CommentItem
                        key={reply.id}
                        comment={reply}
                        isReply
                        canReply={false}
                        canReport={isLoggedIn}
                        canDelete={isLoggedIn}
                        onReplyToggle={handleReplyToggle}
                        onReport={handleReportComment}
                        onDelete={handleDeleteComment}
                      />
                    ))}
                  </div>
                )
              })}
            </div>
          </div>

          {isLoggedIn ? (
            <form className="community-comment-form" onSubmit={handleCreateRootComment}>
              <input
                type="text"
                value={commentInput}
                onChange={(event) => setCommentInput(event.target.value)}
                placeholder="댓글을 입력해 주세요"
              />
              <button type="submit" className="community-primary-btn" disabled={isCommentSubmitting}>
                {isCommentSubmitting ? '등록 중...' : '댓글 쓰기'}
              </button>
            </form>
          ) : (
            <div className="community-auth-notice">
              <p>댓글 작성, 답글, 좋아요, 신고는 로그인 후 이용할 수 있습니다.</p>
              <button type="button" className="community-outline-btn" onClick={() => navigate('/login', { state: { from: { pathname: `/community/${id}` } } })}>
                로그인 하러 가기
              </button>
            </div>
          )}
        </section>
      </article>
    </main>
  )
}

export default CommunityDetailPage
