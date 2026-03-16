import {
  addCommunityComment,
  deleteCommunityComment,
  getCommunityComments,
  likeCommunityPost,
  reportCommunityComment,
  reportCommunityPost,
} from '../../api/services/communityService'
import type { CreateCommentPayload } from '../types/community'

export const getPostComments = getCommunityComments
export const reportPost = reportCommunityPost
export const reportComment = reportCommunityComment
export const removeComment = deleteCommunityComment

export async function submitComment(postId: string, payload: CreateCommentPayload) {
  return addCommunityComment(postId, payload)
}

export async function submitPostLike(postId: string) {
  return likeCommunityPost(postId)
}
