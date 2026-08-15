import { TAG_LABEL_MAP } from '../constants/jobTrackTags'
import type { CommunityPostSummary } from '../types/community'
import { formatCommunityCount, formatCommunityDate } from '../utils/communityFormat'
import { EyeIcon, HeartIcon, MessageIcon } from './icons'
import PostTypeBadge from './PostTypeBadge'

interface PostListItemProps {
  post: CommunityPostSummary
  onClick: (postId: string) => void
}

function PostListItem({ post, onClick }: PostListItemProps) {
  const createdLabel = formatCommunityDate(post.createdAt)

  return (
    <button type="button" className={`community-post-card is-${post.type}`} onClick={() => onClick(post.id)}>
      <div className="community-post-main">
        <div className="community-post-badges">
          <span className="community-post-tag">{TAG_LABEL_MAP[post.tag]}</span>
          <PostTypeBadge post={post} />
        </div>

        <h3>{post.title}</h3>

        {post.type === 'general' ? <p className="community-post-description">{post.excerpt}</p> : null}

        {post.type === 'roadmap' ? (
          <div className="community-post-structured">
            <p className="community-post-description">{post.summary}</p>
            <div className="community-inline-info">
              <span>목표 직무: {post.targetJob}</span>
              <span>목표 기업: {post.targetCompany || '-'}</span>
              <span>단계 수: {post.roadmapSteps.length}단계</span>
            </div>
            <div className="community-chip-row">
              {post.recommendedSkills.map((skill) => (
                <span key={skill} className="community-meta-chip">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {post.type === 'interview' ? (
          <div className="community-post-structured">
            <p className="community-post-description">{post.processSummary}</p>
            <div className="community-inline-info">
              <span>기업: {post.company}</span>
              <span>직무: {post.jobRole}</span>
              <span>준비 기간: {post.preparationPeriod}</span>
            </div>
            <div className="community-chip-row">
              {post.techStacks.map((stack) => (
                <span key={stack} className="community-meta-chip">
                  {stack}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <p className="community-post-footer">
          {post.authorName} · {createdLabel}
        </p>
      </div>

      <div className="community-post-stats">
        <div className="community-stat-pill">
          <EyeIcon className="community-icon" />
          <span>{formatCommunityCount(post.views)}</span>
        </div>
        <div className="community-stat-pill">
          <HeartIcon className="community-icon" />
          <span>{formatCommunityCount(post.likes)}</span>
        </div>
        <div className="community-stat-pill">
          <MessageIcon className="community-icon" />
          <span>{formatCommunityCount(post.commentCount)}</span>
        </div>
      </div>
    </button>
  )
}

export default PostListItem
