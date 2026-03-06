function SocialLoginButtons() {
  return (
    <div className="social-wrap">
      <button className="social-btn kakao" type="button">
        <span className="social-icon">K</span>
        카카오로 로그인
      </button>
      <button className="social-btn google" type="button">
        <span className="social-icon">G</span>
        구글로 로그인
      </button>
    </div>
  )
}

export default SocialLoginButtons
