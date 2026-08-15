import type { CommunityPostSummary, InterviewSubtype } from '../types/community'

const INTERVIEW_SUBTYPE_LABEL_MAP: Record<InterviewSubtype, string> = {
  accepted: '합격 후기',
  incumbent: '현직자 인터뷰',
}

interface PostTypeBadgeProps {
  post: CommunityPostSummary
}

function PostTypeBadge({ post }: PostTypeBadgeProps) {
  const label =
    post.type === 'general' ? '자유글' : post.type === 'roadmap' ? '로드맵 공유' : INTERVIEW_SUBTYPE_LABEL_MAP[post.subtype]

  return <span className={`community-post-type-badge is-${post.type}`}>{label}</span>
}

export default PostTypeBadge
