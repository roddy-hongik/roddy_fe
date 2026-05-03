import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES, routePaths } from '../../routes/paths'
import AppTopNav from '../../shared/components/AppTopNav'
import '../../profile/styles/profile-pages.css'
import { createStudy } from '../services/studyService'
import '../styles/study-pages.css'
import type { StudyMode } from '../types/study'

function StudyWritePage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [mode, setMode] = useState<StudyMode | ''>('')
  const [location, setLocation] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [capacity, setCapacity] = useState('4')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!title.trim() || !description.trim()) {
      alert('제목과 설명을 모두 입력해 주세요.')
      return
    }

    if (!mode) {
      alert('스터디 진행 방식을 선택해 주세요.')
      return
    }

    if (!location.trim() || !scheduledAt.trim()) {
      alert('장소와 시간을 입력해 주세요.')
      return
    }

    const numericCapacity = Number(capacity)

    if (!Number.isInteger(numericCapacity) || numericCapacity < 2) {
      alert('모집 인원은 2명 이상으로 입력해 주세요.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await createStudy({
        title,
        description,
        mode,
        location,
        scheduledAt,
        capacity: numericCapacity,
      })

      navigate(routePaths.studyDetail(response.id))
    } catch {
      alert('스터디 모집 글 작성에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="profile-layout-shell">
      <AppTopNav loginRedirectPath={ROUTES.studyWrite} />
      <section className="profile-layout-content study-page">
        <section className="profile-card study-page-card">
          <h1>스터디 모집 글 작성</h1>
          <p className="profile-meta-text">스터디 진행 방식과 모집 조건을 입력해 멤버를 모집해 보세요.</p>

          <form className="study-write-form" onSubmit={handleSubmit}>
            <div className="study-field-block">
              <label htmlFor="study-title">제목</label>
              <input id="study-title" type="text" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={100} />
            </div>

            <div className="study-field-block">
              <label htmlFor="study-description">스터디 소개</label>
              <textarea
                id="study-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="스터디 목표, 대상, 진행 내용을 자세히 적어 주세요."
              />
            </div>

            <div className="study-field-block">
              <span className="study-mode-select-label">스터디 진행 방식</span>
              <div className="study-mode-select">
                <button type="button" className={`study-mode-option ${mode === 'offline' ? 'is-active' : ''}`} onClick={() => setMode('offline')}>
                  대면
                </button>
                <button type="button" className={`study-mode-option ${mode === 'online' ? 'is-active' : ''}`} onClick={() => setMode('online')}>
                  비대면
                </button>
              </div>
            </div>

            {mode ? (
              <div className="study-field-grid">
                <div className="study-field-block">
                  <label htmlFor="study-location">{mode === 'offline' ? '장소' : '진행 링크/플랫폼'}</label>
                  <input
                    id="study-location"
                    type="text"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder={mode === 'offline' ? '예: 강남역 스터디룸' : '예: Discord / Google Meet'}
                  />
                </div>

                <div className="study-field-block">
                  <label htmlFor="study-time">시간</label>
                  <input id="study-time" type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} />
                </div>

                <div className="study-field-block">
                  <label htmlFor="study-capacity">모집 인원</label>
                  <input id="study-capacity" type="number" min={2} max={20} value={capacity} onChange={(event) => setCapacity(event.target.value)} />
                </div>
              </div>
            ) : null}

            <div className="study-action-row">
              <button type="button" className="profile-ghost-btn" onClick={() => navigate(ROUTES.study)}>
                목록으로
              </button>
              <button type="submit" className="profile-action-btn" disabled={isSubmitting}>
                {isSubmitting ? '등록 중...' : '스터디 모집 등록'}
              </button>
            </div>
          </form>
        </section>
      </section>
    </main>
  )
}

export default StudyWritePage
