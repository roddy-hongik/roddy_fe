import type { SocialProvider } from '../../api/types/auth'

/**
 * 구글·카카오 로그인 창으로 보냈다가 돌아온 뒤, 백엔드에 넘길 제공자 액세스 토큰을 꺼낸다.
 *
 * 두 제공자 모두 페이지 이동 방식이다. 돌아오는 주소는 `/oauth/{provider}/callback` 이고,
 * 각 개발자 콘솔에 `{origin}/oauth/{provider}/callback` 을 등록해 둬야 한다.
 * - 구글: implicit 방식(response_type=token)이라 액세스 토큰이 주소의 # 뒤로 바로 온다.
 * - 카카오: 인가 코드가 오고, 브라우저에서 토큰으로 바꾼다. 앱의 Client Secret 은 꺼 둬야 한다.
 */

const GOOGLE_AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const KAKAO_AUTHORIZE_URL = 'https://kauth.kakao.com/oauth/authorize'
const KAKAO_TOKEN_URL = 'https://kauth.kakao.com/oauth/token'
// 백엔드가 구글 userinfo 에서 이메일과 이름을 읽는다.
const GOOGLE_SCOPE = 'openid email profile'

const PENDING_LOGIN_KEY = 'pendingSocialLogin'

type PendingLogin = {
  provider: SocialProvider
  state: string
  returnPath: string
}

export class SocialLoginError extends Error {}

const readEnv = (value: string | undefined) => value?.trim() ?? ''

const clientIdOf = (provider: SocialProvider) =>
  provider === 'google'
    ? readEnv(import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)
    : readEnv(import.meta.env.VITE_KAKAO_REST_API_KEY as string | undefined)

const providerLabel = (provider: SocialProvider) => (provider === 'google' ? '구글' : '카카오')

export const isSocialProvider = (value: string | undefined): value is SocialProvider =>
  value === 'google' || value === 'kakao'

export const callbackPathOf = (provider: SocialProvider) => `/oauth/${provider}/callback`

const redirectUriOf = (provider: SocialProvider) => `${window.location.origin}${callbackPathOf(provider)}`

/** 외부 주소나 `//host` 로 빠져나가지 않도록 앱 안의 경로만 받는다. */
export const toSafeReturnPath = (value: string | null | undefined) => {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return null
  }
  return value
}

const createState = () => {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/** 제공자 로그인 창으로 이동한다. 돌아와서 확인할 state 와 원래 가려던 경로를 남겨 둔다. */
export function startSocialLogin(provider: SocialProvider, returnPath: string) {
  const clientId = clientIdOf(provider)
  if (!clientId) {
    const envName = provider === 'google' ? 'VITE_GOOGLE_CLIENT_ID' : 'VITE_KAKAO_REST_API_KEY'
    throw new SocialLoginError(`${providerLabel(provider)} 로그인 설정(${envName})이 없습니다.`)
  }

  const state = createState()
  const pending: PendingLogin = { provider, state, returnPath }
  sessionStorage.setItem(PENDING_LOGIN_KEY, JSON.stringify(pending))

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUriOf(provider),
    state,
  })

  if (provider === 'google') {
    params.set('response_type', 'token')
    params.set('scope', GOOGLE_SCOPE)
    params.set('include_granted_scopes', 'true')
    params.set('prompt', 'select_account')
    window.location.assign(`${GOOGLE_AUTHORIZE_URL}?${params.toString()}`)
    return
  }

  params.set('response_type', 'code')
  window.location.assign(`${KAKAO_AUTHORIZE_URL}?${params.toString()}`)
}

const takePendingLogin = (): PendingLogin | null => {
  const raw = sessionStorage.getItem(PENDING_LOGIN_KEY)
  sessionStorage.removeItem(PENDING_LOGIN_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<PendingLogin>
    if (!isSocialProvider(parsed.provider) || typeof parsed.state !== 'string') {
      return null
    }
    return {
      provider: parsed.provider,
      state: parsed.state,
      returnPath: toSafeReturnPath(parsed.returnPath) ?? '/',
    }
  } catch {
    return null
  }
}

async function exchangeKakaoCode(code: string): Promise<string> {
  const response = await fetch(KAKAO_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientIdOf('kakao'),
      redirect_uri: redirectUriOf('kakao'),
      code,
    }),
  }).catch(() => null)

  const payload = (await response?.json().catch(() => null)) as
    | { access_token?: string; error_description?: string }
    | null

  if (!response?.ok || !payload?.access_token) {
    throw new SocialLoginError(
      payload?.error_description ? `카카오 토큰 발급에 실패했습니다. (${payload.error_description})` : '카카오 토큰 발급에 실패했습니다.',
    )
  }
  return payload.access_token
}

/**
 * 콜백 주소에서 제공자 액세스 토큰을 꺼낸다.
 * 시작할 때 남긴 state 와 다르면(다른 탭에서 시작했거나 위조된 요청) 진행하지 않는다.
 */
export async function completeSocialLogin(
  provider: SocialProvider,
  location: { search: string; hash: string },
): Promise<{ providerAccessToken: string; returnPath: string }> {
  const pending = takePendingLogin()
  const label = providerLabel(provider)
  // 구글은 결과를 # 뒤로, 카카오는 ? 뒤로 돌려준다.
  const params = new URLSearchParams(provider === 'google' ? location.hash.replace(/^#/, '') : location.search)

  const error = params.get('error')
  if (error) {
    const cancelled = error === 'access_denied'
    throw new SocialLoginError(cancelled ? `${label} 로그인을 취소했습니다.` : `${label} 로그인에 실패했습니다. (${error})`)
  }

  if (!pending || pending.provider !== provider || pending.state !== params.get('state')) {
    throw new SocialLoginError('로그인 요청을 확인할 수 없습니다. 처음부터 다시 시도해 주세요.')
  }

  if (provider === 'google') {
    const accessToken = params.get('access_token')
    if (!accessToken) throw new SocialLoginError('구글 액세스 토큰을 받지 못했습니다.')
    return { providerAccessToken: accessToken, returnPath: pending.returnPath }
  }

  const code = params.get('code')
  if (!code) throw new SocialLoginError('카카오 인가 코드를 받지 못했습니다.')
  return { providerAccessToken: await exchangeKakaoCode(code), returnPath: pending.returnPath }
}
