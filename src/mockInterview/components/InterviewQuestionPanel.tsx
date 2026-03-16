import type { InterviewQuestion } from '../types/mockInterview'

type InterviewQuestionPanelProps = {
  questions: InterviewQuestion[]
  answers: Record<string, string>
  activeQuestionId: string | null
  isLoading: boolean
  isError: boolean
  hasGap: boolean
  aiGuideText: string
  isFinished: boolean
  onAnswerChange: (questionId: string, answer: string) => void
  onNextQuestion: () => void
  onRegenerate: () => void
  onEndInterview: () => void
}

function InterviewQuestionPanel({
  questions,
  answers,
  activeQuestionId,
  isLoading,
  isError,
  hasGap,
  aiGuideText,
  isFinished,
  onAnswerChange,
  onNextQuestion,
  onRegenerate,
  onEndInterview,
}: InterviewQuestionPanelProps) {
  if (!hasGap) {
    return (
      <section className="mock-panel glass-style" aria-live="polite">
        <h2>AI 기반 예상 면접 질문</h2>
        <p className="profile-meta-text">Gap 데이터가 아직 없습니다. 기술 스택 분석을 먼저 진행해 주세요.</p>
      </section>
    )
  }

  return (
    <section className="mock-panel glass-style" aria-live="polite">
      <h2>AI 기반 예상 면접 질문</h2>
      <p className="mock-ai-guide">{aiGuideText}</p>

      {isLoading ? <p className="profile-meta-text">예상 질문을 생성하는 중입니다...</p> : null}
      {isError ? <p className="profile-error-text">질문 생성에 실패했습니다. 다시 생성 버튼을 눌러주세요.</p> : null}

      {!isLoading && !isError ? (
        <div className="mock-question-list">
          {questions.map((question, index) => {
            const isActive = activeQuestionId === question.id

            return (
              <article key={question.id} className={`mock-question-item ${isActive ? 'active' : ''}`}>
                <div className="mock-question-bubble">
                  <span className="mock-question-order">Q{index + 1}</span>
                  <p>{question.content}</p>
                </div>

                <label className="mock-answer-field" htmlFor={`answer-${question.id}`}>
                  <span>답변</span>
                  <textarea
                    id={`answer-${question.id}`}
                    value={answers[question.id] ?? ''}
                    onChange={(event) => onAnswerChange(question.id, event.target.value)}
                    placeholder="답변을 입력해 주세요"
                    rows={4}
                  />
                </label>
              </article>
            )
          })}
        </div>
      ) : null}

      <div className="mock-actions-row">
        <button type="button" className="profile-ghost-btn" onClick={onNextQuestion} disabled={isLoading || isError || isFinished}>
          다음 질문
        </button>
        <button type="button" className="profile-ghost-btn" onClick={onRegenerate} disabled={isLoading}>
          다시 생성
        </button>
        <button type="button" className="profile-action-btn" onClick={onEndInterview} disabled={isLoading}>
          면접 종료
        </button>
      </div>
      {isFinished ? <p className="mock-finish-note">모의면접이 종료되었습니다. 답변을 복기하고 로드맵 생성을 진행해보세요.</p> : null}
    </section>
  )
}

export default InterviewQuestionPanel
