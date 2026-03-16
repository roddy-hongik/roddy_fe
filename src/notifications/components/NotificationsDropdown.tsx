import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../routes/paths'
import { useNotifications } from '../hooks/useNotifications'
import type { NotificationItem } from '../types/notification'
import NotificationListItem from './NotificationListItem'
import '../styles/notifications.css'

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 10a6 6 0 1 1 12 0v4l1.5 2.5h-15L6 14v-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function NotificationsDropdown() {
  const navigate = useNavigate()
  const panelRef = useRef<HTMLDivElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, unreadCount, isLoading, isError, isUpdating, markAsRead, markAllAsRead } = useNotifications()
  const recentNotifications = notifications.slice(0, 3)

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    window.addEventListener('mousedown', handlePointerDown)

    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
    }
  }, [isOpen])

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      await markAsRead(notification.id)
    }

    setIsOpen(false)

    if (notification.relatedPath) {
      navigate(notification.relatedPath)
      return
    }

    navigate(ROUTES.notifications)
  }

  return (
    <div ref={panelRef} className="notification-dropdown">
      <button
        type="button"
        className={`notification-bell-button ${isOpen ? 'is-open' : ''}`.trim()}
        aria-label="알림 열기"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <BellIcon />
        {unreadCount > 0 ? <span className="notification-bell-badge">{unreadCount}</span> : null}
      </button>

      {isOpen ? (
        <section className="notification-panel" aria-label="알림 목록">
          <header className="notification-panel-head">
            <div>
              <strong>알림</strong>
              <p>최근 맞춤 공고와 성장 리포트를 확인하세요.</p>
            </div>
            <button type="button" className="notification-text-button" disabled={isUpdating || unreadCount === 0} onClick={() => void markAllAsRead()}>
              모두 읽음
            </button>
          </header>

          <div className="notification-panel-body">
            {isLoading ? <p className="notification-status">알림을 불러오는 중입니다...</p> : null}
            {!isLoading && isError ? <p className="notification-status">알림을 불러오지 못했습니다.</p> : null}
            {!isLoading && !isError && notifications.length === 0 ? <p className="notification-status">새 알림이 없습니다.</p> : null}
            {!isLoading && !isError && recentNotifications.map((notification) => (
              <NotificationListItem key={notification.id} notification={notification} onClick={(item) => void handleNotificationClick(item)} />
            ))}
          </div>

          <button type="button" className="notification-link-button" onClick={() => navigate(ROUTES.notifications)}>
            전체 알림 보기
          </button>
        </section>
      ) : null}
    </div>
  )
}

export default NotificationsDropdown
