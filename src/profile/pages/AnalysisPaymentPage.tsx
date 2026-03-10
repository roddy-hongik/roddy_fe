import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../routes/paths'
import ProfileTopNav from '../components/ProfileTopNav'

function AnalysisPaymentPage() {
  const navigate = useNavigate()

  return (
    <main className="profile-layout-shell">
      <ProfileTopNav />
      <section className="profile-layout-content profile-page profile-fade-in">
        <section className="profile-card">
          <header className="profile-card-header">
            <h1>리포트 재분석 결제</h1>
            <p>실제 결제 연동 전까지 사용할 placeholder 페이지입니다.</p>
          </header>

          <section className="report-payment-card glass-style">
            <div>
              <p className="report-summary-label">프리미엄 재분석</p>
              <strong className="report-payment-price">₩19,000</strong>
              <p className="profile-meta-text">최신 이력서와 GitHub 기준으로 다시 분석하고 새 상세 리포트를 생성합니다.</p>
            </div>

            <div className="profile-form-actions report-payment-actions">
              <button type="button" className="profile-ghost-btn" onClick={() => navigate(ROUTES.reportsDetailAnalysis)}>
                상세 분석으로 돌아가기
              </button>
              <button type="button" className="profile-action-btn" onClick={() => navigate(ROUTES.profileReanalyze)}>
                결제 후 분석 진행
              </button>
            </div>
          </section>
        </section>
      </section>
    </main>
  )
}

export default AnalysisPaymentPage
