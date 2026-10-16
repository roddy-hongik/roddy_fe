import { useEffect, useMemo, useRef, useState } from 'react'
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '../services/notificationService'
import type { NotificationItem } from '../types/notification'

const NOTIFICATIONS_CHANGE_EVENT = 'roddy:notifications-change'

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
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
    void loadNotifications()

    const handleNotificationsChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ senderId: string }>
      if (customEvent.detail?.senderId !== senderIdRef.current) {
        void loadNotifications()
      }
    }

    window.addEventListener(NOTIFICATIONS_CHANGE_EVENT, handleNotificationsChange)
    return () => window.removeEventListener(NOTIFICATIONS_CHANGE_EVENT, handleNotificationsChange)
  }, [])

  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.isRead).length, [notifications])

  const handleMarkAsRead = async (notificationId: string) => {
    setIsUpdating(true)

    try {
      const response = await markNotificationAsRead(notificationId)
      setNotifications(response)
      setIsError(false)
      window.dispatchEvent(new CustomEvent(NOTIFICATIONS_CHANGE_EVENT, {
        detail: { senderId: senderIdRef.current },
      }))
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
      window.dispatchEvent(new CustomEvent(NOTIFICATIONS_CHANGE_EVENT, {
        detail: { senderId: senderIdRef.current },
      }))
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
