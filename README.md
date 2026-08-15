# Roddy Frontend API Mapping

## Summary

프론트는 백엔드 실제 스펙 기준으로 `ApiResponse.result` 언랩, `/api/...` 경로 정리, 온보딩/마이페이지/스터디/커뮤니티 연동 구조를 우선 맞췄습니다.

아직 백엔드가 없는 도메인(`dashboard`, `reports`, `jobs`, `roadmap`, `notifications`, `mockInterview`, `admin`)은 의도적인 mock 서비스로 분리되어 있습니다.

## Integrated APIs

| 화면/도메인 | 프론트 엔드포인트 | 상태 | 비고 |
| --- | --- | --- | --- |
| 로그인 진입 | `mock fallback` | 프론트 임시 처리 | 소셜 로그인 API 부재로 `isOnboard`, `githubConnected` 기준 라우팅만 준비 |
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

- 소셜 로그인 API
- 프로필 재분석 API
- 스터디 지원자 승인/거절 API
- 커뮤니티 대댓글 API
- 커뮤니티 댓글 삭제 API
- 커뮤니티 댓글 신고 API
- Dashboard / Reports / Jobs / Roadmap / Notifications / Mock Interview / Admin 실 API
