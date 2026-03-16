import { mockNotifications } from '../data/mockNotifications'
import type { NotificationItem } from '../types/notification'
import { cloneValue, emitRoddyDataChange, parseStoredJson } from '../../shared/utils/localStorageSync'

const NOTIFICATIONS_STORAGE_KEY = 'roddy.notifications.v1'

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })

function readStoredNotifications() {
  return parseStoredJson<NotificationItem[]>(localStorage.getItem(NOTIFICATIONS_STORAGE_KEY), cloneValue(mockNotifications))
}

function writeStoredNotifications(notifications: NotificationItem[]) {
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications))
  emitRoddyDataChange(NOTIFICATIONS_STORAGE_KEY)
}

function ensureSeedData() {
  if (!localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)) {
    writeStoredNotifications(cloneValue(mockNotifications))
  }
}

export async function getNotifications(): Promise<NotificationItem[]> {
  ensureSeedData()
  await wait(120)
  return readStoredNotifications().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
}

export async function markNotificationAsRead(notificationId: string): Promise<NotificationItem[]> {
  ensureSeedData()
  await wait(80)

  const notifications = readStoredNotifications().map((notification) =>
    notification.id === notificationId ? { ...notification, isRead: true } : notification,
  )

  writeStoredNotifications(notifications)
  return notifications
}

export async function markAllNotificationsAsRead(): Promise<NotificationItem[]> {
  ensureSeedData()
  await wait(100)

  const notifications = readStoredNotifications().map((notification) => ({
    ...notification,
    isRead: true,
  }))

  writeStoredNotifications(notifications)
  return notifications
}
