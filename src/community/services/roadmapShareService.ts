import { getSavedRoadmaps } from '../../api/services/roadmapService'
import { createMockRoadmap, mockAnalysisSummary } from '../../roadmap/data/mockRoadmapData'
import type { RoadmapShareCandidate } from '../types/community'

const fallbackRoadmapCandidate: RoadmapShareCandidate = {
  id: 'roadmap-fallback-1',
  roadmapTitle: createMockRoadmap().title,
  targetJob: mockAnalysisSummary.targetJob,
  targetCompany: mockAnalysisSummary.targetCompany,
  recommendedSkills: mockAnalysisSummary.gapSkills,
  roadmapSteps: createMockRoadmap().steps,
  createdAt: '2026-03-16T10:00:00.000Z',
}

export async function getRoadmapShareCandidates(): Promise<RoadmapShareCandidate[]> {
  const savedRoadmaps = await getSavedRoadmaps()

  if (savedRoadmaps.length === 0) {
    return [fallbackRoadmapCandidate]
  }

  return savedRoadmaps.map((roadmap) => ({
    id: roadmap.id,
    roadmapTitle: roadmap.roadmapTitle,
    targetJob: roadmap.targetJob,
    targetCompany: roadmap.targetCompany,
    recommendedSkills: roadmap.gapSkills.length > 0 ? roadmap.gapSkills : roadmap.currentSkills,
    roadmapSteps: roadmap.roadmapSteps,
    createdAt: roadmap.createdAt,
  }))
}
