import { mockNotifications } from '../data/mockNotifications'
import type { NotificationItem } from '../types/notification'
import { getCurrentAccountStorageId } from '../../auth/utils/accountStorage'
import { cloneValue, emitRoddyDataChange, parseStoredJson } from '../../shared/utils/localStorageSync'

// Intentional mock domain: notifications backend API is not implemented yet.

const NOTIFICATIONS_STORAGE_KEY = 'roddy.notifications.v1'

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })

const getNotificationsStorageKey = () => `${NOTIFICATIONS_STORAGE_KEY}:${getCurrentAccountStorageId()}`

function readStoredNotifications() {
  return parseStoredJson<NotificationItem[]>(localStorage.getItem(getNotificationsStorageKey()), cloneValue(mockNotifications))
}

function writeStoredNotifications(notifications: NotificationItem[], senderId?: string) {
  localStorage.setItem(getNotificationsStorageKey(), JSON.stringify(notifications))
  emitRoddyDataChange(NOTIFICATIONS_STORAGE_KEY, senderId)
}

function ensureSeedData() {
  if (!localStorage.getItem(getNotificationsStorageKey())) {
    writeStoredNotifications(cloneValue(mockNotifications))
  }
}

export async function getNotifications(): Promise<NotificationItem[]> {
  ensureSeedData()
  await wait(120)
  return readStoredNotifications().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
}

export async function markNotificationAsRead(notificationId: string, senderId?: string): Promise<NotificationItem[]> {
  ensureSeedData()
  await wait(80)

  const notifications = readStoredNotifications().map((notification) =>
    notification.id === notificationId ? { ...notification, isRead: true } : notification,
  )

  writeStoredNotifications(notifications, senderId)
  return notifications
}

export async function markAllNotificationsAsRead(senderId?: string): Promise<NotificationItem[]> {
  ensureSeedData()
  await wait(100)

  const notifications = readStoredNotifications().map((notification) => ({
    ...notification,
    isRead: true,
  }))

  writeStoredNotifications(notifications, senderId)
  return notifications
}

export { NOTIFICATIONS_STORAGE_KEY, getNotificationsStorageKey }
