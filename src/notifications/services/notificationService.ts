import { httpClient } from '../../api/client/httpClient'
import { API_ENDPOINTS } from '../../api/constants/endpoints'
import type { NotificationItem } from '../types/notification'

const notificationReadPath = (notificationId: string) =>
  API_ENDPOINTS.notifications.read.replace(':id', encodeURIComponent(notificationId))

export const getNotifications = (): Promise<NotificationItem[]> =>
  httpClient<NotificationItem[]>(API_ENDPOINTS.notifications.list)

export const markNotificationAsRead = (notificationId: string): Promise<NotificationItem[]> =>
  httpClient<NotificationItem[]>(notificationReadPath(notificationId), {
    method: 'PATCH',
  })

export const markAllNotificationsAsRead = (): Promise<NotificationItem[]> =>
  httpClient<NotificationItem[]>(API_ENDPOINTS.notifications.readAll, {
    method: 'PATCH',
  })
