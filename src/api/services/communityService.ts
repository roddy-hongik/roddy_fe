import { API_ENDPOINTS } from '../constants/endpoints'
import { httpClient } from '../client/httpClient'
import type {
  CommunityPostDetail,
  CommunityPostSummary,
  CreateCommentPayload,
  CreateCommentResponse,
  CreateCommunityPostPayload,
  CreateCommunityPostResponse,
  JobTrackTagKey,
} from '../../community/types/community'

interface CommunityPostsApiResponse {
  posts?: CommunityPostSummary[]
}

interface CommunityCommentsApiResponse {
  comments?: CreateCommentResponse[]
}

export async function getCommunityPosts(tag?: JobTrackTagKey): Promise<CommunityPostSummary[]> {
  const query = tag ? `?tag=${encodeURIComponent(tag)}` : ''
  const response = await httpClient<CommunityPostsApiResponse | CommunityPostSummary[]>(`${API_ENDPOINTS.community.posts}${query}`, {
    method: 'GET',
  })

  return Array.isArray(response) ? response : response.posts ?? []
}

export async function getCommunityPostDetail(postId: string): Promise<CommunityPostDetail> {
  return httpClient<CommunityPostDetail>(`${API_ENDPOINTS.community.posts}/${postId}`, {
    method: 'GET',
  })
}

export async function createCommunityPost(payload: CreateCommunityPostPayload): Promise<CreateCommunityPostResponse> {
  const formData = new FormData()
  formData.append('title', payload.title)
  formData.append('content', payload.content)
  formData.append('tag', payload.tag)

  if (payload.image) {
    formData.append('image', payload.image)
  }

  return httpClient<CreateCommunityPostResponse>(API_ENDPOINTS.community.posts, {
    method: 'POST',
    body: formData,
  })
}

export async function likeCommunityPost(postId: string): Promise<{ likes: number }> {
  return httpClient<{ likes: number }>(`${API_ENDPOINTS.community.posts}/${postId}/like`, {
    method: 'POST',
  })
}

export async function reportCommunityPost(postId: string): Promise<{ success: boolean }> {
  return httpClient<{ success: boolean }>(`${API_ENDPOINTS.community.posts}/${postId}/report`, {
    method: 'POST',
  })
}

export async function addCommunityComment(postId: string, payload: CreateCommentPayload): Promise<CreateCommentResponse> {
  return httpClient<CreateCommentResponse>(`${API_ENDPOINTS.community.posts}/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getCommunityComments(postId: string): Promise<CreateCommentResponse[]> {
  const response = await httpClient<CommunityCommentsApiResponse | CreateCommentResponse[]>(`${API_ENDPOINTS.community.posts}/${postId}/comments`, {
    method: 'GET',
  })

  return Array.isArray(response) ? response : response.comments ?? []
}

export async function reportCommunityComment(commentId: string): Promise<{ success: boolean }> {
  return httpClient<{ success: boolean }>(`${API_ENDPOINTS.community.comments}/${commentId}/report`, {
    method: 'POST',
  })
}

export async function deleteCommunityComment(commentId: string): Promise<{ success: boolean }> {
  return httpClient<{ success: boolean }>(`${API_ENDPOINTS.community.comments}/${commentId}`, {
    method: 'DELETE',
  })
}
