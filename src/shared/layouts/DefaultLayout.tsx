import { Outlet } from 'react-router-dom'
import NotificationsDropdown from '../../notifications/components/NotificationsDropdown'
import AppTopNav from '../components/AppTopNav'

type DefaultLayoutProps = {
  showSavedLink?: boolean
}

function DefaultLayout({ showSavedLink = false }: DefaultLayoutProps) {
  return (
    <>
      <AppTopNav showSavedLink={showSavedLink} notificationSlot={<NotificationsDropdown />} />
      <Outlet />
    </>
  )
}

export default DefaultLayout
