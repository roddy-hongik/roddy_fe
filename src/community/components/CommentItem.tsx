import type { CommunityComment } from '../types/community'
import { AlertIcon, MessageIcon } from './icons'

interface CommentItemProps {
  comment: CommunityComment
  isReply?: boolean
  canReply?: boolean
  canReport?: boolean
  canDelete?: boolean
  isReplying?: boolean
  onReplyToggle: (commentId: string) => void
  onReport: (commentId: string) => void
  onDelete: (commentId: string) => void
}

function CommentItem({
  comment,
  isReply = false,
  canReply = true,
  canReport = true,
  canDelete = true,
  isReplying = false,
  onReplyToggle,
  onReport,
  onDelete,
}: CommentItemProps) {
  return (
    <article className={`community-comment-item ${isReply ? 'is-reply' : ''}`}>
      <div className="community-comment-top">
        <div className="community-comment-author-wrap">
          {isReply && <span className="community-reply-prefix">└</span>}
          <strong>{comment.author}</strong>
        </div>
        <time>{new Date(comment.createdAt).toLocaleDateString('ko-KR')}</time>
      </div>
      <p>{comment.content}</p>
      <div className="community-comment-actions">
        {canReply && (
          <button type="button" onClick={() => onReplyToggle(comment.id)}>
            <MessageIcon className="community-icon" />
            {isReplying ? '답글 취소' : '답글 달기'}
          </button>
        )}
        {canReport ? (
          <button type="button" onClick={() => onReport(comment.id)}>
            <AlertIcon className="community-icon" />
            신고
          </button>
        ) : null}
        {canDelete ? (
          <button type="button" onClick={() => onDelete(comment.id)}>
            삭제
          </button>
        ) : null}
      </div>
    </article>
  )
}

export default CommentItem
