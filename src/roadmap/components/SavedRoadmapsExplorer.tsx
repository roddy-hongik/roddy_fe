import { useEffect, useMemo, useState } from 'react'
import { getSavedRoadmaps } from '../../api/services/roadmapService'
import type { SavedRoadmap } from '../../api/types/roadmap'
import { formatRoadmapDate, formatRoadmapDateTime } from '../utils/roadmapFormat'
import '../styles/roadmap-page.css'

type CompareSelection = {
  leftId: string | null
  rightId: string | null
}

type SavedRoadmapsExplorerProps = {
  heading?: string
  description?: string
  refreshKey?: number
  containerClassName?: string
}

const STAGE_ORDER: Array<'기초' | '심화' | '실전 프로젝트'> = ['기초', '심화', '실전 프로젝트']

const getStepByStage = (roadmap: SavedRoadmap | null, stage: (typeof STAGE_ORDER)[number]) => roadmap?.roadmapSteps.find((step) => step.stage === stage)

function SavedRoadmapsExplorer({
  heading = '저장된 로드맵',
  description = '저장된 로드맵을 조회하고 2개를 선택해 비교할 수 있습니다.',
  refreshKey = 0,
  containerClassName = '',
}: SavedRoadmapsExplorerProps) {
  const [roadmaps, setRoadmaps] = useState<SavedRoadmap[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null)
  const [compareSelection, setCompareSelection] = useState<CompareSelection>({
    leftId: null,
    rightId: null,
  })

  useEffect(() => {
    let isMounted = true

    getSavedRoadmaps()
      .then((items) => {
        if (!isMounted) {
          return
        }

        setRoadmaps(items)
        setSelectedRoadmapId((prev) => (prev && items.some((item) => item.id === prev) ? prev : (items[0]?.id ?? null)))
        setIsError(false)
      })
      .catch(() => {
        if (isMounted) {
          setIsError(true)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [refreshKey])

  const selectedRoadmap = useMemo(
    () => roadmaps.find((roadmap) => roadmap.id === selectedRoadmapId) ?? null,
    [roadmaps, selectedRoadmapId],
  )

  const leftRoadmap = useMemo(
    () => roadmaps.find((roadmap) => roadmap.id === compareSelection.leftId) ?? null,
    [compareSelection.leftId, roadmaps],
  )
  const rightRoadmap = useMemo(
    () => roadmaps.find((roadmap) => roadmap.id === compareSelection.rightId) ?? null,
    [compareSelection.rightId, roadmaps],
  )

  const compareCount = Number(Boolean(compareSelection.leftId)) + Number(Boolean(compareSelection.rightId))

  const handleToggleCompare = (roadmapId: string) => {
    setCompareSelection((prev) => {
      if (prev.leftId === roadmapId) {
        return { ...prev, leftId: null }
      }

      if (prev.rightId === roadmapId) {
        return { ...prev, rightId: null }
      }

      if (!prev.leftId) {
        return { ...prev, leftId: roadmapId }
      }

      if (!prev.rightId) {
        return { ...prev, rightId: roadmapId }
      }

      return prev
    })
  }

  const renderCompareMeta = (roadmap: SavedRoadmap | null) => {
    if (!roadmap) {
      return <p className="profile-meta-text">로드맵을 선택해 주세요.</p>
    }

    return (
      <>
        <p className="roadmap-compare-meta">생성일: {formatRoadmapDateTime(roadmap.createdAt)}</p>
        <p className="roadmap-compare-meta">목표 직무: {roadmap.targetJob}</p>
        <p className="roadmap-compare-meta">목표 기업: {roadmap.targetCompany}</p>
        <p className="roadmap-compare-meta">Gap: {roadmap.gapSkills.join(', ') || '-'}</p>
      </>
    )
  }

  return (
    <section className={`roadmap-archive-card glass-style ${containerClassName}`.trim()}>
      <h2>{heading}</h2>
      <p className="profile-meta-text">{description}</p>

      {isLoading ? <p className="profile-meta-text">저장된 로드맵을 불러오는 중입니다...</p> : null}
      {isError ? <p className="profile-error-text">저장된 로드맵을 불러오지 못했습니다.</p> : null}
      {!isLoading && !isError && roadmaps.length === 0 ? <p className="profile-meta-text">아직 저장된 로드맵이 없습니다.</p> : null}

      {!isLoading && !isError && roadmaps.length > 0 ? (
        <>
          <div className="roadmap-list" role="list" aria-label="저장된 로드맵 목록">
            {roadmaps.map((roadmap) => {
              const isChecked = compareSelection.leftId === roadmap.id || compareSelection.rightId === roadmap.id
              const disabled = !isChecked && compareCount >= 2

              return (
                <button
                  key={roadmap.id}
                  type="button"
                  className={`roadmap-list-item ${selectedRoadmapId === roadmap.id ? 'active' : ''}`}
                  onClick={() => setSelectedRoadmapId(roadmap.id)}
                >
                  <div>
                    <p className="roadmap-list-title">{roadmap.roadmapTitle}</p>
                    <p className="roadmap-list-meta">
                      {formatRoadmapDate(roadmap.createdAt)} · {roadmap.targetJob} · {roadmap.targetCompany}
                    </p>
                  </div>
                  <label className="roadmap-compare-check" onClick={(event) => event.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={disabled}
                      onChange={() => handleToggleCompare(roadmap.id)}
                      aria-label={`${roadmap.roadmapTitle} 비교 대상 선택`}
                    />
                    비교
                  </label>
                </button>
              )
            })}
          </div>

          {selectedRoadmap ? (
            <section className="roadmap-detail-panel">
              <h3>{selectedRoadmap.roadmapTitle}</h3>
              <p className="roadmap-list-meta">
                생성일: {formatRoadmapDateTime(selectedRoadmap.createdAt)} · 목표 직무: {selectedRoadmap.targetJob} · 목표 기업: {selectedRoadmap.targetCompany}
              </p>
              <ol className="roadmap-stepper compact">
                {selectedRoadmap.roadmapSteps.map((step) => (
                  <li key={`${selectedRoadmap.id}-${step.stage}`} className="roadmap-step-item">
                    <p className="roadmap-step-stage">{step.stage}</p>
                    <p className="roadmap-step-goal">학습 목표: {step.goal}</p>
                    <p className="profile-meta-text">학습 주제: {step.topics.join(', ')}</p>
                    <p className="profile-meta-text">추천 결과물: {step.outputs.join(', ')}</p>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          <section className="roadmap-compare-wrap" aria-live="polite">
            <h3>로드맵 비교</h3>
            {compareCount < 2 ? <p className="profile-meta-text">비교할 로드맵 2개를 선택해 주세요. (현재 {compareCount}개 선택)</p> : null}
            <div className="roadmap-compare-grid">
              {[leftRoadmap, rightRoadmap].map((roadmap, index) => (
                <article key={index === 0 ? 'left' : 'right'} className="roadmap-compare-column">
                  <h4>{index === 0 ? '비교 A' : '비교 B'}</h4>
                  {renderCompareMeta(roadmap)}
                  {STAGE_ORDER.map((stage) => {
                    const step = getStepByStage(roadmap, stage)

                    return (
                      <section key={`${index}-${stage}`} className="roadmap-compare-stage">
                        <h5>{stage}</h5>
                        {step ? (
                          <>
                            <p>목표: {step.goal}</p>
                            <p>주제: {step.topics.join(', ')}</p>
                            <p>결과물: {step.outputs.join(', ')}</p>
                          </>
                        ) : (
                          <p className="profile-meta-text">해당 단계 정보 없음</p>
                        )}
                      </section>
                    )
                  })}
                </article>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </section>
  )
}

export default SavedRoadmapsExplorer
