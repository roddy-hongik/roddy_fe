import { Outlet } from 'react-router-dom'
import AppTopNav from '../../shared/components/AppTopNav'
import '../styles/profile-pages.css'

function ProfileLayout() {
  return (
    <main className="profile-layout-shell">
      <AppTopNav showSavedLink />

      <section className="profile-layout-content">
        <Outlet />
      </section>
    </main>
  )
}

export default ProfileLayout
