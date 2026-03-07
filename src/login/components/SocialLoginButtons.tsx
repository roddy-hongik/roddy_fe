import { useLocation, useNavigate } from 'react-router-dom'

type LoginLocationState = {
  from?: {
    pathname?: string
  }
}

function SocialLoginButtons() {
  const navigate = useNavigate()
  const location = useLocation()

  const redirectPath = (location.state as LoginLocationState | null)?.from?.pathname ?? '/'

  const handleLoginClick = () => {
    localStorage.setItem('accessToken', 'mock-access-token')
    localStorage.setItem('userName', '신애')
    navigate(redirectPath, { replace: true })
  }

  return (
    <div className="social-wrap">
      <button className="social-btn kakao" type="button" onClick={handleLoginClick}>
        <span className="social-icon">K</span>
        카카오로 로그인
      </button>
      <button className="social-btn google" type="button" onClick={handleLoginClick}>
        <span className="social-icon">G</span>
        구글로 로그인
      </button>
    </div>
  )
}

export default SocialLoginButtons
