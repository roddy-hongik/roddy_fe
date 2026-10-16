import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getJobPosting, getJobPostings } from '../jobs/services/jobPostingService'
import { deleteLetter, getLetter, saveLetter, type CoverLetter, type LetterAnswer, type LetterJob } from './service'
import './cover-letters.css'

type EditableAnswer = LetterAnswer & { key: string }
const editable = (answer: LetterAnswer): EditableAnswer => ({ ...answer, key: crypto.randomUUID() })
const errorText = (error: unknown) => error instanceof Error ? error.message : '요청을 처리하지 못했습니다.'

export default function CoverLetterEditorPage() {
  const { letterId } = useParams()
  const [query] = useSearchParams()
  const jobId = query.get('jobPostingId')
  return <Editor key={`${letterId ?? 'new'}:${jobId ?? ''}`} id={letterId} initialJobId={jobId} />
}

function Editor({ id, initialJobId }: { id?: string; initialJobId: string | null }) {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [job, setJob] = useState<LetterJob | null>(null)
  const [answers, setAnswers] = useState<EditableAnswer[]>(() => [editable({ question: '지원 동기', answer: '' })])
  const [version, setVersion] = useState<number>()
  const [loading, setLoading] = useState(Boolean(id || initialJobId))
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [candidates, setCandidates] = useState<LetterJob[]>([])
  const [searchError, setSearchError] = useState('')
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        if (id) {
          const letter = await getLetter(id)
          if (active) { setTitle(letter.title); setJob(letter.job); setVersion(letter.version); setAnswers(letter.answers.map(editable)) }
        } else if (initialJobId) {
          const found = await getJobPosting(initialJobId)
          if (active) { setJob({ id: found.id, title: found.title, company: found.company }); setTitle(`${found.company} 자기소개서`) }
        }
      } catch (failure) { if (active) setLoadError(errorText(failure)) }
      finally { if (active) setLoading(false) }
    }
    void load()
    return () => { active = false }
  }, [id, initialJobId])

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const changed = () => { setDirty(true); setMessage('') }
  const updateAnswer = (key: string, patch: Partial<LetterAnswer>) => {
    setAnswers(current => current.map(answer => answer.key === key ? { ...answer, ...patch } : answer)); changed()
  }
  const move = (index: number, direction: number) => {
    setAnswers(current => { const next = [...current]; [next[index], next[index + direction]] = [next[index + direction], next[index]]; return next }); changed()
  }
  const applySaved = (letter: CoverLetter) => { setVersion(letter.version); setDirty(false); setMessage('저장했습니다.') }
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim() || answers.some(answer => !answer.question.trim())) { setError('제목과 모든 문항을 입력해 주세요.'); return }
    setBusy(true); setError('')
    try {
      const saved = await saveLetter(id, { title, jobPostingId: job?.id ?? null, version, answers: answers.map(({ question, answer }) => ({ question, answer })) })
      applySaved(saved)
      if (!id) navigate(`/cover-letters/${saved.id}`, { replace: true })
    } catch (failure) { setError(errorText(failure)) }
    finally { setBusy(false) }
  }
  const remove = async () => {
    if (!id || version === undefined || !window.confirm('이 자기소개서와 모든 답변을 삭제할까요?')) return
    setBusy(true); setError('')
    try { await deleteLetter(id, version); setDirty(false); navigate('/cover-letters', { replace: true }) }
    catch (failure) { setError(errorText(failure)); setBusy(false) }
  }
  const search = async () => {
    setSearching(true); setSearchError('')
    try { const response = await getJobPostings({ keyword, size: 10 }); setCandidates(response.jobs) }
    catch (failure) { setSearchError(errorText(failure)) }
    finally { setSearching(false) }
  }
  const back = () => { if (!dirty || window.confirm('저장하지 않은 변경사항을 버리고 목록으로 돌아갈까요?')) navigate('/cover-letters') }

  if (loading) return <main className="cover-letter-page" role="status">자기소개서를 불러오는 중...</main>
  if (loadError) return <main className="cover-letter-page"><p role="alert">{loadError}</p><Link to="/cover-letters">목록으로</Link></main>
  return <main className="cover-letter-page">
    <header className="cover-letter-heading"><h1>{id ? '자기소개서 편집' : '자기소개서 작성'}</h1><button onClick={back} disabled={busy}>목록으로</button></header>
    <p>답변이 비어 있어도 저장할 수 있습니다. 문항은 최대 20개까지 작성할 수 있습니다.</p>
    <form onSubmit={submit}>
      <fieldset disabled={busy} className="cover-letter-fields">
        <legend className="cover-letter-form-legend">자기소개서 작성 양식</legend>
        <label>제목<input value={title} onChange={event => { setTitle(event.target.value); changed() }} maxLength={255} required /></label>
        <section className="cover-letter-job" aria-label="연결 공고">
          <h2>연결 공고 <small>(선택)</small></h2>
          {job ? <p><Link to={`/jobs/${job.id}`}>{job.company} · {job.title}</Link> <button type="button" onClick={() => { setJob(null); changed() }}>연결 해제</button></p> : <p>연결된 공고가 없습니다.</p>}
          <div className="cover-letter-actions"><label>공고 검색<input value={keyword} onChange={event => setKeyword(event.target.value)} placeholder="기업명 또는 공고 제목" /></label>
            <button type="button" disabled={searching} onClick={() => void search()}>{searching ? '검색 중...' : '검색'}</button></div>
          {searchError && <p role="alert">{searchError}</p>}
          <ul className="cover-letter-search">{candidates.map(candidate => <li key={candidate.id}><button type="button" onClick={() => { setJob(candidate); setCandidates([]); changed() }}>{candidate.company} · {candidate.title}</button></li>)}</ul>
        </section>
        {answers.map((answer, index) => <section key={answer.key} className="cover-letter-question">
          <div className="cover-letter-heading"><h2>문항 {index + 1}</h2><div className="cover-letter-actions">
            <button type="button" aria-label={`문항 ${index + 1} 위로`} disabled={index === 0} onClick={() => move(index, -1)}>↑</button>
            <button type="button" aria-label={`문항 ${index + 1} 아래로`} disabled={index === answers.length - 1} onClick={() => move(index, 1)}>↓</button>
            <button type="button" disabled={answers.length === 1} onClick={() => { if (window.confirm('이 문항과 답변을 제거할까요?')) { setAnswers(current => current.filter(item => item.key !== answer.key)); changed() } }}>문항 삭제</button>
          </div></div>
          <label>문항 내용<textarea value={answer.question} onChange={event => updateAnswer(answer.key, { question: event.target.value })} maxLength={1000} rows={2} required /></label>
          <label>답변<textarea value={answer.answer} onChange={event => updateAnswer(answer.key, { answer: event.target.value })} maxLength={10000} rows={10} placeholder="경험과 생각을 작성해 주세요." /></label>
          <small>{answer.answer.length.toLocaleString()} / 10,000자 (공백 포함)</small>
        </section>)}
        <button type="button" disabled={answers.length >= 20} onClick={() => { setAnswers(current => [...current, editable({ question: '', answer: '' })]); changed() }}>문항 추가</button>
        <div className="cover-letter-actions"><button type="submit" className="profile-action-btn">{busy ? '처리 중...' : '저장'}</button>
          {id && <button type="button" className="cover-letter-danger" onClick={() => void remove()}>자기소개서 삭제</button>}
          <span role="status">{dirty ? '저장하지 않은 변경사항이 있습니다.' : message}</span></div>
      </fieldset>
      {error && <p className="profile-error-text" role="alert">{error}</p>}
    </form>
  </main>
}
