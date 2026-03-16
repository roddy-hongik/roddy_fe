import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProfileTopNav from '../../profile/components/ProfileTopNav'
import { mockInterviewSummary } from '../data/mockInterviewData'
import { generateMockInterviewQuestions } from '../services/mockInterviewService'
import type { InterviewQuestion } from '../types/mockInterview'
import { ROUTES } from '../../routes/paths'
import InterviewQuestionPanel from '../components/InterviewQuestionPanel'
import SkillSummaryCard from '../components/SkillSummaryCard'
import '../styles/mock-interview-page.css'

function MockInterviewPage() {
  const navigate = useNavigate()
  const summary = mockInterviewSummary
  const hasGap = summary.gapSkills.length > 0
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [isQuestionError, setIsQuestionError] = useState(false)
  const [isInterviewFinished, setIsInterviewFinished] = useState(false)

  const aiGuideText = `${summary.targetJob} 지원을 위해 ${summary.gapSkills[0] ?? '핵심 기술'} 관련 예상 질문 3가지를 물어볼게요.`

  const activeQuestionId = useMemo(() => questions[activeQuestionIndex]?.id ?? null, [activeQuestionIndex, questions])

  const handleGenerateQuestions = useCallback(async () => {
    if (!hasGap) {
      return
    }

    setIsLoadingQuestions(true)
    setIsQuestionError(false)
    setIsInterviewFinished(false)

    try {
      const nextQuestions = await generateMockInterviewQuestions(summary)
      setQuestions(nextQuestions)
      setAnswers({})
      setActiveQuestionIndex(0)
    } catch {
      setQuestions([])
      setIsQuestionError(true)
    } finally {
      setIsLoadingQuestions(false)
    }
  }, [hasGap, summary])

  useEffect(() => {
    void handleGenerateQuestions()
  }, [handleGenerateQuestions])

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleNextQuestion = () => {
    if (activeQuestionIndex >= questions.length - 1) {
      setIsInterviewFinished(true)
      return
    }

    setActiveQuestionIndex((prev) => prev + 1)
  }

  const handleEndInterview = () => {
    setIsInterviewFinished(true)
  }

  return (
    <main className="profile-layout-shell">
      <ProfileTopNav />
      <section className="profile-layout-content profile-page profile-fade-in">
        <section className="profile-card mock-interview-card">
          <header className="profile-card-header">
            <h1>모의면접</h1>
            <p>기술 스택 Gap 기반 예상 질문으로 실전 답변을 연습합니다.</p>
          </header>

          <div className="mock-interview-grid">
            <SkillSummaryCard summary={summary} />
            <InterviewQuestionPanel
              questions={questions}
              answers={answers}
              activeQuestionId={activeQuestionId}
              isLoading={isLoadingQuestions}
              isError={isQuestionError}
              hasGap={hasGap}
              aiGuideText={aiGuideText}
              isFinished={isInterviewFinished}
              onAnswerChange={handleAnswerChange}
              onNextQuestion={handleNextQuestion}
              onRegenerate={handleGenerateQuestions}
              onEndInterview={handleEndInterview}
            />
            <section className="mock-panel glass-style">
              <h2>학습 로드맵 안내</h2>
              <p className="profile-meta-text">면접 연습 후 학습 로드맵 생성/저장/비교는 로드맵 메뉴에서 확인할 수 있습니다.</p>
              <button type="button" className="profile-action-btn mock-roadmap-link-btn" onClick={() => navigate(ROUTES.roadmap)}>
                로드맵 페이지로 이동
              </button>
            </section>
          </div>
        </section>
      </section>
    </main>
  )
}

export default MockInterviewPage
