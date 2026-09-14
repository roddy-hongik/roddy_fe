import { mockGraphSearchResult } from '../../admin/data/mockAdminData'
import { httpClient } from '../client/httpClient'
import { API_ENDPOINTS } from '../constants/endpoints'
import type {
  AdminUser,
  AdminUserStatus,
  CrawlingDashboard,
  EdgePayload,
  GraphEdge,
  GraphSearchResult,
  ReportedContent,
} from '../../api/types/admin'

// Crawling, users and moderation are backed by the API. Graph stays an intentional mock until its API exists.

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T

let graphState: GraphSearchResult = clone(mockGraphSearchResult)

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

export const searchGraphNode = async (keyword: string): Promise<GraphSearchResult> => {
  await wait(260)
  const trimmed = keyword.trim().toLowerCase()

  if (!trimmed) {
    return {
      searchedNode: null,
      edges: [],
    }
  }

  if (!graphState.searchedNode || !graphState.searchedNode.name.toLowerCase().includes(trimmed)) {
    return {
      searchedNode: {
        id: 'n-fallback',
        name: keyword.trim(),
        category: 'unknown',
        relationCount: 0,
      },
      edges: [],
    }
  }

  return clone({
    ...graphState,
    searchedNode: {
      ...graphState.searchedNode,
      relationCount: graphState.edges.length,
    },
  })
}

export const addGraphEdge = async (payload: EdgePayload): Promise<GraphEdge[]> => {
  await wait(220)

  const nextEdge: GraphEdge = {
    id: `e-${Date.now()}`,
    source: payload.source,
    relationType: payload.relationType,
    target: payload.target,
    createdBy: 'manual',
    confidence: 0.95,
    description: payload.description,
  }

  graphState = {
    searchedNode: graphState.searchedNode,
    edges: [nextEdge, ...graphState.edges],
  }

  return clone(graphState.edges)
}

export const updateGraphEdge = async (edgeId: string, payload: EdgePayload): Promise<GraphEdge[]> => {
  await wait(220)

  graphState = {
    searchedNode: graphState.searchedNode,
    edges: graphState.edges.map((edge) =>
      edge.id === edgeId
        ? {
            ...edge,
            source: payload.source,
            relationType: payload.relationType,
            target: payload.target,
            description: payload.description,
            createdBy: 'manual',
          }
        : edge,
    ),
  }

  return clone(graphState.edges)
}

export const deleteGraphEdge = async (edgeId: string): Promise<GraphEdge[]> => {
  await wait(220)

  graphState = {
    searchedNode: graphState.searchedNode,
    edges: graphState.edges.filter((edge) => edge.id !== edgeId),
  }

  return clone(graphState.edges)
}
