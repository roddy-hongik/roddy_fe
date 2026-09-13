import { mockAdminUsers, mockGraphSearchResult, mockReportedContents } from '../../admin/data/mockAdminData'
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

// Crawling is backed by the API. Users, moderation and graph stay intentional mocks until their APIs exist.

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T

let usersState: AdminUser[] = clone(mockAdminUsers)
let reportedContentState: ReportedContent[] = clone(mockReportedContents)
let graphState: GraphSearchResult = clone(mockGraphSearchResult)

export const getCrawlingDashboard = async (): Promise<CrawlingDashboard> =>
  httpClient<CrawlingDashboard>(API_ENDPOINTS.admin.crawlingDashboard, { method: 'GET' })

/** 전체 수집을 시작한다. 수 분이 걸려 바로 현황을 돌려주고, 이미 돌고 있으면 409 로 실패한다. */
export const startCrawling = async (): Promise<CrawlingDashboard> =>
  httpClient<CrawlingDashboard>(API_ENDPOINTS.admin.crawlingRun, { method: 'POST' })

export const getAdminUsers = async (): Promise<AdminUser[]> => {
  await wait(220)
  return clone(usersState)
}

export const updateAdminUserStatus = async (userId: string, status: AdminUserStatus): Promise<AdminUser[]> => {
  await wait(220)
  usersState = usersState.map((user) => (user.id === userId ? { ...user, status } : user))
  return clone(usersState)
}

export const getReportedContents = async (): Promise<ReportedContent[]> => {
  await wait(220)
  return clone(reportedContentState)
}

export const removeReportedContent = async (contentId: string): Promise<ReportedContent[]> => {
  await wait(220)
  reportedContentState = reportedContentState.filter((content) => content.id !== contentId)
  return clone(reportedContentState)
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
