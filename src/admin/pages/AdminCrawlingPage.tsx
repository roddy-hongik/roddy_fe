import { useEffect, useMemo, useState } from 'react'
import StatusBadge from '../components/StatusBadge'
import { getCrawlingDashboard, startCrawling } from '../../api/services/adminService'
import type { CrawlingDashboard } from '../../api/types/admin'
import { formatDateTime } from '../utils/adminFormat'

/** 수집이 도는 동안 현황을 다시 불러오는 간격. 회사 한 곳에 수십 초가 걸려 더 잦을 필요는 없다. */
const POLLING_INTERVAL_MS = 5000

const START_FAILED_MESSAGE = '수집을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.'

function AdminCrawlingPage() {
  const [dashboard, setDashboard] = useState<CrawlingDashboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [startError, setStartError] = useState<string | null>(null)

  const isRunning = dashboard?.running ?? false

  useEffect(() => {
    let isMounted = true

    getCrawlingDashboard()
      .then((response) => {
        if (!isMounted) {
          return
        }
        setDashboard(response)
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
  }, [])

  // 수집이 도는 동안에만 다시 불러온다. 끝나서 running 이 꺼지면 멈춘다.
  useEffect(() => {
    if (!isRunning) {
      return
    }

    let isMounted = true
    const timerId = window.setInterval(() => {
      getCrawlingDashboard()
        .then((response) => {
          if (isMounted) {
            setDashboard(response)
            setIsError(false)
          }
        })
        .catch(() => {
          // 한 번 놓쳐도 다음 주기에 다시 부른다. 보고 있던 표는 지우지 않는다.
        })
    }, POLLING_INTERVAL_MS)

    return () => {
      isMounted = false
      window.clearInterval(timerId)
    }
  }, [isRunning])

  const handleStart = async () => {
    setIsStarting(true)
    setStartError(null)

    try {
      setDashboard(await startCrawling())
    } catch {
      // 다른 관리자나 예약 수집이 먼저 시작했을 수 있다. 그렇다면 실패가 아니라 진행 중으로 보여준다.
      try {
        const latest = await getCrawlingDashboard()
        setDashboard(latest)
        if (!latest.running) {
          setStartError(START_FAILED_MESSAGE)
        }
      } catch {
        setStartError(START_FAILED_MESSAGE)
      }
    } finally {
      setIsStarting(false)
    }
  }

  const kpiItems = useMemo(() => {
    if (!dashboard) {
      return []
    }

    return [
      { label: '오늘 총 수집 공고 수', value: dashboard.totalCollectedToday.toLocaleString() },
      { label: '성공 건수', value: dashboard.successCount.toLocaleString() },
      { label: '실패 건수', value: dashboard.failCount.toLocaleString() },
      { label: '마지막 수집 시각', value: formatDateTime(dashboard.lastCrawledAt) },
    ]
  }, [dashboard])

  let startButtonLabel = '지금 수집'
  if (isStarting) {
    startButtonLabel = '시작하는 중...'
  }
  if (isRunning) {
    startButtonLabel = '수집 중...'
  }

  return (
    <section className="admin-content-panel">
      <header className="admin-section-header">
        <div>
          <h3>크롤링 모니터링 대시보드</h3>
          <p>회사 채용 사이트에서 공고를 수집한 결과를 확인합니다.</p>
        </div>
        <button
          type="button"
          className="admin-btn primary"
          onClick={handleStart}
          disabled={isLoading || isError || isStarting || isRunning}
        >
          {startButtonLabel}
        </button>
      </header>

      {isRunning ? (
        <p className="admin-meta" role="status">
          수집이 진행 중입니다. 회사를 한 곳씩 차례로 수집해 몇 분 걸리며, 끝나면 표가 자동으로 갱신됩니다.
        </p>
      ) : null}
      {startError ? (
        <p className="admin-error" role="alert">
          {startError}
        </p>
      ) : null}

      {isLoading ? <p className="admin-meta">대시보드를 불러오는 중입니다...</p> : null}
      {isError ? <p className="admin-error">대시보드를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p> : null}

      {!isLoading && !isError && dashboard ? (
        <>
          <div className="admin-kpi-grid">
            {kpiItems.map((item) => (
              <article key={item.label} className="admin-kpi-card">
                <p>{item.label}</p>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>

          {dashboard.companies.length === 0 ? (
            <p className="admin-meta">수집 명세에 등록된 회사가 없습니다.</p>
          ) : (
            <>
              <p className="admin-meta">
                전체 {dashboard.companies.length}곳 · 오류 {dashboard.errorCount}곳 · 주의 {dashboard.warningCount}곳.
                문제가 있는 회사가 위에 표시됩니다.
              </p>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>회사</th>
                      <th>오늘 수집 건수</th>
                      <th>성공 건수</th>
                      <th>실패 건수</th>
                      <th>성공률</th>
                      <th>마지막 수집 시각</th>
                      <th>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.companies.map((company) => {
                      const ratio =
                        company.collectedToday === 0 ? 0 : Math.round((company.successCount / company.collectedToday) * 100)

                      return (
                        <tr key={company.id}>
                          <td>{company.name}</td>
                          <td>{company.collectedToday.toLocaleString()}</td>
                          <td>{company.successCount.toLocaleString()}</td>
                          <td>{company.failCount.toLocaleString()}</td>
                          <td>
                            <div className="admin-progress-cell">
                              <div className="admin-progress-track" aria-hidden="true">
                                <span style={{ width: `${ratio}%` }} />
                              </div>
                              <span>{ratio}%</span>
                            </div>
                          </td>
                          <td>{formatDateTime(company.lastCrawledAt)}</td>
                          <td>
                            <StatusBadge type="crawling" value={company.status} />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      ) : null}
    </section>
  )
}

export default AdminCrawlingPage
