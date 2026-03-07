import { useMemo } from 'react'
import { TAG_LABEL_MAP } from '../constants/jobTrackTags'
import type { CommunityPostSummary } from '../types/community'
import { EyeIcon, HeartIcon } from './icons'

interface PostListItemProps {
  post: CommunityPostSummary
  onClick: (postId: string) => void
}

function PostListItem({ post, onClick }: PostListItemProps) {
  const createdLabel = useMemo(() => {
    const date = new Date(post.createdAt)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
  }, [post.createdAt])

  return (
    <button type="button" className="community-post-card" onClick={() => onClick(post.id)}>
      <div className="community-post-main">
        <span className="community-post-tag">{TAG_LABEL_MAP[post.tag]}</span>
        <h3>{post.title}</h3>
        <p>
          {post.authorName} · {createdLabel}
        </p>
      </div>

      <div className="community-post-stats">
        <div className="community-stat-pill">
          <EyeIcon className="community-icon" />
          <span>{post.views}</span>
        </div>
        <div className="community-stat-pill">
          <HeartIcon className="community-icon" />
          <span>{post.likes}</span>
        </div>
      </div>
    </button>
  )
}

export default PostListItem
