import type { NotificationItem } from '../types/notification'
import { formatDateTimeLabel } from '../../shared/utils/dateFormat'

type NotificationListItemProps = {
  notification: NotificationItem
  onClick?: (notification: NotificationItem) => void
}

const TYPE_LABEL_MAP = {
  job_match: '맞춤 공고',
  growth_report: '성장 리포트',
} as const

function NotificationListItem({ notification, onClick }: NotificationListItemProps) {
  return (
    <button
      type="button"
      className={`notification-item ${notification.isRead ? '' : 'is-unread'}`.trim()}
      onClick={() => onClick?.(notification)}
    >
      <div className="notification-item-head">
        <span className={`notification-type-badge is-${notification.type}`}>{TYPE_LABEL_MAP[notification.type]}</span>
        {!notification.isRead ? <span className="notification-unread-dot" aria-label="읽지 않음" /> : null}
      </div>
      <strong>{notification.title}</strong>
      <p>{notification.message}</p>
      <time dateTime={notification.createdAt}>{formatDateTimeLabel(notification.createdAt)}</time>
    </button>
  )
}

export default NotificationListItem
