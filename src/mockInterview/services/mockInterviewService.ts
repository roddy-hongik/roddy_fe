import { mockGeneratedQuestions } from '../data/mockInterviewData'
import type { InterviewAnalysisSummary, InterviewQuestion } from '../types/mockInterview'

// Intentional mock domain: mock interview backend API is not implemented yet.

const wait = (ms: number) => new Promise((resolve) => {
  window.setTimeout(resolve, ms)
})

export const generateMockInterviewQuestions = async (summary: InterviewAnalysisSummary): Promise<InterviewQuestion[]> => {
  if (summary.gapSkills.length === 0) {
    return []
  }

  await wait(550)

  return mockGeneratedQuestions.map((content, index) => ({
    id: `q-${index + 1}`,
    content,
  }))
}
