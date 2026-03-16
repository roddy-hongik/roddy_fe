import { jobPostings, type JobPosting } from '../data/jobPostings'
import { cloneValue, emitRoddyDataChange, parseStoredJson } from '../../shared/utils/localStorageSync'

const JOB_SCRAP_STORAGE_KEY = 'roddy.jobs.scraps.v1'

const DEFAULT_SCRAPPED_JOB_IDS = ['2', 'adl-data-platform']

const JOB_PRESENTATION_META: Record<string, { postedAt: string; matchingScore: number | null }> = {
  '1': { postedAt: '2026-03-10T09:00:00.000Z', matchingScore: 74 },
  '2': { postedAt: '2026-03-16T09:00:00.000Z', matchingScore: 92 },
  '3': { postedAt: '2026-03-15T08:30:00.000Z', matchingScore: 87 },
  '4': { postedAt: '2026-03-12T05:00:00.000Z', matchingScore: 65 },
  '5': { postedAt: '2026-03-11T03:00:00.000Z', matchingScore: 58 },
  '6': { postedAt: '2026-03-13T07:30:00.000Z', matchingScore: 69 },
  '7': { postedAt: '2026-03-14T10:40:00.000Z', matchingScore: 90 },
  '8': { postedAt: '2026-03-09T04:30:00.000Z', matchingScore: 61 },
  'kanto-bi-analyst': { postedAt: '2026-03-08T01:20:00.000Z', matchingScore: 71 },
  'wonandco-brand-md': { postedAt: '2026-03-07T02:20:00.000Z', matchingScore: 54 },
  'posco-ai-engineer': { postedAt: '2026-03-16T01:00:00.000Z', matchingScore: 84 },
  'hanwha-foodtech-service': { postedAt: '2026-03-05T03:10:00.000Z', matchingScore: 46 },
  'kolmar-digital-marketing': { postedAt: '2026-03-06T06:15:00.000Z', matchingScore: 51 },
  'adl-data-platform': { postedAt: '2026-03-15T11:20:00.000Z', matchingScore: 94 },
  'jarbio-headhunter-consultant': { postedAt: '2026-03-04T08:45:00.000Z', matchingScore: 42 },
}

export interface JobPostingPreview extends JobPosting {
  postedAt: string
  matchingScore: number | null
  isScrapped: boolean
}

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })

function readScrappedJobIds() {
  const parsed = parseStoredJson<unknown>(localStorage.getItem(JOB_SCRAP_STORAGE_KEY), cloneValue(DEFAULT_SCRAPPED_JOB_IDS))

  if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== 'string')) {
    return cloneValue(DEFAULT_SCRAPPED_JOB_IDS)
  }

  return parsed
}

function writeScrappedJobIds(jobIds: string[]) {
  localStorage.setItem(JOB_SCRAP_STORAGE_KEY, JSON.stringify(jobIds))
  emitRoddyDataChange(JOB_SCRAP_STORAGE_KEY)
}

export function initializeJobScrapStorage() {
  if (!localStorage.getItem(JOB_SCRAP_STORAGE_KEY)) {
    writeScrappedJobIds(cloneValue(DEFAULT_SCRAPPED_JOB_IDS))
  }
}

function getJobPresentationMeta(job: JobPosting, index: number) {
  const fallbackDate = new Date(Date.UTC(2026, 2, Math.max(1, 16 - index), 9, 0, 0)).toISOString()
  return JOB_PRESENTATION_META[job.id] ?? { postedAt: fallbackDate, matchingScore: Math.min(96, 56 + job.techStacks.length * 6) }
}

export function isJobScrapped(jobId: string) {
  return readScrappedJobIds().includes(jobId)
}

export function toJobPostingPreview(job: JobPosting): JobPostingPreview {
  const index = jobPostings.findIndex((item) => item.id === job.id)
  const meta = getJobPresentationMeta(job, Math.max(index, 0))

  return {
    ...job,
    postedAt: meta.postedAt,
    matchingScore: meta.matchingScore,
    isScrapped: isJobScrapped(job.id),
  }
}

export function getJobPostingPreviewById(jobId: string) {
  const job = jobPostings.find((item) => item.id === jobId)
  return job ? toJobPostingPreview(job) : null
}

export async function getScrappedJobs(): Promise<JobPostingPreview[]> {
  await wait(140)

  const scrappedIds = new Set(readScrappedJobIds())

  return jobPostings
    .filter((job) => scrappedIds.has(job.id))
    .map(toJobPostingPreview)
    .sort((a, b) => +new Date(b.postedAt) - +new Date(a.postedAt))
}

export async function toggleJobScrap(jobId: string, shouldScrap: boolean): Promise<{ isScrapped: boolean }> {
  await wait(80)

  const currentIds = readScrappedJobIds()
  const isCurrentlyScrapped = currentIds.includes(jobId)

  if (isCurrentlyScrapped === shouldScrap) {
    return { isScrapped: isCurrentlyScrapped }
  }

  const nextIds = shouldScrap ? [...currentIds, jobId] : currentIds.filter((id) => id !== jobId)

  writeScrappedJobIds(nextIds)

  return { isScrapped: nextIds.includes(jobId) }
}

initializeJobScrapStorage()
