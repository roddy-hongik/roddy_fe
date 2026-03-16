import { useEffect, useMemo, useRef, useState } from 'react'
import { getCurrentAccountStorageId } from '../../auth/utils/accountStorage'
import { AUTH_CHANGE_EVENT } from '../../auth/utils/authEvents'
import { getNotifications, getNotificationsStorageKey, markAllNotificationsAsRead, markNotificationAsRead, NOTIFICATIONS_STORAGE_KEY } from '../services/notificationService'
import type { NotificationItem } from '../types/notification'
import { RODDY_DATA_CHANGE_EVENT } from '../../shared/utils/localStorageSync'

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [accountStorageId, setAccountStorageId] = useState(() => getCurrentAccountStorageId())
  const senderIdRef = useRef(`notifications-hook-${Math.random().toString(36).slice(2)}`)

  const loadNotifications = async () => {
    setIsLoading(true)
    setIsError(false)

    try {
      const response = await getNotifications()
      setNotifications(response)
    } catch (error) {
      console.error('Failed to load notifications', error)
      setNotifications([])
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setNotifications([])
    void loadNotifications()

    const syncState = () => {
      void loadNotifications()
    }

    const handleDataChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ key: string; senderId?: string }>
      if (customEvent.detail?.key === NOTIFICATIONS_STORAGE_KEY) {
        if (customEvent.detail.senderId === senderIdRef.current) {
          return
        }

        syncState()
      }
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== getNotificationsStorageKey()) {
        return
      }

      syncState()
    }

    const syncAccountStorageId = () => {
      setAccountStorageId(getCurrentAccountStorageId())
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener(RODDY_DATA_CHANGE_EVENT, handleDataChange)
    window.addEventListener('storage', syncAccountStorageId)
    window.addEventListener(AUTH_CHANGE_EVENT, syncAccountStorageId)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener(RODDY_DATA_CHANGE_EVENT, handleDataChange)
      window.removeEventListener('storage', syncAccountStorageId)
      window.removeEventListener(AUTH_CHANGE_EVENT, syncAccountStorageId)
    }
  }, [accountStorageId])

  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.isRead).length, [notifications])

  const handleMarkAsRead = async (notificationId: string) => {
    setIsUpdating(true)

    try {
      const response = await markNotificationAsRead(notificationId, senderIdRef.current)
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
      const response = await markAllNotificationsAsRead(senderIdRef.current)
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
