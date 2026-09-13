/**
 * 백엔드가 코드로 보내는 직무·경력 값을 화면에 보일 이름으로 바꾼다.
 * 백엔드 enum(DesiredJob, ExperienceLevel)과 같은 목록을 유지한다.
 */
const DESIRED_JOB_LABELS: Record<string, string> = {
  BACKEND: '백엔드 개발자',
  FRONTEND: '프론트엔드 개발자',
  FULLSTACK: '풀스택 개발자',
  IOS: 'iOS 개발자',
  ANDROID: '안드로이드 개발자',
  AI_ML: 'AI/ML 엔지니어',
  DATA_ENGINEER: '데이터 엔지니어',
  DEVOPS: 'DevOps 엔지니어',
  SECURITY: '보안 엔지니어',
  GAME: '게임 개발자',
}

const EXPERIENCE_LEVEL_LABELS: Record<string, string> = {
  NEWBIE: '신입',
  JUNIOR: '1~3년차',
  MIDDLE: '4~7년차',
  SENIOR: '8년차 이상',
}

/** 모르는 코드나 이미 이름으로 온 값은 받은 그대로 보여 준다. */
export const toDesiredJobLabel = (code: string | null | undefined) => (code ? (DESIRED_JOB_LABELS[code] ?? code) : '')

export const toExperienceLevelLabel = (code: string | null | undefined) =>
  code ? (EXPERIENCE_LEVEL_LABELS[code] ?? code) : ''
