import { getSavedRoadmaps } from '../../api/services/roadmapService'
import type { SavedRoadmap } from '../../api/types/roadmap'
import type { RoadmapShareCandidate } from '../types/community'

/** 한 번에 받을 저장한 로드맵 수. */
const SHARE_CANDIDATE_PAGE_SIZE = 100

/**
 * 공유할 수 있는 저장한 로드맵. 최근 것부터 한 페이지를 받는다.
 * 저장 목록의 "공유하기"로 넘어온 로드맵(requiredRoadmapId)이 그 페이지에 없으면 찾을 때까지 다음 페이지를 이어 받는다.
 */
export async function getRoadmapShareCandidates(requiredRoadmapId?: string): Promise<RoadmapShareCandidate[]> {
  const roadmaps = new Map<string, SavedRoadmap>()
  let page = 0
  let totalPages = 0

  do {
    const response = await getSavedRoadmaps(page, SHARE_CANDIDATE_PAGE_SIZE)
    // 페이지를 받는 사이에 새로 저장하면 경계가 밀려 같은 로드맵이 다시 오므로 id 로 한 번만 담는다.
    response.roadmaps.forEach((roadmap) => roadmaps.set(roadmap.id, roadmap))
    totalPages = response.totalPages
    page += 1
  } while (requiredRoadmapId && !roadmaps.has(requiredRoadmapId) && page < totalPages)

  return Array.from(roadmaps.values()).map((roadmap) => ({
    id: roadmap.id,
    roadmapTitle: roadmap.roadmapTitle,
    targetJob: roadmap.targetJob,
    targetCompany: roadmap.targetCompany ?? '',
    recommendedSkills: roadmap.gapSkills.length > 0 ? roadmap.gapSkills : roadmap.currentSkills,
    roadmapSteps: roadmap.roadmapSteps,
    createdAt: roadmap.createdAt,
  }))
}
