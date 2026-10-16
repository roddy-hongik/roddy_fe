import { httpClient } from '../../api/client/httpClient'
import { API_ENDPOINTS } from '../../api/constants/endpoints'
import { getAnalysisSummary } from '../../api/services/roadmapService'
import type { InterviewAnalysisSummary, InterviewQuestion } from '../types/mockInterview'

type InterviewQuestionsResponse = {
  questions: InterviewQuestion[]
}

export const getMockInterviewSummary = (): Promise<InterviewAnalysisSummary> => getAnalysisSummary()

export const generateMockInterviewQuestions = (): Promise<InterviewQuestion[]> =>
  httpClient<InterviewQuestionsResponse>(API_ENDPOINTS.mockInterview.questions, {
    method: 'POST',
  }).then((response) => response.questions)
