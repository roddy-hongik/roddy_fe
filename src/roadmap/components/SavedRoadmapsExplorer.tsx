import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSavedRoadmaps } from '../../api/services/roadmapService'
import type { SavedRoadmap } from '../../api/types/roadmap'
import { ROUTES } from '../../routes/paths'
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
  const navigate = useNavigate()
  const [roadmaps, setRoadmaps] = useState<SavedRoadmap[]>([])
  /** 화면에 반영된 마지막 페이지. 다음 페이지를 받아야만 앞으로 나간다. */
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isLoadMoreError, setIsLoadMoreError] = useState(false)
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null)
  const [compareSelection, setCompareSelection] = useState<CompareSelection>({
    leftId: null,
    rightId: null,
  })
  /** 목록을 처음부터 다시 받는 사이에 앞서 떠난 "더 보기" 응답이 도착해 섞이지 않도록 한다. */
  const listVersionRef = useRef(0)

  useEffect(() => {
    let isMounted = true
    listVersionRef.current += 1

    getSavedRoadmaps()
      .then((response) => {
        if (!isMounted) {
          return
        }

        const items = response.roadmaps
        setRoadmaps(items)
        setPage(response.page)
        setTotalPages(response.totalPages)
        setIsLoadMoreError(false)
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

  const hasMore = page + 1 < totalPages

  const handleLoadMore = () => {
    const version = listVersionRef.current
    setIsLoadingMore(true)
    setIsLoadMoreError(false)

    getSavedRoadmaps(page + 1)
      .then((response) => {
        if (listVersionRef.current !== version) {
          return
        }

        // 앞 페이지를 받은 뒤 새로 저장한 로드맵이 있으면 페이지 경계가 밀려 이미 받은 로드맵이 다시 온다.
        setRoadmaps((previous) => [
          ...previous,
          ...response.roadmaps.filter((item) => !previous.some((existing) => existing.id === item.id)),
        ])
        setPage(response.page)
        setTotalPages(response.totalPages)
      })
      .catch(() => {
        if (listVersionRef.current === version) {
          setIsLoadMoreError(true)
        }
      })
      .finally(() => {
        setIsLoadingMore(false)
      })
  }

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

  const handleShareRoadmap = (roadmap: SavedRoadmap) => {
    navigate(ROUTES.communityWrite, {
      state: {
        initialPostType: 'roadmap',
        initialRoadmapId: roadmap.id,
        initialTitle: `${roadmap.targetJob} 로드맵을 공유합니다`,
        initialRoadmapSummary: `${roadmap.targetJob} 준비 과정에서 정리한 학습 로드맵입니다.`,
      },
    })
  }

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
                  <div className="roadmap-list-actions" onClick={(event) => event.stopPropagation()}>
                    <button type="button" className="profile-ghost-btn roadmap-inline-share-btn" onClick={() => handleShareRoadmap(roadmap)}>
                      공유하기
                    </button>
                    <label className="roadmap-compare-check">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={disabled}
                        onChange={() => handleToggleCompare(roadmap.id)}
                        aria-label={`${roadmap.roadmapTitle} 비교 대상 선택`}
                      />
                      비교
                    </label>
                  </div>
                </button>
              )
            })}

            {hasMore ? (
              <button type="button" className="profile-ghost-btn" disabled={isLoadingMore} onClick={handleLoadMore}>
                {isLoadingMore ? '불러오는 중...' : '더 보기'}
              </button>
            ) : null}
          </div>
          {isLoadMoreError ? <p className="profile-error-text">다음 로드맵을 불러오지 못했습니다. 다시 시도해 주세요.</p> : null}

          {selectedRoadmap ? (
            <section className="roadmap-detail-panel">
              <div className="roadmap-detail-head">
                <h3>{selectedRoadmap.roadmapTitle}</h3>
                <button type="button" className="profile-ghost-btn roadmap-inline-share-btn" onClick={() => handleShareRoadmap(selectedRoadmap)}>
                  공유하기
                </button>
              </div>
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
