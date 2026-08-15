import { Outlet } from 'react-router-dom'
import '../styles/profile-pages.css'

function ProfileLayout() {
  return (
    <main className="profile-layout-shell">
      <section className="profile-layout-content">
        <Outlet />
      </section>
    </main>
  )
}

export default ProfileLayout
