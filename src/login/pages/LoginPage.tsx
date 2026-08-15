import BrandSection from '../components/BrandSection'
import SocialLoginButtons from '../components/SocialLoginButtons'
import '../styles/login-page.css'

function LoginPage() {
  return (
    <main className="login-page">
      <section className="login-card">
        <BrandSection />
        <SocialLoginButtons />
      </section>
    </main>
  )
}

export default LoginPage
