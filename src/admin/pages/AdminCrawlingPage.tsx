import { useEffect, useMemo, useState } from 'react'
import StatusBadge from '../components/StatusBadge'
import { getCrawlingDashboard, refreshCrawlingDashboard } from '../../api/services/adminService'
import type { CrawlingDashboard } from '../../api/types/admin'
import { formatDateTime } from '../utils/adminFormat'

function AdminCrawlingPage() {
  const [dashboard, setDashboard] = useState<CrawlingDashboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isError, setIsError] = useState(false)

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

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const response = await refreshCrawlingDashboard()
      setDashboard(response)
      setIsError(false)
    } catch {
      setIsError(true)
    } finally {
      setIsRefreshing(false)
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

  return (
    <section className="admin-content-panel">
      <header className="admin-section-header">
        <div>
          <h3>크롤링 모니터링 대시보드</h3>
          <p>외부 채용 플랫폼 수집 상태를 실시간으로 확인합니다.</p>
        </div>
        <button type="button" className="admin-btn primary" onClick={handleRefresh} disabled={isRefreshing || isLoading}>
          {isRefreshing ? '새로고침 중...' : '수동 새로고침'}
        </button>
      </header>

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

          {dashboard.platforms.length === 0 ? (
            <p className="admin-meta">오늘 수집된 플랫폼 데이터가 없습니다.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>플랫폼명</th>
                    <th>오늘 수집 건수</th>
                    <th>성공 건수</th>
                    <th>실패 건수</th>
                    <th>성공률</th>
                    <th>마지막 수집 시각</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.platforms.map((platform) => {
                    const ratio = platform.collectedToday === 0 ? 0 : Math.round((platform.successCount / platform.collectedToday) * 100)

                    return (
                      <tr key={platform.id}>
                        <td>{platform.name}</td>
                        <td>{platform.collectedToday.toLocaleString()}</td>
                        <td>{platform.successCount.toLocaleString()}</td>
                        <td>{platform.failCount.toLocaleString()}</td>
                        <td>
                          <div className="admin-progress-cell">
                            <div className="admin-progress-track" aria-hidden="true">
                              <span style={{ width: `${ratio}%` }} />
                            </div>
                            <span>{ratio}%</span>
                          </div>
                        </td>
                        <td>{formatDateTime(platform.lastCrawledAt)}</td>
                        <td>
                          <StatusBadge type="crawling" value={platform.status} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </section>
  )
}

export default AdminCrawlingPage
