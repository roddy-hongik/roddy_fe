import { getSavedRoadmaps } from '../../api/services/roadmapService'
import type { RoadmapShareCandidate } from '../types/community'

/** 공유 후보는 최근에 저장한 로드맵 한 페이지다. */
export async function getRoadmapShareCandidates(): Promise<RoadmapShareCandidate[]> {
  const { roadmaps } = await getSavedRoadmaps()

  return roadmaps.map((roadmap) => ({
    id: roadmap.id,
    roadmapTitle: roadmap.roadmapTitle,
    targetJob: roadmap.targetJob,
    targetCompany: roadmap.targetCompany,
    recommendedSkills: roadmap.gapSkills.length > 0 ? roadmap.gapSkills : roadmap.currentSkills,
    roadmapSteps: roadmap.roadmapSteps,
    createdAt: roadmap.createdAt,
  }))
}
