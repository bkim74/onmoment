# 온순간(OnMoment) 프로젝트 셋업 설계서

> TRD v8.0 Sacred Game 기술 명세서 기반 Sprint 0 — 프로젝트 셋업

## 목적

TRD v8.0 섹션 15(저장소 구조), 섹션 4(DB 스키마), 섹션 17(배포 파이프라인)을 실제 코드로 구현하여, 이후 Sprint 1~4에서 기능 구현 시 제로 설정으로 시작할 수 있는 기반을 완성한다.

## 범위

- Next.js 14 프로젝트 초기화 + 전체 폴더 구조
- Supabase DB 스키마 11개 테이블 + RLS + pgvector
- CI/CD 파이프라인 (GitHub Actions)
- PWA manifest + Service Worker 기본
- CLAUDE.md (TRD 요약)
- 환경 변수 템플릿

## 범위 외 (다음 Sprint)

- Phase 1~5 기능 구현
- AI 4구루 오케스트레이션
- 실제 인증 플로우
- WebXR / Geospatial

---

## 1. 프로젝트 초기화

### 스택
- Next.js 14 (App Router + TypeScript + Tailwind CSS)
- pnpm 패키지 매니저
- React 18

### 핵심 의존성 (TRD 섹션 15.2)
```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "@supabase/supabase-js": "^2.45.0",
    "@supabase/ssr": "^0.5.0",
    "ai": "^3.4.0",
    "@ai-sdk/openai": "^0.0.70",
    "@ai-sdk/google": "^0.0.55",
    "zod": "^3.23.0",
    "three": "^0.169.0",
    "serwist": "^9.0.0",
    "tailwindcss": "^3.4.0",
    "solapi": "^5.0.0",
    "@sentry/nextjs": "^8.30.0",
    "posthog-js": "^1.161.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "vitest": "^2.1.0",
    "@playwright/test": "^1.48.0",
    "supabase": "^1.200.0"
  }
}
```

## 2. 폴더 구조

TRD v8.0 섹션 15.1 준수:

```
onmoment/
├── .github/workflows/
│   ├── ci.yml
│   ├── preview-deploy.yml
│   └── e2e.yml
├── CLAUDE.md
├── README.md
├── DECISIONS.md
├── package.json
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
├── vercel.json
├── .env.example
│
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── summon/page.tsx
│   │   │   ├── gift/[token]/page.tsx
│   │   │   └── anchor/[id]/page.tsx
│   │   ├── (onboarding)/       ← placeholder page.tsx
│   │   ├── (journey)/          ← placeholder page.tsx
│   │   ├── (legacy)/           ← placeholder page.tsx
│   │   ├── api/
│   │   │   ├── ai/guru/route.ts
│   │   │   ├── recordings/route.ts
│   │   │   ├── distillations/route.ts
│   │   │   ├── anchors/route.ts
│   │   │   ├── gifts/route.ts
│   │   │   ├── nudge/tick/route.ts
│   │   │   └── safety/crisis/route.ts
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── recorder/
│   │   ├── guru/
│   │   ├── sdf/
│   │   ├── webxr/
│   │   └── adaptive/
│   ├── lib/
│   │   ├── ai/ (perceive.ts, plan.ts, act.ts, learn.ts, schemas.ts)
│   │   ├── sdf/
│   │   ├── webxr/
│   │   ├── kakao/
│   │   ├── supabase/ (client.ts, server.ts, types.ts)
│   │   ├── orgs/config.ts
│   │   ├── privacy/redact.ts
│   │   └── safety/risk.ts
│   ├── types/
│   └── middleware.ts
│
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── functions/
│
├── tests/
│   ├── unit/
│   ├── e2e/
│   └── fixtures/
│
├── scripts/
│   ├── seed-wisdom.ts
│   ├── woz-pilot.ts
│   └── migrate.ts
│
├── public/
│   ├── manifest.webmanifest
│   ├── sw.js
│   └── icons/
│
└── docs/
    └── PRD_v9.md, TRD_v8.md, SIM/
```

