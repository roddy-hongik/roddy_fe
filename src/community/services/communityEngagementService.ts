import { addCommunityComment, getCommunityComments, reportCommunityPost } from '../../api/services/communityService'
import type { CreateCommentPayload } from '../types/community'

export const getPostComments = getCommunityComments
export const reportPost = reportCommunityPost

export async function submitComment(postId: string, payload: CreateCommentPayload) {
  return addCommunityComment(postId, payload)
}
