import { formatDateLabel } from '../../shared/utils/dateFormat'

const NOT_PROVIDED = '정보 없음'

/** 마감일이 비어 있으면 상시 채용이다. 값은 있는데 날짜로 못 읽으면 상시로 속이지 않는다. */
export function formatDeadline(deadline: string | null) {
  if (!deadline || !deadline.trim()) {
    return '상시'
  }

  return formatDateLabel(deadline) || NOT_PROVIDED
}

export function formatPostedAt(postedAt: string | null) {
  return formatDateLabel(postedAt ?? '')
}

/** 채용 사이트가 주지 않은 값은 비워 두는 대신 그렇다고 알린다. */
export function orNotProvided(value: string | null) {
  return value && value.trim() ? value : NOT_PROVIDED
}

/** 목록 카드에 한 줄로 붙이는 보조 정보. 값이 없는 항목은 뺀다. */
export function joinMeta(...values: Array<string | null>) {
  const filled = values.filter((value): value is string => Boolean(value && value.trim()))
  return filled.length > 0 ? filled.join(' · ') : NOT_PROVIDED
}

/** 매칭률 자리에 넣을 문구. null 은 0% 가 아니라 "아직 낼 수 없음"이라 숫자를 지어내지 않는다. */
export function formatMatchLabel(matchRate: number | null, isLoggedIn: boolean) {
  if (matchRate !== null) {
    return `매칭률 ${matchRate}%`
  }

  return isLoggedIn ? '매칭률 계산 전' : '로그인 후 매칭률 확인'
}
