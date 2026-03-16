import { TAG_LABEL_MAP } from '../../community/constants/jobTrackTags'
import { mockCommunityPostDetails } from '../../community/data/mockCommunityData'
import type {
  CommunityComment,
  CommunityPostDetail,
  CommunityPostFilters,
  CommunityPostSummary,
  CreateCommentPayload,
  CreateCommentResponse,
  CreateCommunityPostPayload,
  CreateCommunityPostResponse,
} from '../../community/types/community'

const COMMUNITY_STORAGE_KEY = 'roddy.community.posts.v3'

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })

const cloneValue = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const normalizeCommentCount = (comments?: CommunityComment[]) => comments?.length ?? 0

const toSummary = (post: CommunityPostDetail): CommunityPostSummary => {
  if (post.type === 'general') {
    return {
      id: post.id,
      type: 'general',
      title: post.title,
      authorName: post.authorName,
      views: post.views,
      likes: post.likes,
      commentCount: normalizeCommentCount(post.comments),
      tag: post.tag,
      tags: post.tags,
      createdAt: post.createdAt,
      excerpt: post.excerpt,
    }
  }

  return {
    ...post,
    commentCount: normalizeCommentCount(post.comments),
    comments: undefined,
  }
}

const readStoredPosts = (): CommunityPostDetail[] => {
  const raw = localStorage.getItem(COMMUNITY_STORAGE_KEY)

  if (!raw) {
    return cloneValue(mockCommunityPostDetails)
  }

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return cloneValue(mockCommunityPostDetails)
    }

    return parsed as CommunityPostDetail[]
  } catch {
    return cloneValue(mockCommunityPostDetails)
  }
}

const writeStoredPosts = (posts: CommunityPostDetail[]) => {
  localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(posts))
}

const ensureSeedData = () => {
  if (!localStorage.getItem(COMMUNITY_STORAGE_KEY)) {
    writeStoredPosts(cloneValue(mockCommunityPostDetails))
  }
}

const sortPosts = (posts: CommunityPostDetail[]) => posts.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))

const matchesSearch = (post: CommunityPostSummary, keyword: string) => {
  const normalizedKeyword = keyword.trim().toLowerCase()

  if (!normalizedKeyword) {
    return true
  }

  const searchable = [
    post.title,
    post.authorName,
    ...post.tags,
    post.type === 'general' ? post.excerpt : '',
    post.type === 'roadmap' ? `${post.summary} ${post.targetJob} ${post.targetCompany ?? ''} ${post.recommendedSkills.join(' ')}` : '',
    post.type === 'interview' ? `${post.company} ${post.jobRole} ${post.processSummary} ${post.techStacks.join(' ')}` : '',
  ]
    .join(' ')
    .toLowerCase()

  return searchable.includes(normalizedKeyword)
}

const matchesFilters = (post: CommunityPostSummary, filters: CommunityPostFilters) => {
  if (filters.type && filters.type !== 'all' && post.type !== filters.type) {
    return false
  }

  if (filters.trackTag && filters.trackTag !== 'all' && post.tag !== filters.trackTag) {
    return false
  }

  if (filters.company && post.type === 'interview' && post.company !== filters.company) {
    return false
  }

  if (filters.company && post.type !== 'interview') {
    return false
  }

  if (filters.jobRole) {
    if (post.type === 'interview' && post.jobRole !== filters.jobRole) {
      return false
    }

    if (post.type === 'roadmap' && post.targetJob !== filters.jobRole) {
      return false
    }

    if (post.type === 'general') {
      return false
    }
  }

  if (filters.techStack) {
    if (post.type === 'interview' && !post.techStacks.includes(filters.techStack)) {
      return false
    }

    if (post.type === 'roadmap' && !post.recommendedSkills.includes(filters.techStack)) {
      return false
    }

    if (post.type === 'general') {
      return false
    }
  }

  return matchesSearch(post, filters.search ?? '')
}

export async function getCommunityPosts(filters: CommunityPostFilters = {}): Promise<CommunityPostSummary[]> {
  ensureSeedData()
  await wait(180)

  const storedPosts = sortPosts(readStoredPosts())
  return storedPosts.map(toSummary).filter((post) => matchesFilters(post, filters))
}

export async function getCommunityPostDetail(postId: string): Promise<CommunityPostDetail> {
  ensureSeedData()
  await wait(140)

  const storedPosts = readStoredPosts()
  const postIndex = storedPosts.findIndex((item) => item.id === postId)

  if (postIndex < 0) {
    throw new Error('Post not found')
  }

  storedPosts[postIndex] = {
    ...storedPosts[postIndex],
    views: storedPosts[postIndex].views + 1,
    commentCount: normalizeCommentCount(storedPosts[postIndex].comments),
  }

  writeStoredPosts(storedPosts)

  return cloneValue(storedPosts[postIndex])
}

