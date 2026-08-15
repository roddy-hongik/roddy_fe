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
  JobTrackTagKey,
} from '../../community/types/community'

type BackendCommunityPostCategory = 'FREE' | 'ROADMAP' | 'PASS_REVIEW_INTERVIEW'
type BackendCommunityJobCategory = 'B2C' | 'FINTECH' | 'B2B' | 'INFRA_DEVOPS' | 'GENERALIST'

interface BackendCommunityCommentResponse {
  id: number
  content: string
  authorName: string
  createdAt: string
}

interface BackendCommunityPostListItemResponse {
  id: number
  postCategory: BackendCommunityPostCategory
  postCategoryDisplayName: string
  jobCategory: BackendCommunityJobCategory
  jobCategoryDisplayName: string
  title: string
  authorName: string
  createdAt: string
  viewCount: number
  likeCount: number
  company: string | null
  position: string | null
  techStacks: string[]
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

const jobCategoryToTagKey: Record<BackendCommunityJobCategory, JobTrackTagKey> = {
  B2C: 'b2c',
  FINTECH: 'fintech',
  B2B: 'b2b',
  INFRA_DEVOPS: 'infra-devops',
  GENERALIST: 'generalist',
}

const tagKeyToJobCategory: Record<JobTrackTagKey, BackendCommunityJobCategory> = {
  b2c: 'B2C',
  fintech: 'FINTECH',
  b2b: 'B2B',
  'infra-devops': 'INFRA_DEVOPS',
  generalist: 'GENERALIST',
}

const replacePostId = (path: string, postId: string | number) => path.replace(':id', encodeURIComponent(String(postId)))

const roadmapStages = ['기초', '심화', '실전 프로젝트'] as const

const createRoadmapSteps = (techStacks: string[]) =>
  techStacks.map((stack, index) => ({
    stage: roadmapStages[index % roadmapStages.length],
    goal: `${stack} 역량 강화`,
    topics: [stack],
    outputs: [`${stack} 기반 회고 정리`],
  }))

const mapComments = (comments: BackendCommunityCommentResponse[]): CommunityComment[] =>
  comments.map((comment) => ({
    id: String(comment.id),
    author: comment.authorName,
    content: comment.content,
    depth: 0,
    parentId: null,
    createdAt: comment.createdAt,
  }))

const buildTags = (item: BackendCommunityPostListItemResponse) =>
  Array.from(
    new Set(
      [item.postCategoryDisplayName, item.company, item.position, ...item.techStacks]
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  )

const mapPostCategoryToType = (category: BackendCommunityPostCategory) => {
  if (category === 'ROADMAP') {
    return 'roadmap' as const
  }

  if (category === 'PASS_REVIEW_INTERVIEW') {
    return 'interview' as const
  }

  return 'general' as const
}

const mapPostSummary = (item: BackendCommunityPostListItemResponse): CommunityPostSummary => {
  const base = {
    id: String(item.id),
    type: mapPostCategoryToType(item.postCategory),
    title: item.title,
    authorName: item.authorName,
    views: item.viewCount,
    likes: item.likeCount,
    commentCount: 0,
    tag: jobCategoryToTagKey[item.jobCategory],
    tags: buildTags(item),
    createdAt: item.createdAt,
  }

  if (base.type === 'roadmap') {
    return {
      ...base,
      type: 'roadmap',
      roadmapId: String(item.id),
      roadmapTitle: item.title,
      summary: [item.company, item.position].filter(Boolean).join(' · ') || item.postCategoryDisplayName,
      targetJob: item.position || item.jobCategoryDisplayName,
      targetCompany: item.company || undefined,
      recommendedSkills: item.techStacks,
      roadmapSteps: createRoadmapSteps(item.techStacks),
      description: '',
    }
  }

  if (base.type === 'interview') {
    return {
      ...base,
      type: 'interview',
      subtype: 'accepted',
      company: item.company || '-',
      jobRole: item.position || item.jobCategoryDisplayName,
      preparationPeriod: '미입력',
      techStacks: item.techStacks,
      processSummary: item.postCategoryDisplayName,
      background: '',
      preparationProcess: '',
      experienceDetail: '',
      advice: '',
    }
  }

  return {
    ...base,
    type: 'general',
    excerpt: [item.company, item.position, ...item.techStacks].filter(Boolean).join(' · '),
  }
}

const mapPostDetail = (item: BackendCommunityPostDetailResponse): CommunityPostDetail => {
  const summary = mapPostSummary(item)
  const comments = mapComments(item.comments)

  if (summary.type === 'roadmap') {
    return {
      ...summary,
      summary: item.content,
      description: item.content,
      liked: item.liked,
      imageUrls: item.imageUrls,
      comments,
    }
  }

  if (summary.type === 'interview') {
    return {
      ...summary,
      processSummary: item.content,
      background: item.content,
      preparationProcess: item.content,
      experienceDetail: item.content,
      advice: item.content,
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
    params.set('position', filters.jobRole)
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

  if (payload.company?.trim()) {
    formData.append('company', payload.company.trim())
  }

  if (payload.jobRole?.trim()) {
    formData.append('position', payload.jobRole.trim())
  }

  payload.techStacks.forEach((stack) => {
    if (stack.trim()) {
      formData.append('techStacks', stack.trim())
    }
  })

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
    body: JSON.stringify({ content: payload.content }),
  })

  return {
    id: String(response.id),
    author: response.authorName,
    content: response.content,
    depth: 0,
    parentId: null,
    createdAt: response.createdAt,
  }
}

export async function getCommunityComments(postId: string): Promise<CreateCommentResponse[]> {
  const post = await getCommunityPostDetail(postId)
  return post.comments ?? []
}
