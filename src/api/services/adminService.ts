import { httpClient } from '../client/httpClient'
import { API_ENDPOINTS } from '../constants/endpoints'
import type {
  AdminUser,
  AdminUserStatus,
  CrawlingDashboard,
  EdgePayload,
  GraphEdge,
  GraphRebuildResult,
  GraphSearchResult,
  ReportedContent,
} from '../../api/types/admin'

export const getCrawlingDashboard = async (): Promise<CrawlingDashboard> =>
  httpClient<CrawlingDashboard>(API_ENDPOINTS.admin.crawlingDashboard, { method: 'GET' })

/** 전체 수집을 시작한다. 수 분이 걸려 바로 현황을 돌려주고, 이미 돌고 있으면 409 로 실패한다. */
export const startCrawling = async (): Promise<CrawlingDashboard> =>
  httpClient<CrawlingDashboard>(API_ENDPOINTS.admin.crawlingRun, { method: 'POST' })

type BackendAdminUser = Omit<AdminUser, 'id'> & { id: number }

type BackendAdminUserListResponse = {
  users: BackendAdminUser[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

type BackendReportedContent = Omit<ReportedContent, 'id' | 'contentId'> & { id: number }

/** 화면이 한 번에 받아 거르고 정렬한다. 백엔드가 허용하는 가장 큰 페이지다. */
const ADMIN_USER_PAGE_SIZE = 100

const replaceId = (path: string, id: string) => path.replace(':id', encodeURIComponent(id))

const toAdminUser = (user: BackendAdminUser): AdminUser => ({ ...user, id: String(user.id) })

export const getAdminUsers = async (): Promise<AdminUser[]> => {
  const response = await httpClient<BackendAdminUserListResponse>(
    `${API_ENDPOINTS.admin.users}?page=0&size=${ADMIN_USER_PAGE_SIZE}`,
  )
  return response.users.map(toAdminUser)
}

/** 계정을 정지하거나 푼다. 어드민 계정은 정지할 수 없어 400 으로 실패한다. */
export const updateAdminUserStatus = async (userId: string, status: AdminUserStatus): Promise<AdminUser> => {
  const response = await httpClient<BackendAdminUser>(replaceId(API_ENDPOINTS.admin.userStatus, userId), {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
  return toAdminUser(response)
}

export const getReportedContents = async (): Promise<ReportedContent[]> => {
  const response = await httpClient<BackendReportedContent[]>(API_ENDPOINTS.admin.reportedContents)
  return response.map((content) => ({ ...content, id: `${content.type}-${content.id}`, contentId: String(content.id) }))
}

/** 신고된 글이나 댓글을 지운다. 글은 댓글·좋아요·신고까지 함께 지워진다. 사유는 백엔드 로그에만 남는다. */
export const removeReportedContent = async (content: ReportedContent, reason?: string): Promise<void> => {
  const path = replaceId(
    content.type === 'post' ? API_ENDPOINTS.admin.reportedPost : API_ENDPOINTS.admin.reportedComment,
    content.contentId,
  )
  const query = reason?.trim() ? `?reason=${encodeURIComponent(reason.trim())}` : ''
  await httpClient<null>(`${path}${query}`, { method: 'DELETE' })
}

/** 기술 이름이나 별칭으로 찾는다. 사전에 없는 기술이거나 아직 그래프를 갱신하지 않았으면 searchedNode 가 null 이다. */
export const searchGraphNode = async (keyword: string): Promise<GraphSearchResult> =>
  httpClient<GraphSearchResult>(`${API_ENDPOINTS.admin.graphSearch}?keyword=${encodeURIComponent(keyword.trim())}`)

/**
 * 어드민이 만든 관계는 자동 계산이 덮어쓰지 않는다.
 * 그래프에 없는 기술이면 404, 같은 기술끼리면 400, 이미 같은 관계가 있으면 409 로 실패한다.
 */
export const addGraphEdge = async (payload: EdgePayload): Promise<GraphEdge> =>
  httpClient<GraphEdge>(API_ENDPOINTS.admin.graphEdges, { method: 'POST', body: JSON.stringify(payload) })

/** 고친 관계는 어드민이 만든 관계가 된다. 실패하는 경우는 추가와 같고, 이미 지워진 관계면 404 다. */
export const updateGraphEdge = async (edgeId: string, payload: EdgePayload): Promise<GraphEdge> =>
  httpClient<GraphEdge>(replaceId(API_ENDPOINTS.admin.graphEdge, edgeId), {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

/** 지운 자동 관계는 다음 갱신 때 다시 생기지 않는다. */
export const deleteGraphEdge = async (edgeId: string): Promise<void> => {
  await httpClient<null>(replaceId(API_ENDPOINTS.admin.graphEdge, edgeId), { method: 'DELETE' })
}

/** 사전의 기술을 노드로 맞추고 모집 중인 공고로 자동 관계를 다시 계산한다. 수집이 끝날 때도 자동으로 돈다. */
export const rebuildGraph = async (): Promise<GraphRebuildResult> =>
  httpClient<GraphRebuildResult>(API_ENDPOINTS.admin.graphRebuild, { method: 'POST' })
