import { getSavedRoadmaps } from '../../api/services/roadmapService'
import type { RoadmapShareCandidate } from '../types/community'

/** 공유 후보로 불러올 최근 로드맵 수. 저장 목록의 "공유하기"로 넘어온 로드맵이 대부분 여기 들어온다. */
const SHARE_CANDIDATE_LIMIT = 100

export async function getRoadmapShareCandidates(): Promise<RoadmapShareCandidate[]> {
  const { roadmaps } = await getSavedRoadmaps(0, SHARE_CANDIDATE_LIMIT)

  return roadmaps.map((roadmap) => ({
    id: roadmap.id,
    roadmapTitle: roadmap.roadmapTitle,
    targetJob: roadmap.targetJob,
    targetCompany: roadmap.targetCompany ?? '',
    recommendedSkills: roadmap.gapSkills.length > 0 ? roadmap.gapSkills : roadmap.currentSkills,
    roadmapSteps: roadmap.roadmapSteps,
    createdAt: roadmap.createdAt,
  }))
}
