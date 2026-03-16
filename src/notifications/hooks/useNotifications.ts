import { useEffect, useMemo, useState } from 'react'
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '../services/notificationService'
import type { NotificationItem } from '../types/notification'
import { RODDY_DATA_CHANGE_EVENT } from '../../shared/utils/localStorageSync'

const NOTIFICATIONS_STORAGE_KEY = 'roddy.notifications.v1'

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const loadNotifications = async () => {
    setIsLoading(true)
    setIsError(false)

    try {
      const response = await getNotifications()
      setNotifications(response)
    } catch {
      setNotifications([])
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadNotifications()

    const syncState = () => {
      void loadNotifications()
    }

    const handleDataChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ key: string }>
      if (customEvent.detail?.key === NOTIFICATIONS_STORAGE_KEY) {
        syncState()
      }
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== NOTIFICATIONS_STORAGE_KEY) {
        return
      }

      syncState()
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener(RODDY_DATA_CHANGE_EVENT, handleDataChange)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener(RODDY_DATA_CHANGE_EVENT, handleDataChange)
    }
  }, [])

  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.isRead).length, [notifications])

  const handleMarkAsRead = async (notificationId: string) => {
    setIsUpdating(true)

    try {
      const response = await markNotificationAsRead(notificationId)
      setNotifications(response)
      setIsError(false)
    } catch (error) {
      console.error('Failed to mark notification as read', error)
      setIsError(true)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleMarkAllAsRead = async () => {
    setIsUpdating(true)

    try {
      const response = await markAllNotificationsAsRead()
      setNotifications(response)
      setIsError(false)
    } catch (error) {
      console.error('Failed to mark all notifications as read', error)
      setIsError(true)
    } finally {
      setIsUpdating(false)
    }
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    isError,
    isUpdating,
    reload: loadNotifications,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
  }
}
