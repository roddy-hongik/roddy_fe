import { mockStudies } from '../data/mockStudies'
import type { CreateStudyPayload, StudyApplicationStatus, StudyPost, StudyStatus } from '../types/study'

const STUDY_STORAGE_KEY = 'roddy.study.posts.v1'

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })

const cloneValue = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const getCurrentUserName = () => localStorage.getItem('userName')?.trim() || 'Roddy 사용자'

const getAcceptedCount = (study: StudyPost) => study.applicants.filter((applicant) => applicant.status === 'accepted').length

const sortStudies = (studies: StudyPost[]) => studies.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))

const readStoredStudies = (): StudyPost[] => {
  const raw = localStorage.getItem(STUDY_STORAGE_KEY)

  if (!raw) {
    return cloneValue(mockStudies)
  }

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as StudyPost[]) : cloneValue(mockStudies)
  } catch {
    return cloneValue(mockStudies)
  }
}

const writeStoredStudies = (studies: StudyPost[]) => {
  localStorage.setItem(STUDY_STORAGE_KEY, JSON.stringify(studies))
}

const ensureSeedData = () => {
  if (!localStorage.getItem(STUDY_STORAGE_KEY)) {
    writeStoredStudies(cloneValue(mockStudies))
  }
}

export async function getStudies(): Promise<StudyPost[]> {
  ensureSeedData()
  await wait(140)
  return cloneValue(sortStudies(readStoredStudies()))
}

export async function getStudyDetail(studyId: string): Promise<StudyPost> {
  ensureSeedData()
  await wait(120)

  const study = readStoredStudies().find((item) => item.id === studyId)

  if (!study) {
    throw new Error('Study not found')
  }

  return cloneValue(study)
}

export async function createStudy(payload: CreateStudyPayload): Promise<{ id: string }> {
  ensureSeedData()
  await wait(180)

  const nextStudy: StudyPost = {
    id: `study-${Date.now()}`,
    title: payload.title.trim(),
    description: payload.description.trim(),
    mode: payload.mode,
    location: payload.location.trim(),
    scheduledAt: payload.scheduledAt,
    capacity: payload.capacity,
    status: 'recruiting',
    authorName: getCurrentUserName(),
    createdAt: new Date().toISOString(),
    applicants: [],
  }

  const studies = readStoredStudies()
  writeStoredStudies([nextStudy, ...studies])

  return { id: nextStudy.id }
}

export async function applyToStudy(studyId: string): Promise<StudyPost> {
  ensureSeedData()
  await wait(140)

  const studies = readStoredStudies()
  const studyIndex = studies.findIndex((item) => item.id === studyId)

  if (studyIndex < 0) {
    throw new Error('Study not found')
  }

  const currentUserName = getCurrentUserName()
  const study = studies[studyIndex]

  if (study.authorName === currentUserName) {
    throw new Error('Author cannot apply')
  }

  if (study.status === 'completed') {
    throw new Error('Study is completed')
  }

  if (study.applicants.some((applicant) => applicant.applicantName === currentUserName)) {
    throw new Error('Already applied')
  }

  studies[studyIndex] = {
    ...study,
    applicants: [
      ...study.applicants,
      {
        id: `study-application-${Date.now()}`,
        applicantName: currentUserName,
        appliedAt: new Date().toISOString(),
        status: 'pending',
      },
    ],
  }

  writeStoredStudies(studies)

  return cloneValue(studies[studyIndex])
}

export async function updateStudyApplicationStatus(
  studyId: string,
  applicationId: string,
  status: StudyApplicationStatus,
): Promise<StudyPost> {
  ensureSeedData()
  await wait(140)

  const studies = readStoredStudies()
  const studyIndex = studies.findIndex((item) => item.id === studyId)

  if (studyIndex < 0) {
    throw new Error('Study not found')
  }

  const study = studies[studyIndex]
  const nextApplicants = study.applicants.map((applicant) => {
    if (applicant.id !== applicationId) {
      return applicant
    }

    if (status === 'accepted' && applicant.status !== 'accepted' && getAcceptedCount(study) >= study.capacity) {
      throw new Error('Study is full')
    }

    return {
      ...applicant,
      status,
    }
  })

  const nextStudy: StudyPost = {
    ...study,
    applicants: nextApplicants,
  }

  if (getAcceptedCount(nextStudy) >= nextStudy.capacity) {
    nextStudy.status = 'completed'
  }

  studies[studyIndex] = nextStudy
  writeStoredStudies(studies)

  return cloneValue(nextStudy)
}

export async function updateStudyStatus(studyId: string, status: StudyStatus): Promise<StudyPost> {
  ensureSeedData()
  await wait(120)

  const studies = readStoredStudies()
  const studyIndex = studies.findIndex((item) => item.id === studyId)

  if (studyIndex < 0) {
    throw new Error('Study not found')
  }

  const study = studies[studyIndex]

  if (status === 'recruiting' && getAcceptedCount(study) >= study.capacity) {
    throw new Error('모집 인원이 모두 찬 스터디는 모집중으로 변경할 수 없습니다.')
  }

  studies[studyIndex] = {
    ...study,
    status,
  }

  writeStoredStudies(studies)

  return cloneValue(studies[studyIndex])
}
