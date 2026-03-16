import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProfileTopNav from '../../profile/components/ProfileTopNav'
import { useNotifications } from '../hooks/useNotifications'
import type { NotificationFilter, NotificationItem } from '../types/notification'
import NotificationListItem from '../components/NotificationListItem'
import '../styles/notifications.css'

const FILTER_OPTIONS: Array<{ value: NotificationFilter; label: string }> = [
  { value: 'all', label: '전체' },
  { value: 'job_match', label: '맞춤 공고' },
  { value: 'growth_report', label: '성장 리포트' },
]

function NotificationsPage() {
  const navigate = useNavigate()
  const [selectedFilter, setSelectedFilter] = useState<NotificationFilter>('all')
  const { notifications, unreadCount, isLoading, isError, isUpdating, markAsRead, markAllAsRead } = useNotifications()

  const filteredNotifications = useMemo(
    () => notifications.filter((notification) => selectedFilter === 'all' || notification.type === selectedFilter),
    [notifications, selectedFilter],
  )

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      await markAsRead(notification.id)
    }

    if (notification.relatedPath) {
      navigate(notification.relatedPath)
    }
  }

  return (
    <main className="profile-layout-shell">
      <ProfileTopNav />

      <section className="profile-layout-content">
        <div className="profile-page profile-fade-in">
          <section className="profile-card">
            <header className="notification-page-header">
              <div>
                <h1>전체 알림</h1>
                <p>맞춤 공고와 성장 리포트 알림을 한곳에서 관리하세요.</p>
              </div>
              <div className="notification-page-actions">
                <span className="notification-summary-pill">읽지 않음 {unreadCount}</span>
                <button type="button" className="profile-action-btn" disabled={isUpdating || unreadCount === 0} onClick={() => void markAllAsRead()}>
                  모두 읽음 처리
                </button>
              </div>
            </header>

            <div className="notification-filter-row" role="tablist" aria-label="알림 필터">
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`notification-filter-button ${selectedFilter === option.value ? 'is-active' : ''}`.trim()}
                  onClick={() => setSelectedFilter(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <section className="notification-list-shell">
              {isLoading ? <p className="notification-status">알림을 불러오는 중입니다...</p> : null}
              {!isLoading && isError ? <p className="notification-status">알림을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p> : null}
              {!isLoading && !isError && filteredNotifications.length === 0 ? <p className="notification-status">선택한 조건의 알림이 없습니다.</p> : null}
              {!isLoading && !isError && filteredNotifications.map((notification) => (
                <NotificationListItem key={notification.id} notification={notification} onClick={(item) => void handleNotificationClick(item)} />
              ))}
            </section>
          </section>
        </div>
      </section>
    </main>
  )
}

export default NotificationsPage
