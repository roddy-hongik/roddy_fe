import type { AnalysisSummary } from '../../api/types/roadmap'

export type InterviewAnalysisSummary = AnalysisSummary

export type InterviewQuestion = {
  id: string
  question: string
  intent: string
  keyPoints: string[]
}
