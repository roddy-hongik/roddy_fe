import { API_ENDPOINTS } from '../constants/endpoints'
import { httpClient } from '../client/httpClient'
import type {
  CommunityComment,
  CommunityPostDetail,
  CommunityPostFilters,
  CommunityPostSummary,
  CreateCommentPayload,
  CreateCommentResponse,
  CreateCommunityPostPayload,
  CreateCommunityPostResponse,
  InterviewSubtype,
  JobTrackTagKey,
} from '../../community/types/community'
import type { RoadmapStep } from '../types/roadmap'

type BackendCommunityPostCategory = 'FREE' | 'ROADMAP' | 'PASS_REVIEW_INTERVIEW'
type BackendCommunityJobCategory = 'B2C' | 'FINTECH' | 'B2B' | 'INFRA_DEVOPS' | 'GENERALIST'

interface BackendCommunityCommentResponse {
  id: number
  content: string
  author: string
  parentId: number | null
  depth: 0 | 1
  createdAt: string
}

interface BackendCommunityPostListItemResponse {
  id: number
  type: 'general' | 'roadmap' | 'interview'
  tag: JobTrackTagKey
  tags: string[]
  title: string
  authorName: string
  createdAt: string
  views: number
  likes: number
  commentCount: number
  excerpt: string | null
  content: string | null
  roadmapId: string | null
  roadmapTitle: string | null
  summary: string | null
  targetJob: string | null
  targetCompany: string | null
  recommendedSkills: string[] | null
  roadmapSteps: RoadmapStep[] | null
  description: string | null
  subtype: InterviewSubtype | null
  company: string | null
  jobRole: string | null
  preparationPeriod: string | null
  techStacks: string[] | null
  processSummary: string | null
  background: string | null
  preparationProcess: string | null
  experienceDetail: string | null
  advice: string | null
}

interface BackendCommunityPostDetailResponse extends BackendCommunityPostListItemResponse {
  content: string
  liked: boolean
  imageUrls: string[]
  comments: BackendCommunityCommentResponse[]
}

interface BackendCommunityPostListResponse {
  posts: BackendCommunityPostListItemResponse[]
}

interface BackendTogglePostLikeResponse {
  liked: boolean
  likeCount: number
}

const tagKeyToJobCategory: Record<JobTrackTagKey, BackendCommunityJobCategory> = {
  b2c: 'B2C',
  fintech: 'FINTECH',
  b2b: 'B2B',
  'infra-devops': 'INFRA_DEVOPS',
  generalist: 'GENERALIST',
}

const replacePostId = (path: string, postId: string | number) => path.replace(':id', encodeURIComponent(String(postId)))

const mapComments = (comments: BackendCommunityCommentResponse[]): CommunityComment[] =>
  comments.map((comment) => ({
    id: String(comment.id),
    author: comment.author,
    content: comment.content,
    depth: comment.depth,
    parentId: comment.parentId === null ? null : String(comment.parentId),
    createdAt: comment.createdAt,
  }))

const mapPostSummary = (item: BackendCommunityPostListItemResponse): CommunityPostSummary => {
  const base = {
    id: String(item.id),
    type: item.type,
    title: item.title,
    authorName: item.authorName,
    views: item.views,
    likes: item.likes,
    commentCount: item.commentCount,
    tag: item.tag,
    tags: item.tags,
    createdAt: item.createdAt,
  }

  if (base.type === 'roadmap') {
    return {
      ...base,
      type: 'roadmap',
      roadmapId: item.roadmapId ?? String(item.id),
      roadmapTitle: item.roadmapTitle ?? item.title,
      summary: item.summary ?? item.content ?? '',
      targetJob: item.targetJob ?? '',
      targetCompany: item.targetCompany ?? undefined,
      recommendedSkills: item.recommendedSkills ?? [],
      roadmapSteps: item.roadmapSteps ?? [],
      description: item.description ?? '',
    }
  }

  if (base.type === 'interview') {
    return {
      ...base,
      type: 'interview',
      subtype: item.subtype ?? 'accepted',
      company: item.company || '-',
      jobRole: item.jobRole ?? '',
      preparationPeriod: item.preparationPeriod ?? '미입력',
      techStacks: item.techStacks ?? [],
      processSummary: item.processSummary ?? '',
      background: item.background ?? '',
      preparationProcess: item.preparationProcess ?? '',
      experienceDetail: item.experienceDetail ?? '',
      advice: item.advice ?? '',
    }
  }

  return {
    ...base,
    type: 'general',
    excerpt: item.excerpt ?? item.content ?? '',
  }
}

const mapPostDetail = (item: BackendCommunityPostDetailResponse): CommunityPostDetail => {
  const summary = mapPostSummary(item)
  const comments = mapComments(item.comments)

  if (summary.type === 'roadmap') {
    return {
      ...summary,
      liked: item.liked,
      imageUrls: item.imageUrls,
      comments,
    }
  }

  if (summary.type === 'interview') {
    return {
      ...summary,
      liked: item.liked,
      imageUrls: item.imageUrls,
      comments,
    }
  }

  return {
    ...summary,
    content: item.content,
    imageUrls: item.imageUrls,
    liked: item.liked,
    comments,
  }
}

