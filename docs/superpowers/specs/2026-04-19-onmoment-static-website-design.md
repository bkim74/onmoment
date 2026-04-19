# 온순간(OnMoment) 정적 웹사이트 — 설계 문서

> PRD v1.0의 전체 기능을 정적 웹사이트로 구현하는 설계

## 1. 개요

### 1.1 목적
PRD에 기획된 온순간의 핵심 기능(음성 녹음, STT, AI 감정 분석, 40일 여정, 선물 전달)을 백엔드 서버 없이 정적 웹사이트로 구현한다.

### 1.2 핵심 결정
| 결정 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | React 18 + Vite | SPA 라우팅, 컴포넌트 기반, 정적 빌드 |
| 상태 관리 | Zustand | 경량, 단순 |
| 스타일링 | Tailwind CSS | 감각적 UI 빠른 구현 |
| 데이터 저장 | IndexedDB + localStorage | 음성 Blob은 IndexedDB, 메타데이터는 localStorage |
| AI API | 클라이언트 직접 호출 | 서버 없이 브라우저에서 API 호출 |
| 인증 | 카카오 JS SDK | 시니어 친화, PRD 기획 반영 |
| 배포 | GitHub Pages | 무료, 정적 파일 배포 |

## 2. 아키텍처

### 2.1 시스템 구조
```
브라우저 (단일 SPA)
├── React Router v6 — 7개 라우트
├── Zustand Store — 상태 관리
├── Tailwind CSS — 감각적 UI
├── IndexedDB (idb-keyval) — 음성 Blob 저장
└── localStorage — 메타데이터, 진행 상태
        │
        ▼ (클라이언트에서 직접 호출)
├── OpenAI Whisper API — STT 변환
└── Google Gemini Flash API — 감정 분석 + 구루 응답
```

### 2.2 핵심 파이프라인
```
[1분 음성 녹음] → [Whisper STT] → [Gemini 감정분석] → [UI 렌더링]
```
PRD와 동일한 파이프라인. 프롬프트만 교체 가능.

## 3. 화면 구조 (7개 라우트)

### 3.1 라우트 맵
| 라우트 | 화면 | 진입 조건 |
|--------|------|----------|
| `/` | S1. 랜딩/초대 | 누구나 |
| `/onboarding` | S2. 3일 미니 리츄얼 | 카카오 로그인 후 |
| `/main` | S3. 데일리 녹음 | 온보딩 완료 후 |
| `/response/:day` | S4. AI 응답 | 해당 일차 녹음 완료 후 |
| `/timeline` | S5. 40일 타임라인 | 온보딩 완료 후 |
| `/gift/:id` | S6. 선물 결과 | 40일 완료 후 |
| `/settings` | S7. 설정 | 온보딩 완료 후 |

### 3.2 하단 탭 네비게이션
홈(`/main`) / 타임라인(`/timeline`) / 설정(`/settings`) — S3, S5, S7 진입 시 노출.

### 3.3 라우트 보호 로직
- 미로그인 → `/` 리다이렉트
- 온보딩 미완료 → `/onboarding` 리다이렉트
- 40일 완료 → `/gift/:id` 리다이렉트
- 선물 페이지는 공유 링크로 접근 (비밀번호 보호)

## 4. 화면별 상세

### S1. 랜딩/초대 페이지
- 감성적 히어로 카피: "당신의 가장 연약한 순간이 누군가에게는 가장 강력한 선물이 됩니다"
- 3가지 가치 제안 카드 (음성, AI, 선물)
- 카카오 로그인 CTA 버튼
- 초대 링크 안내 영역

### S2. 온보딩 (3일 미니 리츄얼)
- Day 1: "오늘 하루를 한 문장으로 표현해주세요"
- Day 2: "최근 가장 감사했던 순간은?"
- Day 3: "사랑하는 사람에게 하고 싶은 말은?"
- 각 일시 1분 녹음 → AI 즉시 응답
- 3일 완료 후 40일 여정 업셀링

