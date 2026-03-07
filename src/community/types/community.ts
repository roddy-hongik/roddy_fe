export type JobTrackTagKey = 'b2c' | 'fintech' | 'b2b' | 'infra-devops' | 'generalist'

export interface JobTrackTag {
  key: JobTrackTagKey
  label: string
  description: string
}

export interface CommunityPostSummary {
  id: string
  title: string
  authorName: string
  views: number
  likes: number
  tag: JobTrackTagKey
  createdAt: string
}

export interface CommunityComment {
  id: string
  author: string
  content: string
  depth: 0 | 1
  parentId: string | null
  createdAt: string
}

export interface CommunityPostDetail extends CommunityPostSummary {
  content: string
  imageUrls: string[]
  comments?: CommunityComment[]
}

export interface CreateCommunityPostPayload {
  title: string
  content: string
  tag: JobTrackTagKey
  image?: File | null
}

export interface CreateCommunityPostResponse {
  id: string
}

export interface CreateCommentPayload {
  content: string
  parentId: string | null
}

export interface CreateCommentResponse {
  id: string
  author: string
  content: string
  depth: 0 | 1
  parentId: string | null
  createdAt: string
}
