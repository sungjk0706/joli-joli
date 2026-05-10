# Joli-Joli 워크룰

라이브 커머스 앱. 핵심 철학: **단순한 로직, 근본 원인 해결, 추측 금지, 단계별 승인.**

---

## 1. 시스템 개요

- React(Vite) 프론트엔드 + Supabase 백엔드
- Supabase Realtime을 통한 실시간 데이터 동기화
- 모바일 최적화 라이브 커머스 (3단계 뷰 시스템)
- macOS / Windows / 모바일 크로스 플랫폼

---

## 2. 파일 역할 맵

### 프론트엔드 (`src/`)

| 파일 | 역할 |
|------|------|
| `App.jsx` | 뷰 전환 (customer/admin/setup), 히스토리 관리 |
| `components/CustomerView.jsx` | 고객 화면 orchestrator — React.lazy로 기기별 분기 |
| `components/AdminView.jsx` | 관리자 orchestrator — React.lazy로 기기별 분기 |
| `components/LiveCommerceView.jsx` | 라이브 orchestrator — React.lazy로 기기별 분기 |
| `components/customer/phone/` | 고객 Phone 전용 UI |
| `components/customer/tablet/` | 고객 Tablet 전용 UI |
| `components/customer/desktop/` | 고객 Desktop 전용 UI |
| `components/admin/mobile/` | 어드민 Phone 전용 UI (5-tabs) |
| `components/admin/tablet/` | 어드민 Tablet 전용 UI (6-tabs) |
| `components/admin/desktop/` | 어드민 Desktop 전용 UI |
| `components/live/` | 라이브 기기별 UI + 공통 하위 컴포넌트 |
| `components/ProductDetailView.jsx` | 상품 상세 페이지 |
| `components/CartView.jsx` | 장바구니 |
| `services/` | Supabase CRUD 연동 (11개 서비스) |
| `hooks/queries/` | TanStack Query 훅 (enabled: isSupabaseConfigured()) |
| `hooks/live/` | 라이브 전용 훅 (useLiveRealtime, useLiveGestures) |
| `hooks/useDeviceType.js` | phone/tablet/desktop 자동 감지 |
| `hooks/useAdminLogicV2.js` | 어드민 비즈니스 로직 통합 훅 |
| `stores/` | Zustand 전역 상태 (cart, live, session) |
| `lib/supabase.js` | Supabase 클라이언트 + isSupabaseConfigured() |

---

## 3. 데이터 흐름

```
Supabase Realtime → onBroadcast/onPostgresChanges
  → React 상태 갱신 (useState/setState)
  → DOM 재렌더링 (React Virtual DOM)

라이브 모드:
  viewMode 상태 (SPLIT/PORTRAIT/LANDSCAPE)
  → CSS transform/position 갱신
  → 하드웨어 가속 (transform-gpu, will-change)

TanStack Query (서버 상태):
  enabled: isSupabaseConfigured()  ← 반드시 포함
  → Supabase 미설정 시 쿼리 실행 안 함

Zustand (클라이언트 상태):
  cartStore / liveStore / sessionStore
  → Supabase와 무관하게 항상 동작
```

---

## 3-1. 컴포넌트 아키텍처 (3-way 기기 분기)

```
App.jsx
├── CustomerView.jsx     [orchestrator — React.lazy + Suspense]
│   ├── [isPhone]   → customer/phone/CustomerViewPhone
│   ├── [isTablet]  → customer/tablet/CustomerViewTablet
│   ├── [isDesktop] → customer/desktop/CustomerViewDesktop
│   └── LiveCommerceView.jsx  [orchestrator — React.lazy]
│       ├── [isPhone]   → live/LiveCommercePhone
│       ├── [isTablet]  → live/LiveCommerceTablet
│       └── [isDesktop] → live/LiveCommerceDesktop
├── AdminView.jsx        [orchestrator — React.lazy + Suspense]
│   ├── [!loggedIn] → admin/AdminLoginSection
│   ├── [isPhone]   → admin/mobile/AdminMobileView  (5-tabs)
│   ├── [isTablet]  → admin/tablet/AdminTabletView  (6-tabs)
│   └── [else]      → admin/desktop/AdminDesktopView
└── SetupView.jsx        (Supabase 미설정 시)
```

**규칙**: 새 기기별 컴포넌트 추가 시
1. `React.lazy(() => import(...))` 사용
2. Orchestrator에서 `React.Suspense`로 감싸기
3. `sharedProps` 또는 `adminProps`에 필요한 props 추가

---

## 3-2. 번들 구조 (vite.config.js — manualChunks 함수형)

```
index.js          9.89 KB   (앱 진입점)
chunk-admin      182 KB    (src/components/admin/*)
chunk-customer   114 KB    (src/components/customer/*)
vendor-react     200 KB    (react + react-dom)
vendor-supabase  206 KB    (@supabase/supabase-js)
vendor-recharts  372 KB    (recharts)
vendor-lucide     34 KB    (lucide-react)
vendor-state      44 KB    (@tanstack/react-query + zustand)
```
정상 빌드: exit code 0, 500KB 경고 없음

