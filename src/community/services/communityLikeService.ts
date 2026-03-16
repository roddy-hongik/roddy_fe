import { mockCommunityPostDetails } from '../data/mockCommunityData'
import type { CommunityPostDetail, CommunityPostSummary } from '../types/community'
import { cloneValue, emitRoddyDataChange, parseStoredJson } from '../../shared/utils/localStorageSync'

const COMMUNITY_STORAGE_KEY = 'roddy.community.posts.v3'
const COMMUNITY_LIKE_STORAGE_KEY = 'roddy.community.likes.v1'

export interface CommunityPostLikeSummary {
  id: string
  type: CommunityPostSummary['type']
  title: string
  author: string
  likeCount: number
  commentCount: number
  viewCount: number
  createdAt: string
}

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })

function readStoredPosts(): CommunityPostDetail[] {
  return parseStoredJson<CommunityPostDetail[]>(localStorage.getItem(COMMUNITY_STORAGE_KEY), cloneValue(mockCommunityPostDetails))
}

function writeStoredPosts(posts: CommunityPostDetail[]) {
  localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(posts))
  emitRoddyDataChange(COMMUNITY_STORAGE_KEY)
}

function readLikedPostIds() {
  return parseStoredJson<string[]>(localStorage.getItem(COMMUNITY_LIKE_STORAGE_KEY), ['rp1', 'ip1'])
}

function writeLikedPostIds(postIds: string[]) {
  localStorage.setItem(COMMUNITY_LIKE_STORAGE_KEY, JSON.stringify(postIds))
  emitRoddyDataChange(COMMUNITY_LIKE_STORAGE_KEY)
}

function ensureSeedData() {
  if (!localStorage.getItem(COMMUNITY_STORAGE_KEY)) {
    localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(cloneValue(mockCommunityPostDetails)))
  }

  if (!localStorage.getItem(COMMUNITY_LIKE_STORAGE_KEY)) {
    writeLikedPostIds(['rp1', 'ip1'])
  }
}

function toLikeSummary(post: CommunityPostDetail): CommunityPostLikeSummary {
  return {
    id: post.id,
    type: post.type,
    title: post.title,
    author: post.authorName,
    likeCount: post.likes,
    commentCount: post.comments?.length ?? post.commentCount ?? 0,
    viewCount: post.views,
    createdAt: post.createdAt,
  }
}

export function isCommunityPostLiked(postId: string) {
  ensureSeedData()
  return readLikedPostIds().includes(postId)
}

export async function toggleCommunityPostLike(postId: string): Promise<{ isLiked: boolean; likes: number }> {
  ensureSeedData()
  await wait(90)

  const storedPosts = readStoredPosts()
  const targetIndex = storedPosts.findIndex((post) => post.id === postId)

  if (targetIndex < 0) {
    throw new Error('Post not found')
  }

  const likedIds = readLikedPostIds()
  const isLiked = likedIds.includes(postId)
  const nextLikedIds = isLiked ? likedIds.filter((id) => id !== postId) : [...likedIds, postId]
  const nextLikes = Math.max(0, storedPosts[targetIndex].likes + (isLiked ? -1 : 1))

  storedPosts[targetIndex] = {
    ...storedPosts[targetIndex],
    likes: nextLikes,
  }

  writeStoredPosts(storedPosts)
  writeLikedPostIds(nextLikedIds)

  return {
    isLiked: nextLikedIds.includes(postId),
    likes: nextLikes,
  }
}

export async function getLikedCommunityPosts(): Promise<CommunityPostLikeSummary[]> {
  ensureSeedData()
  await wait(140)

  const likedIds = new Set(readLikedPostIds())

  return readStoredPosts()
    .filter((post) => likedIds.has(post.id))
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .map(toLikeSummary)
}
