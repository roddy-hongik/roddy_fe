import { getSavedRoadmaps } from '../../api/services/roadmapService'
import type { RoadmapShareCandidate } from '../types/community'

export async function getRoadmapShareCandidates(): Promise<RoadmapShareCandidate[]> {
  const savedRoadmaps = await getSavedRoadmaps()

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
