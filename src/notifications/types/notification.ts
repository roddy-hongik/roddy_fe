export type NotificationType = 'job_match' | 'growth_report'
export type NotificationFilter = 'all' | NotificationType

export interface NotificationItem {
  id: string
  type: NotificationType
  title: string
  message: string
  createdAt: string
  isRead: boolean
  relatedJobId?: string
  relatedPath?: string
}
