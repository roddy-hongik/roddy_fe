# Frontend Architecture Refactor Guide

## Current diagnosis

- The project already follows a feature-oriented structure, which is a good base for modularization.
- `src/api/services` and `src/<feature>/services` overlap in responsibility, so domain flow is harder to trace.
- API response types are partly stored in `src/api/types`, which makes features depend on the API layer for domain knowledge.
- CSS is grouped by feature, but styles are mostly page-level side-effect imports, so reuse boundaries are unclear.

## Recommended target structure

```text
src
├─ app
│  ├─ providers
│  │  └─ AppProviders.tsx
│  ├─ router
│  │  └─ AppRouter.tsx
│  └─ styles
├─ pages
│  ├─ admin
│  ├─ community
│  ├─ jobs
│  └─ profile
├─ widgets
│  ├─ navigation
│  ├─ notifications
│  └─ profile-layout
├─ features
│  ├─ auth
│  │  ├─ api
│  │  ├─ model
│  │  └─ ui
│  ├─ community-write
│  ├─ notification-center
│  ├─ roadmap-save
│  └─ job-scrap
├─ entities
│  ├─ user
│  │  ├─ api
│  │  ├─ model
│  │  └─ ui
│  ├─ community-post
│  ├─ roadmap
│  ├─ report
│  └─ job
├─ shared
│  ├─ api
│  │  ├─ client
│  │  ├─ config
│  │  └─ lib
│  ├─ config
│  ├─ lib
│  ├─ styles
│  ├─ types
│  └─ ui
└─ assets
```

## Layer roles

- `app`: application bootstrap, providers, router, app-wide policies.
- `pages`: route composition only. Pages assemble widgets and features but should not contain raw fetch logic.
- `widgets`: larger UI blocks made from entities/features, such as layout sections or top navigation.
- `features`: user actions and use cases, such as login, post creation, like toggling, save roadmap.
- `entities`: business nouns and their model/api/ui representation.
- `shared`: framework-independent utilities, HTTP client, generic UI kit, constants, tokens, helpers.

## Service split rule

Use this separation consistently:

- `shared/api`: only transport concerns.
  - Example: `httpClient`, auth header injection, endpoint config, request helpers.
- `entities/<entity>/api`: CRUD or read models that directly map to backend resources.
  - Example: `entities/community-post/api/communityPostApi.ts`
- `features/<feature>/model` or `features/<feature>/lib`: orchestration that combines multiple entity APIs, local storage, optimistic updates, or UI-specific business flow.
  - Example: current `communityEngagementService`, `jobScrapService`, `roadmapShareService`

Practical mapping from the current code:

- Move `src/api/client/httpClient.ts` to `src/shared/api/client/httpClient.ts`
- Move `src/api/services/communityService.ts` to `src/entities/community-post/api/communityPostApi.ts`
- Move `src/api/services/profileService.ts` to `src/entities/user/api/profileApi.ts`
- Keep `src/community/services/communityEngagementService.ts` as a feature service, but relocate to `src/features/community-engagement/model/communityEngagementService.ts`
- Keep `src/jobs/services/jobScrapService.ts` as a feature service because it mixes UI storage behavior with job entity data

## Type strategy

- Entity/domain types belong with the domain, not with `api`.
- DTO types returned by backend can live near the API module if they differ from domain models.
- Global cross-cutting types only go to `shared/types`.

Recommended migration:

- `src/api/types/admin.ts` -> `src/entities/admin/model/types.ts`
- `src/api/types/roadmap.ts` -> `src/entities/roadmap/model/types.ts`
- `src/profile/types/profile.ts` stays in entity or feature scope depending on reuse
- `src/shared/types` should contain only generic items like `Nullable<T>`, `ApiError`, `Id`

## Style strategy

- Do not change the existing visual design during the architecture refactor.
- In the short term, keep feature-level CSS files but move shared visual tokens to `src/shared/styles`.
- Split styles by responsibility:
  - `shared/styles/tokens.css`: colors, spacing, z-index, shadows, radius
  - `shared/styles/base.css`: reset, typography, app-wide element defaults
  - `shared/styles/utilities.css`: tiny layout helpers only if reused repeatedly

Tailwind recommendation:

- Do not introduce Tailwind in the middle of this refactor unless the team plans a broader styling-system migration.
- The current codebase already relies on authored CSS files. Mixing Tailwind and legacy CSS now would increase maintenance cost.
- If utility-first styling is still desired later, migrate feature by feature after design tokens are stabilized.

## State management recommendation

Current interaction complexity suggests this split:

- Server state: TanStack Query
  - Best fit for dashboard, profile, roadmap, admin, community detail/list, notifications
  - Handles caching, refetching, request status, optimistic updates
- Client/global UI state: Zustand
  - Best fit for auth session snapshot, notification dropdown open state, onboarding progress, transient filters

Suggested introduction points:

- Start TanStack Query on `community`, `profile`, `roadmap`
- Start Zustand only for auth/session and UI coordination state
- Avoid Redux unless you expect heavy event workflows, middleware requirements, or large team governance needs

## Dependency rules

Allowed direction:

`app -> pages -> widgets -> features -> entities -> shared`

Rules:

- A lower layer must never import a higher layer.
- `shared` cannot import from `entities`, `features`, `widgets`, `pages`, or `app`.
- `entities` cannot import from `features`, `widgets`, `pages`, or `app`.
- `features` may import `entities` and `shared`, but not `widgets`, `pages`, or `app`.
- `pages` should compose features/widgets/entities but should not own business logic beyond route-level coordination.
- Avoid feature-to-feature imports. If two features need the same logic, extract it to `entities` or `shared`.

## Suggested migration order

1. Finish `app` layer separation and alias adoption.
2. Move HTTP client and endpoint config into `shared/api`.
3. Move backend-facing services from `src/api/services` into entity `api` folders.
4. Move API-owned types into entity `model` folders.
5. Promote page-local interaction logic into `features`.
6. Normalize styles into `shared/styles` plus per-slice style files.
7. Introduce TanStack Query and then convert data-heavy pages incrementally.

## Immediate cleanup candidates

- Remove empty folders:
  - `src/admin/services`
  - `src/admin/types`
  - `src/dashboard/pages`
  - `src/dashboard/styles`
- Consolidate route ownership under `src/app/router`
- Gradually replace deep relative imports with `@/` aliases
