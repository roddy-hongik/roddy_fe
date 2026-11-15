# Roddy Frontend API Mapping

<img width="1672" height="941" alt="Roddy배너" src="https://github.com/user-attachments/assets/326d0b87-6d79-4e5e-b45c-7d8ec2af4772" />

## Summary

프론트는 백엔드 실제 스펙 기준으로 `ApiResponse.result` 언랩, `/api/...` 경로 정리, 온보딩/마이페이지/스터디/커뮤니티 연동 구조를 우선 맞췄습니다.

아직 백엔드가 없는 도메인(`dashboard`, `reports`, `jobs`, `roadmap`, `notifications`, `mockInterview`, `admin`)은 의도적인 mock 서비스로 분리되어 있습니다.

## 환경변수와 소셜 로그인 설정

`.env.local` 에 넣는다. git 에 올라가지 않는다.

| 이름 | 설명 |
| --- | --- |
| `VITE_API_BASE_URL` | 백엔드 주소. 로컬은 `http://localhost:8080` |
| `VITE_GOOGLE_CLIENT_ID` | 구글 OAuth 웹 클라이언트 ID |
| `VITE_KAKAO_REST_API_KEY` | 카카오 앱의 REST API 키 |

로그인은 제공자 창으로 이동했다가 `/oauth/{google|kakao}/callback` 으로 돌아오는 방식이다. 콘솔에 아래를 등록해야 한다.

- 구글 클라우드 콘솔 › OAuth 클라이언트(웹)
  - 승인된 JavaScript 원본: `http://localhost:5173`, `https://jobdri.site`
  - 승인된 리디렉션 URI: `http://localhost:5173/oauth/google/callback`, `https://jobdri.site/oauth/google/callback`
- 카카오 디벨로퍼스 › 내 애플리케이션
  - 카카오 로그인 활성화, Redirect URI: `http://localhost:5173/oauth/kakao/callback`, `https://jobdri.site/oauth/kakao/callback`
  - 플랫폼 › Web 사이트 도메인에 같은 origin 등록
  - 동의항목에서 카카오계정(이메일) 필수 동의. 백엔드가 이메일 없으면 가입을 거절한다
  - 보안 › Client Secret 은 사용하지 않음으로 둔다. 브라우저에서 토큰을 바꾸므로 비밀값을 둘 수 없다

## Integrated APIs

| 화면/도메인 | 프론트 엔드포인트 | 상태 | 비고 |
| --- | --- | --- | --- |
| 구글 로그인 | `POST /api/auth/google` | 실제 연동 | 구글 로그인 창에서 받은 액세스 토큰을 넘긴다 |
| 카카오 로그인 | `POST /api/auth/kakao` | 실제 연동 | 카카오 인가 코드를 토큰으로 바꿔 넘긴다 |
| 토큰 재발급 | `POST /api/auth/reissue` | 실제 연동 | 요청이 401 이면 한 번 재발급하고 다시 보낸다 |
| 로그아웃 | `POST /api/auth/logout` | 실제 연동 | 서버의 리프레시 토큰을 지운 뒤 로컬 세션을 정리 |
| 온보딩 저장 | `POST /api/onboarding` | 실제 연동 | presign 발급 후 업로드 완료 뒤 저장 |
| 포트폴리오 presign | `POST /api/onboarding/portfolio/presign` | 실제 연동 | PDF만 허용 |
| GitHub 상태 조회 | `GET /api/onboarding/github` | 실제 연동 | 콜백 후 상태 재조회 |
| GitHub 연동 시작 | `GET /api/onboarding/github/authorize` | 실제 연동 | 백엔드 OAuth URL 사용 |
| 마이페이지 조회 | `GET /api/mypage/profile` | 실제 연동 | `desiredCompany`, `experienceYears`, `githubConnected` 반영 |
| 마이페이지 수정 | `PATCH /api/mypage/profile` | 실제 연동 | 현재 이름/나이 중심 |
| 회원 탈퇴 | `DELETE /api/mypage/me` | 실제 연동 | 로컬 세션도 함께 정리 |
| 스터디 목록 | `GET /api/studies` | 실제 연동 | 목록/상세/작성/지원/지원취소/모집완료 반영 |
| 스터디 상세 | `GET /api/studies/:id` | 실제 연동 | 지원자 승인/거절은 미지원 |
| 스터디 작성 | `POST /api/studies` | 실제 연동 | `scheduledAt` ISO 전송 |
| 스터디 지원 | `POST /api/studies/:id/applications` | 실제 연동 | |
| 스터디 지원 취소 | `DELETE /api/studies/:id/applications/me` | 실제 연동 | |
| 스터디 모집 완료 | `PATCH /api/studies/:id/close` | 실제 연동 | |
| 커뮤니티 목록 | `GET /api/community/posts` | 실제 연동 | 백엔드 DTO를 프론트 뷰모델로 adapter 변환 |
| 커뮤니티 상세 | `GET /api/community/posts/:id` | 실제 연동 | |
| 커뮤니티 작성 | `POST /api/community/posts` | 실제 연동 | `multipart/form-data` 사용 |
| 커뮤니티 좋아요 | `POST /api/community/posts/:id/like` | 실제 연동 | |
| 커뮤니티 신고 | `POST /api/community/posts/:id/report` | 실제 연동 | 게시글 신고만 연결 |
| 커뮤니티 댓글 작성 | `POST /api/community/posts/:id/comments` | 실제 연동 | 대댓글 미지원 |

## Frontend-only Mock Domains

| 도메인 | 상태 | 설명 |
| --- | --- | --- |
| Dashboard | mock 고정 | 실제 API 호출 없이 mock 리포트/채용 데이터를 조합 |
| Reports | mock 고정 | 상세/목록 모두 mock 리포트 사용 |
| Jobs | mock 고정 | 매칭 점수와 스크랩 상태를 프론트 mock으로 유지 |
| Roadmap | mock 고정 | 분석/생성/저장 모두 로컬 mock 기반 |
| Notifications | mock 고정 | 계정별 localStorage mock |
| Mock Interview | mock 고정 | 질문 생성 mock |
| Admin | mock 고정 | 크롤링/유저/신고/그래프 전부 mock |

## Resolved in Frontend

- `httpClient`가 백엔드 `ApiResponse.result`를 공통 언랩합니다.
- 에러 응답을 `message`, `code`, `error` 우선으로 읽습니다.
- `VITE_API_BASE_URL`과 `/api/...` 경로 결합 시 중복 슬래시를 제거합니다.
- 온보딩은 `presign -> 업로드 -> 저장` 순서로 서비스 계층이 분리되었습니다.
- 커뮤니티 작성은 백엔드 multipart 스키마에 맞게 단순화되었습니다.

## Backend Still Needed

- 프로필 재분석 API
- 스터디 지원자 승인/거절 API
- 커뮤니티 대댓글 API
- 커뮤니티 댓글 삭제 API
- 커뮤니티 댓글 신고 API
- Dashboard / Reports / Jobs / Roadmap / Notifications / Mock Interview / Admin 실 API