const toBackendPostCategory = (type: CreateCommunityPostPayload['type']): BackendCommunityPostCategory => {
  if (type === 'roadmap') {
    return 'ROADMAP'
  }

  if (type === 'interview') {
    return 'PASS_REVIEW_INTERVIEW'
  }

  return 'FREE'
}

const buildQueryString = (filters: CommunityPostFilters) => {
  const params = new URLSearchParams()

  if (filters.type && filters.type !== 'all') {
    params.set('postCategory', toBackendPostCategory(filters.type))
  }

  if (filters.trackTag && filters.trackTag !== 'all') {
    params.set('jobCategory', tagKeyToJobCategory[filters.trackTag])
  }

  if (filters.search) {
    params.set('keyword', filters.search)
  }

  if (filters.company) {
    params.set('company', filters.company)
  }

  if (filters.jobRole) {
    params.set('jobRole', filters.jobRole)
  }

  if (filters.techStack) {
    params.set('techStack', filters.techStack)
  }

  const query = params.toString()
  return query ? `${API_ENDPOINTS.community.posts}?${query}` : API_ENDPOINTS.community.posts
}

export async function getCommunityPosts(filters: CommunityPostFilters = {}): Promise<CommunityPostSummary[]> {
  const response = await httpClient<BackendCommunityPostListResponse>(buildQueryString(filters), {
    method: 'GET',
  })

  return response.posts.map(mapPostSummary)
}

export async function getCommunityPostDetail(postId: string): Promise<CommunityPostDetail> {
  const response = await httpClient<BackendCommunityPostDetailResponse>(replacePostId(API_ENDPOINTS.community.detail, postId), {
    method: 'GET',
  })

  return mapPostDetail(response)
}

export async function createCommunityPost(payload: CreateCommunityPostPayload): Promise<CreateCommunityPostResponse> {
  const formData = new FormData()
  formData.append('postCategory', toBackendPostCategory(payload.type))
  formData.append('jobCategory', tagKeyToJobCategory[payload.tag])
  formData.append('title', payload.title.trim())
  formData.append('content', payload.content.trim())

  payload.techStacks.forEach((stack) => {
    const normalizedStack = stack.trim()
    if (normalizedStack) {
      formData.append('tags', normalizedStack)
      formData.append('techStacks', normalizedStack)
    }
  })

  if (payload.company?.trim()) {
    formData.append('company', payload.company.trim())
  }

  if (payload.jobRole?.trim()) {
    formData.append('jobRole', payload.jobRole.trim())
  }

  if (payload.type === 'roadmap') {
    formData.append('roadmapTitle', payload.title.trim())
    formData.append('summary', payload.content.trim())
    formData.append('description', payload.content.trim())

    if (payload.jobRole?.trim()) {
      formData.append('targetJob', payload.jobRole.trim())
    }

    if (payload.company?.trim()) {
      formData.append('targetCompany', payload.company.trim())
    }

    payload.techStacks.forEach((stack) => {
      if (stack.trim()) {
        formData.append('recommendedSkills', stack.trim())
      }
    })
  }

  if (payload.type === 'interview') {
    formData.append('interviewSubtype', 'ACCEPTED')
    formData.append('preparationPeriod', '미입력')
    formData.append('processSummary', payload.content.trim())
    formData.append('background', payload.content.trim())
    formData.append('preparationProcess', payload.content.trim())
    formData.append('experienceDetail', payload.content.trim())
    formData.append('advice', payload.content.trim())

    if (payload.jobRole?.trim()) {
      formData.append('position', payload.jobRole.trim())
    }
  }

  if (payload.image) {
    formData.append('images', payload.image)
  }

  const response = await httpClient<{ id: number }>(API_ENDPOINTS.community.posts, {
    method: 'POST',
    body: formData,
  })

  return {
    id: String(response.id),
  }
}

export async function likeCommunityPost(postId: string): Promise<{ isLiked: boolean; likes: number }> {
  const response = await httpClient<BackendTogglePostLikeResponse>(replacePostId(API_ENDPOINTS.community.like, postId), {
    method: 'POST',
  })

  return {
    isLiked: response.liked,
    likes: response.likeCount,
  }
}

export async function reportCommunityPost(postId: string): Promise<{ success: boolean }> {
  const response = await httpClient<{ reported: boolean }>(replacePostId(API_ENDPOINTS.community.report, postId), {
    method: 'POST',
  })

  return { success: response.reported }
}

export async function addCommunityComment(postId: string, payload: CreateCommentPayload): Promise<CreateCommentResponse> {
  const response = await httpClient<BackendCommunityCommentResponse>(replacePostId(API_ENDPOINTS.community.comments, postId), {
    method: 'POST',
    body: JSON.stringify({
      content: payload.content,
      parentCommentId: payload.parentId ? Number(payload.parentId) : null,
    }),
  })

  return {
    id: String(response.id),
    author: response.author,
    content: response.content,
    depth: response.depth,
    parentId: response.parentId === null ? null : String(response.parentId),
    createdAt: response.createdAt,
  }
}

export async function getCommunityComments(postId: string): Promise<CreateCommentResponse[]> {
  const post = await getCommunityPostDetail(postId)
  return post.comments ?? []
}
