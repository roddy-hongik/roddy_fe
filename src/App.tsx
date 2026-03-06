import './App.css'

function App() {
  return (
    <main className="auth-layout">
      <section className="brand-panel">
        <p className="brand-pill">Developer Compass</p>
        <h1>
          개발자들의 길잡이,
          <br />
          Roddy
        </h1>
        <p className="brand-copy">
          막막한 시작부터 성장의 과정까지.
          <br />
          Roddy와 함께 매일 더 나은 개발 습관을 만들어보세요.
        </p>

        <div className="mascot" aria-hidden="true">
          <div className="mascot-ear left" />
          <div className="mascot-ear right" />
          <div className="mascot-face">
            <span className="eye" />
            <span className="eye" />
            <span className="mouth" />
          </div>
          <div className="mascot-body" />
        </div>
      </section>

      <section className="form-panel">
        <div className="form-card">
          <div className="auth-tabs" role="tablist" aria-label="인증 화면 선택">
            <button className="tab active" role="tab" aria-selected="true">
              로그인
            </button>
            <button className="tab" role="tab" aria-selected="false">
              회원가입
            </button>
          </div>

          <h2>환영합니다</h2>
          <p className="form-description">계정을 선택해 Roddy를 시작해보세요.</p>

          <div className="field-group">
            <label htmlFor="email">이메일</label>
            <input id="email" type="email" placeholder="you@example.com" />
          </div>

          <div className="field-group">
            <label htmlFor="password">비밀번호</label>
            <input id="password" type="password" placeholder="••••••••" />
          </div>

          <button className="submit-btn" type="button">
            계속하기
          </button>

          <div className="divider" aria-hidden="true">
            <span />
            <p>또는 소셜 로그인</p>
            <span />
          </div>

          <div className="social-wrap">
            <button className="social-btn kakao" type="button">
              <span className="social-icon">K</span>
              카카오로 계속하기
            </button>
            <button className="social-btn google" type="button">
              <span className="social-icon">G</span>
              구글로 계속하기
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