---

## 3-3. DB Migration 순서 (supabase/migrations/)

```
000_initial_schema.sql          products(stock 포함)/orders/categories/configs DDL
001_add_sales_count.sql          products.sales_count + 인덱스
002_add_increment_sales_count_rpc.sql  increment/decrement_sales_count RPC
003_add_tracking_number.sql      orders.tracking_number/carrier
004_add_stats_views.sql          daily/monthly_sales_stats 뷰
005_add_payment_method.sql       orders.payment_method
006_add_coupons.sql              coupons/coupon_usages + increment_coupon_usage RPC
007_add_cart.sql                 cart 테이블
008_add_reviews.sql              reviews 테이블
009_add_dopamine_features.sql    flash_sales/raffles/raffle_entries/raffle_winners
                                 + check_raffle_availability RPC (파라미터: p_raffle_id, p_customer_phone)
010_add_place_order_rpc.sql      place_order / decrement_stock RPC
```

---

## 4. 프론트엔드 규칙

### 4-1. 상태 관리

| 상태 | 자료구조 | 갱신 방식 |
|------|---------|-----------|
| `viewMode` | `string` (SPLIT/PORTRAIT/LANDSCAPE) | `setViewMode(newMode)` |
| `products` | `array` | `[...prev, newProduct]` 또는 filter/map |
| `cart` | `array` | splice 기반 추가/제거 |
| `orders` | `array` | `[newOrder, ...prev]` prepend |

### 4-2. DOM 갱신

```jsx
// ✅ CSS display 토글
panel.style.display = active ? '' : 'none'
// ✅ 조건부 렌더링
{active && <Component />}
// ✅ React 상태 기반 렌더링
<div className={viewMode === 'PORTRAIT' ? 'h-screen' : 'h-1/2'}>
// ❌ 금지 (초기 마운트 제외)
container.innerHTML = ''
document.querySelector(...).remove()
```

### 4-3. 하드웨어 가속 필수

라이브 뷰 모드 전환 시:
```css
/* 필수 속성 */
transform-gpu;
will-change: transform, orientation;
```

---

## 5. 절대 금지 패턴

| 영역 | ❌ 금지 | ✅ 대신 |
|------|--------|--------|
| 상태 갱신 | 직접 DOM 수정 | React 상태 기반 렌더링 |
| 비동기 처리 | `async/await` 남용 | 필요한 곳에만 사용 |
| 폴링 | `setInterval`로 데이터 주기적 조회 | Supabase Realtime 구독 |
| 이벤트 리스너 | 중복 등록 안 함 | cleanup 함수에서 제거 |
| 스타일 | 인라인 스타일 과다 사용 | Tailwind CSS 클래스 |
| 배열 갱신 | `.push()` 직접 사용 | spread operator 또는 splice |
| 예외 처리 | `try-catch`로 삼키기 | 오류 노출 (테스트 단계) |

---

## 6. 작업 프로세스 (순차 준수)

### 6-0. 워크룰 재확인 (매 작업 시작 시 필수)

**분석 및 수정 계획 단계 시작 시, 반드시 이 워크룰(특히 핵심 원칙)을 다시 읽고 준수할 것.**

### 6-1. 작업 전 필수 확인

1. 수정할 파일의 전체 구조 파악
2. 해당 함수/컴포넌트의 호출처 추적
3. 영향받는 다른 파일 확인
4. 불확실하면 즉시 질문 (추측 금지)

### 6-2. 단계별 승인 (절대 위반 금지)

- **사용자의 명시적 승인 없이는 어떤 코드나 파일도 수정하지 마라.**
- 분석/제안/보고는 자유. 실제 변경은 승인 후에만.
- 각 단계 완료 후 `[N단계 완료] 결과: [요약]` 출력
- 오류 발생 시 즉시 중단 → 원인 분석 → 2가지 이상 해결안 제시 → 사용자 선택

### 6-3. 테스트 후 최종 보고 (필수)

**수정 완료 후, 반드시 테스트(구문 검증/빌드/진단)를 수행하고 그 결과를 포함한 최종 보고서를 작성할 것. 테스트 없이 완료 보고 금지.**

### 6-4. 코딩 원칙

- **단순성**: 요청받지 않은 기능/추상화 추가 금지. 50줄로 가능하면 200줄 금지.
- **정밀성**: 인접 코드/주석/포맷팅 "개선" 금지. 변경된 모든 줄은 사용자 요청에 직접 추적 가능해야 함.
- **출력**: 분석 과정/추측 표현 금지. 완료 보고/문제 발견/승인 요청만 허용. UI 기준으로 설명.

---

## 7. 실시간 데이터 무결성 (Supabase Realtime)

1. **순서 보장**: 같은 데이터의 변경은 발생 순서 그대로 처리.
2. **유실 허용치 0**: Realtime 재연결 시 유실 구간은 REST로 백필.
3. **지연 측정**: 수신→처리→렌더링 100ms 초과 경고.
4. **구독 관리**: 컴포넌트 unmount 시 반드시 구독 해제.

---