### S3. 메인 화면 (데일리 코어 루프)
- 닉네임 인사 + Day 진행률 바
- "오늘의 마음 날씨" 아이콘 5개 (맑음/구름/흐림/비/폭풍)
- 큰 녹음 버튼 (120px 원형, 보라 그라디언트)
- 어제 구루 응답 미리보기

### S3-1. 녹음 중 화면
- 어두운 배경 전환 (보라→남색)
- 파형 애니메이션
- 타이머 (최대 90초)
- 일시정지 / 다시 녹음 / 완료 컨트롤

### S4. AI 응답 화면
- 구루 페르소나 아바타 + 텍스트 응답
- 감정 주파수 시각화 (심플 파형)
- 원본 음성 재생 버튼

### 4구루 동적 라우팅
AI가 STT 텍스트의 감정 키워드를 분석하여 최적 구루 자동 배정:
| 구루 | 페르소나 | 배정 조건 |
|------|----------|----------|
| 위로의 구루 | 따뜻한 상담자 | 슬픔, 그리움, 외로움 키워드 |
| 성장의 구루 | 지혜로운 스승 | 도전, 성취, 배움 키워드 |
| 연결의 구루 | 친근한 친구 | 사랑, 감사, 기쁨 키워드 |
| 치유의 구루 | 부드러운 치유자 | 아픔, 상실, 두려움 키워드 |

Gemini 프롬프트에 페르소나별 시스템 프롬프트를 포함하여 응답 생성.

### 일차 계산 로직
- 여정 시작일(journey.startDate) 기준으로 Day N 계산
- 매일 1회 녹음 원칙: 같은 날 재녹음 가능, 새로운 날에만 Day 증가
- 미녹음일은 타임라인에 빈칸으로 표시 (자동 스킵 없음, 최대 40일)

### S5. 타임라인
- 7x6 캘린더 그리드 (완료일 보라, 오늘 테두리, 마일스톤 금색)
- 마일스톤 카드 (Day 7/14/21)
- 날짜 탭 → 음성 + AI 응답 재생

### S6. 선물 결과 페이지 (자녀용)
- 어두운 배경, "한 문장" 타이포그래피
- 하이라이트 음성 3-5개 재생
- 카카오 공유 버튼
- 비밀번호 보호 (선물 생성 시 설정)

### S7. 설정
- 프로필 정보 (카카오 연동)
- API 키 관리 (OpenAI, Gemini)
- 알림 토글
- 데이터 내보내기/가져오기/초기화
- 안전망 정보 (1393/119)

## 5. 데이터 모델

### 5.1 IndexedDB 스토어
| 스토어 | 저장 내용 | 키 |
|--------|----------|-----|
| `audioRecords` | 음성 Blob (.webm) | `journeyId_dayNumber` |
| `guruResponses` | AI 구루 응답 텍스트, 감정 분석 결과 | `journeyId_dayNumber` |

### 5.2 localStorage 키
| 키 | 내용 |
|----|------|
| `onmoment_user` | 카카오 사용자 정보 (id, 닉네임, 프로필) |
| `onmoment_journey` | 현재 여정 상태 (status, startDate, theme) |
| `onmoment_daily_meta` | 일일 메타데이터 배열 (weather, sdfScore, keywords, guruId) |
| `onmoment_milestones` | 7/14/21일 마일스톤 카드 데이터 |
| `onmoment_gift` | 완성된 선물 데이터 (oneSentence, highlightDays, accessCode) |

### 5.3 데이터 흐름
```
녹음 완료 → Blob을 IndexedDB에 저장
         → Whisper API로 STT 변환
         → Gemini Flash로 감정 분석 + 구루 응답
         → 응답 텍스트를 IndexedDB에 저장
         → 메타데이터를 localStorage에 업데이트
```

## 6. 외부 API 연동

### 6.1 OpenAI Whisper API
- **용도**: 음성 → 텍스트 STT 변환
- **호출 방식**: 브라우저에서 직접 fetch 호출
- **입력**: 녹음된 Blob (.webm, 최대 90초)
- **출력**: 한국어 텍스트

