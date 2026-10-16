import { httpClient } from '../client/httpClient'
import { API_ENDPOINTS } from '../constants/endpoints'
import type { AnalysisSummary, GeneratedRoadmap, SaveRoadmapResult, SavedRoadmapPage } from '../types/roadmap'

export const SAVED_ROADMAP_PAGE_SIZE = 20

export const getAnalysisSummary = (): Promise<AnalysisSummary> =>
  httpClient<AnalysisSummary>(API_ENDPOINTS.roadmap.summary)

export const generateRoadmap = (): Promise<GeneratedRoadmap> =>
  httpClient<GeneratedRoadmap>(API_ENDPOINTS.roadmap.generate, {
    method: 'POST',
  })

export const getSavedRoadmaps = (page = 0, size = SAVED_ROADMAP_PAGE_SIZE): Promise<SavedRoadmapPage> =>
  httpClient<SavedRoadmapPage>(`${API_ENDPOINTS.roadmap.saved}?page=${page}&size=${size}`)

export const saveRoadmap = (roadmap: GeneratedRoadmap): Promise<SaveRoadmapResult> =>
  httpClient<SaveRoadmapResult>(API_ENDPOINTS.roadmap.saved, {
    method: 'POST',
    body: JSON.stringify({
      title: roadmap.title,
      steps: roadmap.steps,
      currentSkills: roadmap.currentSkills,
      gapSkills: roadmap.gapSkills,
      targetJob: roadmap.targetJob,
      targetCompany: roadmap.targetCompany,
    }),
  })
