import type { AnalysisSummary, GeneratedRoadmap, RoadmapStep, SaveRoadmapResult, SavedRoadmap } from '../types/roadmap'
import { createMockRoadmap, mockAnalysisSummary } from '../../roadmap/data/mockRoadmapData'

// Intentional mock domain: roadmap backend API is not implemented yet.

const ROADMAP_STORAGE_KEY = 'roddy.saved-roadmaps.v2'

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })

const normalizeRoadmapStep = (step: unknown): RoadmapStep | null => {
  if (!step || typeof step !== 'object') {
    return null
  }

  const candidate = step as {
    stage?: string
    goal?: string
    topics?: unknown
    outputs?: unknown
    outputExample?: string
  }

  if (!candidate.stage || !candidate.goal || !Array.isArray(candidate.topics)) {
    return null
  }

  const normalizedOutputs = Array.isArray(candidate.outputs)
    ? candidate.outputs.filter((item): item is string => typeof item === 'string' && item.length > 0)
    : candidate.outputExample
      ? [candidate.outputExample]
      : []

  return {
    stage: candidate.stage as RoadmapStep['stage'],
    goal: candidate.goal,
    topics: candidate.topics.filter((item): item is string => typeof item === 'string' && item.length > 0),
    outputs: normalizedOutputs,
  }
}

const parseSavedRoadmaps = (raw: string | null): SavedRoadmap[] => {
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .map((item) => {
        if (!item || typeof item !== 'object') {
          return null
        }

        const candidate = item as Partial<SavedRoadmap> & {
          roadmapSteps?: unknown[]
          roadmapTitle?: string
        }

        if (!candidate.id || !candidate.createdAt || !candidate.roadmapTitle) {
          return null
        }

        const roadmapSteps = Array.isArray(candidate.roadmapSteps)
          ? candidate.roadmapSteps.map(normalizeRoadmapStep).filter((step): step is RoadmapStep => step !== null)
          : []

        return {
          id: candidate.id,
          createdAt: candidate.createdAt,
          roadmapTitle: candidate.roadmapTitle,
          targetJob: candidate.targetJob ?? '',
          targetCompany: candidate.targetCompany ?? '',
          currentSkills: Array.isArray(candidate.currentSkills) ? candidate.currentSkills.filter((item): item is string => typeof item === 'string') : [],
          gapSkills: Array.isArray(candidate.gapSkills) ? candidate.gapSkills.filter((item): item is string => typeof item === 'string') : [],
          roadmapSteps,
        }
      })
      .filter((item): item is SavedRoadmap => item !== null)
  } catch {
    return []
  }
}

const readSavedRoadmaps = (): SavedRoadmap[] => parseSavedRoadmaps(localStorage.getItem(ROADMAP_STORAGE_KEY))

const writeSavedRoadmaps = (roadmaps: SavedRoadmap[]) => {
  localStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify(roadmaps))
}

const isSameRoadmap = (a: SavedRoadmap, b: SavedRoadmap) => {
  const keyA = JSON.stringify({
    roadmapTitle: a.roadmapTitle,
    targetJob: a.targetJob,
    targetCompany: a.targetCompany,
    currentSkills: a.currentSkills,
    gapSkills: a.gapSkills,
    roadmapSteps: a.roadmapSteps,
  })
  const keyB = JSON.stringify({
    roadmapTitle: b.roadmapTitle,
    targetJob: b.targetJob,
    targetCompany: b.targetCompany,
    currentSkills: b.currentSkills,
    gapSkills: b.gapSkills,
    roadmapSteps: b.roadmapSteps,
  })

  return keyA === keyB
}

export const getAnalysisSummary = async (): Promise<AnalysisSummary> => {
  await wait(180)
  return mockAnalysisSummary
}

export const generateRoadmap = async (summary: AnalysisSummary): Promise<GeneratedRoadmap> => {
  await wait(520)
  void summary
  return createMockRoadmap()
}

export const getSavedRoadmaps = async (): Promise<SavedRoadmap[]> => {
  await wait(180)
  const roadmaps = readSavedRoadmaps()
  return roadmaps.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
}

export const saveRoadmap = async (summary: AnalysisSummary, roadmap: GeneratedRoadmap): Promise<SaveRoadmapResult> => {
  await wait(180)

  const nextRoadmap: SavedRoadmap = {
    id: `roadmap-${Date.now()}`,
    createdAt: new Date().toISOString(),
    roadmapTitle: roadmap.title,
    targetJob: summary.targetJob,
    targetCompany: summary.targetCompany,
    currentSkills: summary.currentSkills,
    gapSkills: summary.gapSkills,
    roadmapSteps: roadmap.steps,
  }

  const current = readSavedRoadmaps()
  const existing = current.find((item) => isSameRoadmap(item, nextRoadmap))

  if (existing) {
    return {
      saved: false,
      roadmap: existing,
      reason: 'duplicate',
    }
  }

  const updated = [nextRoadmap, ...current]
  writeSavedRoadmaps(updated)

  return {
    saved: true,
    roadmap: nextRoadmap,
  }
}