## 8. 에러 발생 시

1. 즉시 중단 + 현재 상태 요약
2. 로그/코드 기반 원인 분석 (추측 금지)
3. 2가지 이상 해결안 제시 (장단점 명시)
4. 사용자 선택 후 승인된 방안만 실행
5. 임시방편(예외 무시, sleep 지연, 테스트 우회) 절대 제안 금지

---

## 9. 컨텍스트 관리

### 새 세션 시작 시 (최우선)
1. `.windsurf/HANDOVER.md` 읽고 이전 작업 상태 복원
2. 없으면 "이전 작업 내역이 없습니다. 새로 시작할까요?" 대기
3. 복원 후 한 줄 요약 보고

### 인계서 자동작성 트리거
- 3개 이상 단계 완료 시 / 대화 20개 초과 시
- 사용자가 "인계서/정리/다음 세션" 언급 시
- 세션 종료 예상 시 / 심각한 에러로 중단 시

저장 위치: `.windsurf/HANDOVER.md` (항상 덮어쓰기)

---

## 10. 최종 점검 리스트

- [ ] 수정 코드가 사용자 요청 범위 내인가?
- [ ] 불필요한 리팩토링/스타일 변경 없는가?
- [ ] 상태 갱신이 React 상태 기반인가?
- [ ] DOM 직접 수정이 없는가?
- [ ] Supabase Realtime 구독 해제가 있는가?
- [ ] 하드웨어 가속 속성이 유지되는가? (LiveCommerceView.jsx)
- [ ] 배열 갱신이 불변성을 준수하는가?
- [ ] 예외 처리가 오류를 노출하는가?
- [ ] 테스트(구문/빌드/진단) 수행했는가?
- [ ] 사용자 승인을 받았는가?
- [ ] 새 TanStack Query 훅의 `enabled`에 `isSupabaseConfigured()` 포함했는가?
- [ ] 새 기기별 컴포넌트를 `React.lazy`로 추가했는가?
- [ ] SQL RPC 파라미터명에 `p_` 접두사를 사용했는가?
- [ ] JS RPC 호출부 파라미터명이 SQL 함수 시그니처와 일치하는가?
- [ ] `supabase.raw()` 대신 SELECT 후 UPDATE 패턴을 사용했는가?

---

## 11. 추측 금지 강제 규칙 (AI 자기 제약)

### 11-1. 응답 전 자기 검열 (매번 필수)

응답 생성 전 반드시 다음 3가지를 자기 검열하라:

1. 분석 대상 파일을 실제로 읽었는가? → 읽지 않았으면 지금 읽어라. 읽기 전에는 어떤 분석도 출력하지 마라.

2. 응답에 '~일 것입니다', '~로 보입니다', '~인 것 같습니다', '아마도', '~가능성이 있습니다', '일반적으로', '보통 이런 경우' 표현이 포함되어 있는가? → 포함되어 있으면 해당 문장을 삭제하고 파일을 읽어 사실로 대체하라.

3. 사용자의 명시적 승인 없이 코드 수정을 진행하려 하는가? → 승인 없이는 수정 불가. 분석과 승인 요청만 허용.

위 3가지 중 하나라도 위반이 있으면 응답을 수정한 후 출력하라.

### 11-2. 금지 표현 목록 (이 표현이 나오면 즉시 멈추고 파일을 읽어라)

| ❌ 금지 표현 | ✅ 대체 행동 |
|------------|------------|
| "~일 것입니다" | 해당 파일 읽고 확인 후 사실만 기술 |
| "~로 보입니다" | 해당 파일 읽고 확인 후 사실만 기술 |
| "~인 것 같습니다" | 해당 파일 읽고 확인 후 사실만 기술 |
| "아마도 ~" | 해당 파일 읽고 확인 후 사실만 기술 |
| "~때문일 수 있습니다" | 해당 파일 읽고 확인 후 사실만 기술 |
| "~가능성이 있습니다" | 해당 파일 읽고 확인 후 사실만 기술 |
| "일반적으로 ~" | Joli-Joli 코드 기준으로만 판단 |
| "보통 이런 경우에는 ~" | Joli-Joli 코드 기준으로만 판단 |

### 11-3. 허용되는 응답 형식

```
[확인한 사실] (파일명 + 줄번호 또는 함수명 명시)
- ...

[확인 필요 — 파일 읽겠습니다]
- ...

[승인 요청]
- 변경 내용: ...
- 영향 범위: ...
```

### 11-4. 허용되지 않는 응답 형식

```
❌ "이 오류는 아마 X 때문일 것입니다."
❌ "코드를 보면 Y로 보입니다." (실제로 읽지 않은 경우)
❌ "일반적으로 이런 패턴은 Z를 의미합니다."
❌ 파일을 읽지 않고 구조나 동작을 설명하는 모든 문장
```

### 11-5. 불확실할 때 유일한 허용 행동

**파일을 읽는다.** 읽을 수 없으면 "어떤 파일을 확인해야 하나요?"라고 질문한다.
추측으로 채우는 것은 어떤 경우에도 허용되지 않는다.
