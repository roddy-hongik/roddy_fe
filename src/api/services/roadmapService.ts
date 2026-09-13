import { httpClient } from '../client/httpClient'
import { API_ENDPOINTS } from '../constants/endpoints'
import type { AnalysisSummary, GeneratedRoadmap, SaveRoadmapResult, SavedRoadmap } from '../types/roadmap'

export const getAnalysisSummary = (): Promise<AnalysisSummary> =>
  httpClient<AnalysisSummary>(API_ENDPOINTS.roadmap.summary)

export const generateRoadmap = (): Promise<GeneratedRoadmap> =>
  httpClient<GeneratedRoadmap>(API_ENDPOINTS.roadmap.generate, {
    method: 'POST',
  })

export const getSavedRoadmaps = (): Promise<SavedRoadmap[]> =>
  httpClient<SavedRoadmap[]>(API_ENDPOINTS.roadmap.saved)

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