## 3. DB 스키마 (Supabase PostgreSQL + pgvector + RLS)

### 11개 핵심 테이블

1. **users** — id, email, nickname, birth_year, org_id, ui_scale, created_at
2. **journeys** — id, user_id, mode, state (ENUM: `awakening`, `wandering`, `anchoring`, `gifting`, `legacy`), day, chapter, org_id, parent_journey_id, start_date, completed_at
3. **recordings** — id, journey_id, day, audio_url, transcript (E2E 암호화), duration, embedding vector(1536), nonverbal_meta jsonb, created_at
4. **distillations** — id, journey_id, sentence, user_approved, sentence_hash, identity_keywords text[], created_at
5. **place_anchors** — id, distillation_id, lat, lng, altitude, geo_anchor_id, visibility, sentence_hash, created_at
6. **gifts** — id, journey_id, sender_id, recipient_id, recipient_phone, access_token, viewed_at, created_at
7. **sdf_scores** — id, journey_id, day, stability, identity, belief, action, env, created_at
8. **wisdom_corpus** — id, source, author, text_ko, text_en, embedding vector(1536), guru_tag text[]
9. **user_encryption_keys** — user_id, wrapped_key bytea, kms_ref text
10. **scheduled_nudges** — id, journey_id, type, scheduled_at, sent_at, created_at
11. **org_configs** — org_id, path, system_prompt, persona_weights jsonb, ui_theme, mode

### RLS 정책
- users: 본인 데이터만 접근 (auth.uid() = id)
- recordings: 본인 journey만 접근 (E2E)
- place_anchors: private은 본인만, public은 승인된 것만 익명 조회
- gifts: 수신자만 조회 가능
- journeys: org 테넌트 격리

### pgvector
- wisdom_corpus 임베딩 인덱스 (ivfflat, vector_cosine_ops)
- recordings 임베딩 인덱스

## 4. CI/CD 파이프라인

### GitHub Actions (.github/workflows/ci.yml)
- triggers: push, pull_request
- steps: checkout → pnpm install → typecheck → lint → test → playwright install → e2e

### Vercel 배포
- preview-deploy.yml: 모든 PR에 프리뷰 배포
- e2e.yml: main 병합 시 Playwright E2E

### vercel.json
- Cron: /api/nudge/tick 15분마다

## 5. PWA 설정

### manifest.webmanifest
```json
{
  "name": "온순간",
  "short_name": "온순간",
  "start_url": "/journey",
  "display": "standalone",
  "background_color": "#1F3A5F",
  "theme_color": "#B8860B",
  "icons": [{ "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }]
}
```

### Service Worker
- serwist 기반 자동 생성 (별도 sw.js 수동 작성 불필요)
- /api/recordings POST → BackgroundSync 큐 (24시간 보관)

## 6. CLAUDE.md

- TRD v8.0 요약 (~2,000단어)
- 현재 스프린트 목표
- 스택 버전
- 금지사항 (SaMD 용어, 손실 프레이밍 등)
- 코드 컨벤션 (파일 구조, 네이밍)

## 7. 환경 변수 (.env.example)

- Supabase: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- OpenAI: OPENAI_API_KEY, OPENAI_MODEL_GURU, OPENAI_MODEL_DISTILL
- Google: GEO_API_KEY
- Kakao: KAKAO_CLIENT_ID, KAKAO_CLIENT_SECRET, KAKAO_REST_API_KEY
- Solapi: SOLAPI_API_KEY, SOLAPI_API_SECRET
- 암호화: ENCRYPTION_MASTER_KEY, JWT_SECRET
- 모니터링: SENTRY_DSN, POSTHOG_KEY
- 안전망: SAFETY_SLACK_WEBHOOK
- 도메인: NEXT_PUBLIC_APP_URL
