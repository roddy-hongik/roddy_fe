import { httpClient } from '../../api/client/httpClient'
import { API_ENDPOINTS } from '../../api/constants/endpoints'
import type { CommunityPostSummary } from '../types/community'

export const LIKED_POST_PAGE_SIZE = 20

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

/** 좋아요한 글 한 페이지. page 는 0부터 센다. */
export interface LikedCommunityPostPage {
  posts: CommunityPostLikeSummary[]
  page: number
  totalPages: number
}

interface BackendLikedPostListResponse {
  posts: Array<{
    id: number
    type: CommunityPostSummary['type']
    title: string
    authorName: string
    likes: number
    commentCount: number
    views: number
    createdAt: string
  }>
  page: number
  size: number
  totalElements: number
  totalPages: number
}

/** 내가 좋아요한 글. 좋아요를 누른 최신순이다. */
export async function getLikedCommunityPosts(page = 0, size = LIKED_POST_PAGE_SIZE): Promise<LikedCommunityPostPage> {
  const response = await httpClient<BackendLikedPostListResponse>(
    `${API_ENDPOINTS.community.likedPosts}?page=${page}&size=${size}`,
  )

  return {
    posts: response.posts.map((post) => ({
      id: String(post.id),
      type: post.type,
      title: post.title,
      author: post.authorName,
      likeCount: post.likes,
      commentCount: post.commentCount,
      viewCount: post.views,
      createdAt: post.createdAt,
    })),
    page: response.page,
    totalPages: response.totalPages,
  }
}