### 6.2 Google Gemini Flash API
- **용도**: 감정 분석 + 구루 페르소나 응답 생성
- **호출 방식**: 브라우저에서 직접 fetch 호출
- **입력**: STT 텍스트 + 감각 상태(weather) + 페르소나 프롬프트
- **출력**: 감정 분석 결과(SDF 점수, 키워드) + 구루 응답 텍스트
- **마일스톤**: 7/14/21일 요약, 40일 "한 문장" 생성에도 사용

### 6.3 카카오 JS SDK
- **용도**: 사용자 인증
- **방식**: 카카오 로그인 팝업 → 사용자 정보(id, 닉네임, 프로필) 획득
- **저장**: localStorage에 사용자 정보 저장

### 6.4 API 키 관리
- 사용자가 설정 페이지에서 직접 API 키 입력
- localStorage에 저장 (API 키 노출 주의 — 프로토타입/개인 사용 목적)

## 7. 디자인 시스템

### 7.1 색상
| 용도 | 색상 |
|------|------|
| Primary | 보라~남색 그라디언트 (#8b5cf6 → #6366f1) |
| 배경 | 연보라 그라디언트 (#faf5ff → #f0f9ff) |
| 녹음 중 배경 | 어두운 보라 (#1e1b4b → #312e81) |
| 마일스톤 | 금색 (#f59e0b → #ef4444) |
| 텍스트 | 진보라 (#4c1d95) |

### 7.2 타이포그래피
- 시니어 친화적 큰 폰트 (최소 13px, 제목 20px+)
- 높은 줄 간격 (line-height 1.5+)

### 7.3 컴포넌트
- 둥근 모서리 (border-radius 12-16px)
- 글래스모피즘 (반투명 배경 + backdrop-blur)
- 큰 터치 영역 (48px+)
- 부드러운 페이드 전환

## 8. 안전망 프로토콜

### 8.1 SDF 위험 감지
- STT 결과에서 키워드 필터링 (자살/죽음/포기/슬픔)
- 위험 감지 시: AI 응답 차단, 따뜻한 안내 메시지, 1393/119 버튼 노출

### 8.2 데이터 주권
- 모든 데이터는 브라우저 로컬에만 저장
- 외부 전송은 API 호출 시에만 (STT/AI 분석)
- 선물 공유는 사용자가 명시적으로 생성한 데이터만

## 9. 프로젝트 구조 (예상)

```
src/
├── components/
│   ├── layout/
│   │   ├── TabBar.tsx
│   │   └── ProtectedRoute.tsx
│   ├── recording/
│   │   ├── RecordButton.tsx
│   │   ├── WaveformVisualizer.tsx
│   │   └── Timer.tsx
│   ├── weather/
│   │   └── WeatherSelector.tsx
│   ├── timeline/
│   │   ├── CalendarGrid.tsx
│   │   └── MilestoneCard.tsx
│   ├── guru/
│   │   ├── GuruAvatar.tsx
│   │   └── GuruResponse.tsx
│   └── common/
│       ├── ProgressBar.tsx
│       └── AudioPlayer.tsx
├── pages/
│   ├── Landing.tsx
│   ├── Onboarding.tsx
│   ├── Main.tsx
│   ├── Response.tsx
│   ├── Timeline.tsx
│   ├── Gift.tsx
│   └── Settings.tsx
├── stores/
│   ├── useAuthStore.ts
│   ├── useJourneyStore.ts
│   └── useRecordingStore.ts
├── services/
│   ├── kakao.ts
│   ├── whisper.ts
│   ├── gemini.ts
│   ├── storage.ts (IndexedDB + localStorage 래퍼)
│   └── safety.ts (위험 감지)
├── App.tsx
└── main.tsx
```

## 10. 배포

- Vite 빌드 → `dist/` 폴더 생성
- GitHub Pages에 `dist/` 배포
- SPA 라우팅을 위해 404.html → index.html 리다이렉트 설정 필요
