export const AUTH_CHANGE_EVENT = 'auth-change'

export const emitAuthChange = () => {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
}
