import type { AdminUserStatus, CrawlingPlatformStatus, ReportedContentStatus } from '../../api/types/admin'
import { crawlingStatusLabelMap, userStatusLabelMap } from '../utils/adminFormat'

type StatusBadgeProps = {
  type: 'crawling' | 'user' | 'content'
  value: CrawlingPlatformStatus | AdminUserStatus | ReportedContentStatus
}

function StatusBadge({ type, value }: StatusBadgeProps) {
  const toneClass = `is-${String(value)}`

  if (type === 'crawling') {
    const label = crawlingStatusLabelMap[value as CrawlingPlatformStatus]
    return <span className={`admin-status-badge ${toneClass}`}>{label}</span>
  }

  if (type === 'user') {
    const label = userStatusLabelMap[value as AdminUserStatus]
    return <span className={`admin-status-badge ${toneClass}`}>{label}</span>
  }

  return <span className={`admin-status-badge ${toneClass}`}>{value === 'reported' ? '신고됨' : '삭제됨'}</span>
}

export default StatusBadge
