import { Outlet } from 'react-router-dom'
import ProfileTopNav from './ProfileTopNav'
import '../styles/profile-pages.css'

function ProfileLayout() {
  return (
    <main className="profile-layout-shell">
      <ProfileTopNav />

      <section className="profile-layout-content">
        <Outlet />
      </section>
    </main>
  )
}

export default ProfileLayout
