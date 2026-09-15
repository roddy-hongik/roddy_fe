import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listLetters, type LetterPage } from './service'
import './cover-letters.css'

export default function CoverLetterListPage() {
  const [page, setPage] = useState(0)
  const [result, setResult] = useState<{ page: number; data?: LetterPage; error?: string } | null>(null)
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let active = true
    listLetters(page).then(data => { if (active) setResult({ page, data }) })
      .catch(error => { if (active) setResult({ page, error: error instanceof Error ? error.message : '목록을 불러오지 못했습니다.' }) })
    return () => { active = false }
  }, [page, retry])
  const data = result?.page === page ? result.data : undefined
  const error = result?.page === page ? result.error : undefined
  return <main className="cover-letter-page">
    <header className="cover-letter-heading"><div><h1>내 자기소개서</h1><p>공고별 지원 동기와 경험을 문항별로 정리하세요.</p></div>
      <Link className="profile-action-btn" to="/cover-letters/new">자기소개서 작성</Link></header>
    {error ? <div role="alert"><p>{error}</p><button onClick={() => setRetry(value => value + 1)}>다시 시도</button></div> : !data ? <p role="status">불러오는 중...</p> : <>
      {data.coverLetters.length === 0 ? <p>저장한 자기소개서가 없습니다.</p> : <ul className="cover-letter-list">
        {data.coverLetters.map(letter => <li key={letter.id}><Link to={`/cover-letters/${letter.id}`}>
          <h2>{letter.title}</h2><p>{letter.job ? `${letter.job.company} · ${letter.job.title}` : '공고 미연결'}</p>
          <small>최근 수정 {new Date(letter.updatedAt).toLocaleString('ko-KR')}</small>
        </Link></li>)}
      </ul>}
      <nav className="cover-letter-actions" aria-label="자기소개서 페이지">
        <button disabled={page === 0} onClick={() => setPage(page - 1)}>이전</button>
        <span>{page + 1} / {Math.max(1, data.totalPages)}</span>
        <button disabled={page + 1 >= data.totalPages} onClick={() => setPage(page + 1)}>다음</button>
      </nav>
    </>}
  </main>
}
