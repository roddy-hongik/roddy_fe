import { useEffect, useMemo, useState } from 'react'
import { getAnalysisSummary, generateRoadmap, saveRoadmap } from '../../api/services/roadmapService'
import type { AnalysisSummary, GeneratedRoadmap } from '../../api/types/roadmap'
import RoadmapResultCard from '../components/RoadmapResultCard'
import RoadmapSummaryCard from '../components/RoadmapSummaryCard'
import SavedRoadmapsExplorer from '../components/SavedRoadmapsExplorer'
import '../../profile/styles/profile-pages.css'
import '../styles/roadmap-page.css'

function RoadmapPage() {
  const [summary, setSummary] = useState<AnalysisSummary | null>(null)
  const [isSummaryLoading, setIsSummaryLoading] = useState(true)
  const [isSummaryError, setIsSummaryError] = useState(false)

  const [generatedRoadmap, setGeneratedRoadmap] = useState<GeneratedRoadmap | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateErrorMessage, setGenerateErrorMessage] = useState<string | null>(null)

  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null)
  const [savedRefreshKey, setSavedRefreshKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    getAnalysisSummary()
      .then((response) => {
        if (!isMounted) {
          return
        }

        setSummary(response)
        setIsSummaryError(false)
      })
      .catch(() => {
        if (isMounted) {
          setIsSummaryError(true)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsSummaryLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const hasGap = useMemo(() => (summary?.gapSkills.length ?? 0) > 0, [summary])

  const handleGenerateRoadmap = async () => {
    if (!summary) {
      return
    }

    if (!hasGap) {
      setGenerateErrorMessage('Gap 데이터가 없어 로드맵을 생성할 수 없습니다.')
      return
    }

    setIsGenerating(true)
    setGenerateErrorMessage(null)
    setSaveMessage(null)
    setSaveErrorMessage(null)

    try {
      const roadmap = await generateRoadmap(summary)
      setGeneratedRoadmap(roadmap)
    } catch {
      setGenerateErrorMessage('로드맵 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveRoadmap = async () => {
    if (!summary || !generatedRoadmap) {
      return
    }

    setSaveMessage(null)
    setSaveErrorMessage(null)

    try {
      const result = await saveRoadmap(summary, generatedRoadmap)
      if (!result.saved) {
        setSaveErrorMessage('동일한 로드맵이 이미 저장되어 있습니다.')
        return
      }

      setSaveMessage(`${new Date(result.roadmap.createdAt).toLocaleString('ko-KR')} 기준으로 저장되었습니다.`)
      setSavedRefreshKey((prev) => prev + 1)
    } catch {
      setSaveErrorMessage('로드맵 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.')
    }
  }

  return (
    <main className="profile-layout-shell roadmap-page-shell">
      <section className="profile-layout-content profile-page profile-fade-in">
        <section className="profile-card roadmap-page-card">
          <header className="profile-card-header">
            <h1>로드맵</h1>
            <p>기술 스택 분석 데이터를 기반으로 개인 맞춤형 학습 로드맵을 생성하고 관리합니다.</p>
          </header>

          {isSummaryLoading ? <p className="profile-meta-text">분석 요약을 불러오는 중입니다...</p> : null}
          {isSummaryError ? <p className="profile-error-text">분석 요약을 불러오지 못했습니다.</p> : null}

          {!isSummaryLoading && !isSummaryError && summary ? (
            <div className="roadmap-page-grid">
              <RoadmapSummaryCard summary={summary} />

              <section className="roadmap-generate-card glass-style" aria-live="polite">
                <h2>AI 로드맵 생성</h2>
                <p className="profile-meta-text">
                  생성 조건: {summary.targetJob} · {summary.targetCompany} · Gap {summary.gapSkills.join(', ') || '-'}
                </p>
                <div className="roadmap-generate-actions">
                  <button type="button" className="profile-action-btn" onClick={handleGenerateRoadmap} disabled={isGenerating || !hasGap}>
                    {isGenerating ? '생성 중...' : 'AI 로드맵 생성'}
                  </button>
                </div>
                {!hasGap ? <p className="profile-meta-text">분석 데이터가 충분하지 않아 로드맵을 생성할 수 없습니다.</p> : null}
                {generateErrorMessage ? <p className="profile-error-text">{generateErrorMessage}</p> : null}
              </section>

              {generatedRoadmap ? (
                <>
                  <RoadmapResultCard roadmap={generatedRoadmap} />
                  <section className="roadmap-save-card glass-style" aria-live="polite">
                    <h2>로드맵 저장</h2>
                    <p className="profile-meta-text">생성 결과를 저장해 이후 비교 및 회고에 활용할 수 있습니다.</p>
                    <button type="button" className="profile-action-btn" onClick={handleSaveRoadmap}>
                      로드맵 저장
                    </button>
                    {saveMessage ? <p className="profile-meta-text">{saveMessage}</p> : null}
                    {saveErrorMessage ? <p className="profile-error-text">{saveErrorMessage}</p> : null}
                  </section>
                </>
              ) : (
                <section className="roadmap-empty-card glass-style">
                  <h2>생성 결과</h2>
                  <p className="profile-meta-text">로드맵을 생성하면 단계별 학습 계획이 표시됩니다.</p>
                </section>
              )}

              <SavedRoadmapsExplorer refreshKey={savedRefreshKey} />
            </div>
          ) : null}
        </section>
      </section>
    </main>
  )
}

export default RoadmapPage
