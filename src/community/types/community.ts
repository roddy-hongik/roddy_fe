import type { RoadmapStage, RoadmapStep } from '../../api/types/roadmap'

export type JobTrackTagKey = 'b2c' | 'fintech' | 'b2b' | 'infra-devops' | 'generalist'

export interface JobTrackTag {
  key: JobTrackTagKey
  label: string
  description: string
}

export type CommunityPostType = 'general' | 'roadmap' | 'interview'
export type CommunityPostListTab = 'all' | CommunityPostType
export type InterviewSubtype = 'accepted' | 'incumbent'

export interface CommunityComment {
  id: string
  author: string
  content: string
  depth: 0 | 1
  parentId: string | null
  createdAt: string
}

interface BaseCommunityPost {
  id: string
  type: CommunityPostType
  title: string
  authorName: string
  views: number
  likes: number
  commentCount: number
  tag: JobTrackTagKey
  tags: string[]
  createdAt: string
}

export interface GeneralPostSummary extends BaseCommunityPost {
  type: 'general'
  excerpt: string
}

export interface GeneralPostDetail extends GeneralPostSummary {
  content: string
  imageUrls: string[]
  liked?: boolean
  comments?: CommunityComment[]
}

export interface RoadmapSharePost extends BaseCommunityPost {
  type: 'roadmap'
  roadmapId: string
  roadmapTitle: string
  summary: string
  targetJob: string
  targetCompany?: string
  recommendedSkills: string[]
  roadmapSteps: RoadmapStep[]
  description: string
  liked?: boolean
  imageUrls?: string[]
  comments?: CommunityComment[]
}

export interface InterviewPost extends BaseCommunityPost {
  type: 'interview'
  subtype: InterviewSubtype
  company: string
  jobRole: string
  preparationPeriod: string
  techStacks: string[]
  processSummary: string
  background: string
  preparationProcess: string
  experienceDetail: string
  advice: string
  liked?: boolean
  imageUrls?: string[]
  comments?: CommunityComment[]
}

export type CommunityPostSummary = GeneralPostSummary | RoadmapSharePost | InterviewPost
export type CommunityPostDetail = GeneralPostDetail | RoadmapSharePost | InterviewPost

/** 게시글 목록 한 페이지. page 는 0부터 센다. */
export interface CommunityPostPage {
  posts: CommunityPostSummary[]
  page: number
  totalPages: number
}

/** 목록 필터의 선택지. 불러온 페이지와 상관없이 전체 글에서 모은 값이다. */
export interface CommunityFilterOptions {
  companies: string[]
  jobRoles: string[]
  techStacks: string[]
}

export interface CommunityPostFilters {
  type?: CommunityPostListTab
  trackTag?: JobTrackTagKey | 'all'
  search?: string
  company?: string
  jobRole?: string
  techStack?: string
}

export interface RoadmapShareCandidate {
  id: string
  roadmapTitle: string
  targetJob: string
  targetCompany: string
  recommendedSkills: string[]
  roadmapSteps: RoadmapStep[]
  createdAt: string
}

export interface CreateCommunityPostPayload {
  type: CommunityPostType
  tag: JobTrackTagKey
  title: string
  content: string
  company?: string
  jobRole?: string
  techStacks: string[]
  image?: File | null
  /** 로드맵 공유 글이 싣는 저장한 로드맵. */
  roadmap?: RoadmapShareCandidate | null
}

export interface CreateCommunityPostResponse {
  id: string
}

export interface CreateCommentPayload {
  content: string
  parentId?: string | null
  authorName?: string
}

export type CreateCommentResponse = CommunityComment

export type CommunityRoadmapStage = RoadmapStage