export async function createCommunityPost(payload: CreateCommunityPostPayload): Promise<CreateCommunityPostResponse> {
  ensureSeedData()
  await wait(220)

  const authorName = payload.authorName?.trim() || localStorage.getItem('userName')?.trim() || 'Roddy 사용자'
  const createdAt = new Date().toISOString()
  const newPostId = `community-${Date.now()}`
  const storedPosts = readStoredPosts()

  const basePost = {
    id: newPostId,
    title: payload.title.trim(),
    authorName,
    views: 0,
    likes: 0,
    commentCount: 0,
    tag: payload.tag,
    createdAt,
  }

  const nextPost: CommunityPostDetail =
    payload.type === 'general'
      ? {
          ...basePost,
          type: 'general',
          tags: [TAG_LABEL_MAP[payload.tag], '자유글'],
          excerpt: payload.content.trim().slice(0, 100),
          content: payload.content.trim(),
          imageUrls: [],
          comments: [],
        }
      : payload.type === 'roadmap'
        ? {
            ...basePost,
            type: 'roadmap',
            tags: Array.from(new Set(['로드맵 공유', payload.targetJob, payload.targetCompany ?? '', ...payload.recommendedSkills, ...(payload.tags ?? [])].filter(Boolean))),
            roadmapId: payload.roadmapId,
            roadmapTitle: payload.roadmapTitle,
            summary: payload.summary.trim(),
            targetJob: payload.targetJob,
            targetCompany: payload.targetCompany?.trim(),
            recommendedSkills: payload.recommendedSkills,
            roadmapSteps: payload.roadmapSteps,
            description: payload.summary.trim(),
            comments: [],
          }
        : {
            ...basePost,
            type: 'interview',
            tags: Array.from(
              new Set([payload.company, payload.jobRole, ...payload.techStacks, ...(payload.tags ?? []), payload.subtype === 'accepted' ? '취업후기' : '현직자 인터뷰']),
            ),
            subtype: payload.subtype,
            company: payload.company.trim(),
            jobRole: payload.jobRole.trim(),
            preparationPeriod: payload.preparationPeriod.trim(),
            techStacks: payload.techStacks,
            processSummary: payload.processSummary.trim(),
            background: payload.background.trim(),
            preparationProcess: payload.preparationProcess.trim(),
            experienceDetail: payload.experienceDetail.trim(),
            advice: payload.advice.trim(),
            comments: [],
          }

  writeStoredPosts([nextPost, ...storedPosts])

  return { id: newPostId }
}

export async function likeCommunityPost(postId: string): Promise<{ likes: number }> {
  ensureSeedData()
  await wait(100)

  const storedPosts = readStoredPosts()
  const postIndex = storedPosts.findIndex((item) => item.id === postId)

  if (postIndex < 0) {
    throw new Error('Post not found')
  }

  storedPosts[postIndex] = {
    ...storedPosts[postIndex],
    likes: storedPosts[postIndex].likes + 1,
  }

  writeStoredPosts(storedPosts)

  return { likes: storedPosts[postIndex].likes }
}

export async function reportCommunityPost(postId: string): Promise<{ success: boolean }> {
  void postId
  await wait(120)
  return { success: true }
}

export async function addCommunityComment(postId: string, payload: CreateCommentPayload): Promise<CreateCommentResponse> {
  ensureSeedData()
  await wait(160)

  const storedPosts = readStoredPosts()
  const postIndex = storedPosts.findIndex((item) => item.id === postId)

  if (postIndex < 0) {
    throw new Error('Post not found')
  }

  const nextComment: CommunityComment = {
    id: `comment-${Date.now()}`,
    author: payload.authorName?.trim() || localStorage.getItem('userName')?.trim() || 'Roddy 사용자',
    content: payload.content.trim(),
    depth: payload.parentId ? 1 : 0,
    parentId: payload.parentId,
    createdAt: new Date().toISOString(),
  }

  storedPosts[postIndex] = {
    ...storedPosts[postIndex],
    comments: [...(storedPosts[postIndex].comments ?? []), nextComment],
    commentCount: normalizeCommentCount([...(storedPosts[postIndex].comments ?? []), nextComment]),
  }

  writeStoredPosts(storedPosts)

  return nextComment
}

export async function getCommunityComments(postId: string): Promise<CreateCommentResponse[]> {
  ensureSeedData()
  await wait(120)

  const storedPosts = readStoredPosts()
  const post = storedPosts.find((item) => item.id === postId)

  if (!post) {
    throw new Error('Post not found')
  }

  return cloneValue(post.comments ?? [])
}

export async function reportCommunityComment(commentId: string): Promise<{ success: boolean }> {
  void commentId
  await wait(120)
  return { success: true }
}

export async function deleteCommunityComment(commentId: string): Promise<{ success: boolean }> {
  ensureSeedData()
  await wait(120)

  const storedPosts = readStoredPosts()
  const nextPosts = storedPosts.map((post) => {
    const nextComments = (post.comments ?? []).filter((comment) => comment.id !== commentId && comment.parentId !== commentId)
    return {
      ...post,
      comments: nextComments,
      commentCount: normalizeCommentCount(nextComments),
    }
  })

  writeStoredPosts(nextPosts)
  return { success: true }
}
