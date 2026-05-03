export type StudyMode = 'offline' | 'online'
export type StudyStatus = 'recruiting' | 'completed'
export type StudyApplicationStatus = 'pending' | 'accepted' | 'rejected'

export type StudyApplication = {
  id: string
  applicantName: string
  appliedAt: string
  status: StudyApplicationStatus
}

export type StudyPost = {
  id: string
  title: string
  description: string
  mode: StudyMode
  location: string
  scheduledAt: string
  capacity: number
  status: StudyStatus
  authorName: string
  createdAt: string
  applicants: StudyApplication[]
}

export type CreateStudyPayload = {
  title: string
  description: string
  mode: StudyMode
  location: string
  scheduledAt: string
  capacity: number
}
