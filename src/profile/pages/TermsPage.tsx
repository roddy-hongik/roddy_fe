import { useNavigate } from 'react-router-dom'
import '../styles/profile-pages.css'

function TermsPage() {
  const navigate = useNavigate()

  return (
    <main className="profile-layout-shell terms-shell">
      <section className="profile-card profile-fade-in terms-card">
        <h1>이용 약관</h1>
        <p>Roddy 서비스 이용 시 회원은 정확한 정보를 입력하고, 분석 결과를 커리어 의사결정 보조 목적으로 활용해야 합니다.</p>
        <p>서비스는 지속 개선되며, 데이터 보안과 개인정보 보호 정책은 별도 고지에 따릅니다.</p>
        <button type="button" className="profile-action-btn" onClick={() => navigate(-1)}>
          이전 화면으로
        </button>
      </section>
    </main>
  )
}

export default TermsPage
