# 🔖 JOLI JOLI 리팩토링 인계서

> 작성일: 2026-05-10 (버그픽스 완료 반영)  
> 이 파일은 세션 컨텍스트 초기화 후에도 리팩토링을 이어갈 수 있도록 작성된 인계서입니다.

---

## ✅ 완료된 작업 (Phase 1~6 + 개선점 전부 완료)

### Phase 1 — `useDeviceType` 훅 신설 ✅
- **파일**: `src/hooks/useDeviceType.js`
- `phone` / `tablet` / `desktop` 자동 감지
- `window.matchMedia('(pointer: coarse)')` 기반 터치 감지 포함
- `isPhone`, `isTablet`, `isDesktop`, `orientation`, `isTouchDevice`, `hasHover` 반환
- `src/hooks/index.js`에 export 추가

### Phase 2 — CustomerView 3-way 분기 ✅
- `CustomerView.jsx` → orchestrator로 리팩토링 (비즈니스 로직 보존)
- `sharedProps` 객체로 공통 상태/핸들러를 기기별 컴포넌트에 전달
- **Phone**: `src/components/customer/phone/CustomerViewPhone.jsx`
  - 전체화면 히어로, 하단 고정 퀵액션 바 (5-탭), Bottom Sheet 모달
- **Tablet**: `src/components/customer/tablet/CustomerViewTablet.jsx`
  - 좌측 280px 스티키 패널 + 우측 스크롤 영역 (2-column)
- **Desktop**: `src/components/customer/desktop/CustomerViewDesktop.jsx`
  - 상단 헤더 네비게이션 + 중앙 히어로 + 3열 이벤트 그리드

### Phase 3 — AdminMobileView 설정탭 완성 ✅
- **파일**: `src/components/admin/mobile/AdminMobileView.jsx`
- `renderSystem()` 함수로 모바일 경량 설정 UI 구현
- 포함: 주문 ON/OFF 토글, 상점정보, 계좌, 텔레그램, 비밀번호 변경

### Phase 4 — AdminView 기기 감지 통합 ✅
- **파일**: `src/components/AdminView.jsx`
- `window.innerWidth + resize` 이벤트 → `useDeviceType()` 훅으로 교체
- `isPhone` → `AdminMobileView`, `isTablet` → `AdminTabletView`, `isDesktop` → `AdminDesktopView`

### Phase 5 — AdminTabletView 신설 ✅
- **파일**: `src/components/admin/tablet/AdminTabletView.jsx`
- 좌측 아이콘 사이드바(w-20) + 우측 전체 탭 콘텐츠 (2-panel)
- 모든 PC 탭 기능 포함: stats/orders/products/live/system/shop
- 상단 토스트 방식 주문 알림

### Phase 6 — LiveCommerceView 기기별 분기 ✅
- **파일**: `src/components/LiveCommerceView.jsx` (orchestrator 리팩토링)
- **신규**:
  - `src/components/live/LiveCommercePhone.jsx` — 하단 퀵액션 + Bottom Sheet
  - `src/components/live/LiveCommerceTablet.jsx` — 비디오 60% + 우측 패널 40%
  - `src/components/live/LiveCommerceDesktop.jsx` — 3열 그리드 (상품+비디오+채팅)
- `useDeviceType()`로 3-way 분기, React.lazy로 코드 분할
- `.pb-safe` 클래스 추가 (iOS Safe Area 지원)

### 개선점 — 미니모드 위치 재계산 ✅
- **파일**: `src/components/LiveCommerceView.jsx`
- 화면 리사이즈 시 미니모드 위치 비율로 재계산 (위치 어긋남 방지)

### 개선점 — AdminMobileView 상품 탭 ✅
- **파일**: `src/components/admin/mobile/AdminMobileView.jsx`
- `renderProducts()` 함수 추가 — 재고 ON/OFF 토글 중심의 경량 UI
- 상품 목록(이미지+정보+토글), 상태 배지(판매중/품절/라이브)

---

## ✅ 추가 완료 (Phase 7~8)

### Phase 7 — 스마트폰 스와이프 제스처 강화 ✅
- **파일**: `src/hooks/live/useLiveGestures.js`
- 수직/수평 방향 잠금(`directionLocked`) 추가 — 가로 스크롤과 충돌 방지
- **스와이프 업 (80px+)** → `onSwipeUp()` 콜백 → 상품목록 시트 열기
- **스와이프 다운 (100px+)** → 미니모드 전환 (기존 유지)
- `LiveCommerceView.jsx`에서 `onSwipeUp: () => setIsProductListOpen(true)` 연결

### Phase 8 — 번들 최적화 ✅ (2차 개선 포함)
- **파일**: `vite.config.js`
- `manualChunks` 함수형으로 전환, 청크 분리:
  - `vendor-react`: 200 KB
  - `vendor-supabase`: 206 KB
  - `vendor-recharts`: 372 KB
  - `vendor-lucide`: 34 KB
  - `vendor-state` (@tanstack/react-query + zustand): 44 KB
  - `chunk-admin` (admin 컴포넌트 전체): 182 KB
  - `chunk-customer` (customer 컴포넌트 전체): 114 KB
- `CustomerView.jsx` / `AdminView.jsx`: 정적 import → `React.lazy + Suspense` 전환
- `index.js` 521 KB → **9.89 KB** (-98%), 500KB 경고 완전 해소

---

## ✅ 버그픽스 완료 (8건)

### [SQL-1] `check_raffle_availability` 파라미터명 충돌 ✅
- **파일**: `supabase/migrations/009_add_dopamine_features.sql`
- `raffle_id` / `customer_phone` → `p_raffle_id` / `p_customer_phone`, `entry_count` → `v_entry_count`
- `WHERE raffle_entries.raffle_id = raffle_id` 가 항상 `true`가 되는 치명적 버그였음

### [SQL-2] `place_order` / `decrement_stock` RPC migration 누락 ✅
- **파일**: `supabase/migrations/010_add_place_order_rpc.sql` (신규 생성)
- `place_order`: 재고 확인(`FOR UPDATE`) → 차감 → 주문 INSERT → 판매량 증가를 하나의 트랜잭션으로 처리
- `decrement_stock`: 재고 차감 단독 호출용 RPC

### [SQL-3] 초기 DDL migration 누락 ✅
- **파일**: `supabase/migrations/000_initial_schema.sql` (신규 생성)
- `products`(`stock` 포함) / `orders` / `categories` / `configs` 기본 테이블 DDL 전체 문서화
- `IF NOT EXISTS`로 기존 DB 안전 호환

### [JS-1] `enterRaffle()` RPC 파라미터명 불일치 ✅
- **파일**: `src/services/dopamineService.js` L158
- SQL 함수 수정 후 JS 호출부를 미동기화한 파생 버그
- `raffle_id` / `customer_phone` → `p_raffle_id` / `p_customer_phone`

### [JS-2] `couponService` fallback에 `supabase.raw()` 미존재 API 사용 ✅
- **파일**: `src/services/couponService.js` L155
- `supabase.raw()`는 Supabase JS v2에 존재하지 않음
- `SELECT used_count` 후 `+1`하여 `UPDATE`하는 올바른 v2 패턴으로 교체

### [JS-3] TanStack Query Hook `enabled: true` 하드코딩 ✅
- **파일**: `useOrdersQuery.js` / `useProductsQuery.js` / `useCategoriesQuery.js` / `useConfigsQuery.js`
- `enabled: true` → `enabled: isSupabaseConfigured()` — 미설정 상태에서 불필요한 쿼리 방지

### [JS-4] 번들 500KB 경고 (React.lazy 전환) ✅
- **파일**: `CustomerView.jsx`, `AdminView.jsx`
- 기기별 컴포넌트 정적 import → `React.lazy + Suspense`로 전환

### [JS-5] EMS 배송 추적 URL 공백 ✅
- **파일**: `src/services/orderService.js` L87
- URL 문자열 내 불필요한 공백 제거

## 🔴 남은 작업

현재 모든 계획된 Phase 및 버그픽스 완료. 신규 기능 요청 시 이 파일에 추가할 것.

---

## 📂 변경된 파일 전체 목록

```
신규 생성 (Phase 1~8):
  src/hooks/useDeviceType.js
  src/components/customer/phone/CustomerViewPhone.jsx
  src/components/customer/tablet/CustomerViewTablet.jsx
  src/components/customer/desktop/CustomerViewDesktop.jsx
  src/components/admin/tablet/AdminTabletView.jsx
  src/components/live/LiveCommercePhone.jsx
  src/components/live/LiveCommerceTablet.jsx
  src/components/live/LiveCommerceDesktop.jsx

신규 생성 (버그픽스):
  supabase/migrations/000_initial_schema.sql   (초기 DDL 문서화)
  supabase/migrations/010_add_place_order_rpc.sql  (place_order / decrement_stock RPC)

수정 (Phase 1~8):
  src/hooks/index.js                              (export 추가)
  src/components/CustomerView.jsx                 (orchestrator + React.lazy 전환)
  src/components/AdminView.jsx                    (useDeviceType + React.lazy 전환)
  src/components/admin/mobile/AdminMobileView.jsx (설정탭 + 상품탭 완성)
  src/components/LiveCommerceView.jsx             (orchestrator + 미니모드 위치 재계산)
  vite.config.js                                  (manualChunks 함수형 + 청크 7개 분리)

수정 (버그픽스):
  supabase/migrations/009_add_dopamine_features.sql  (check_raffle_availability 파라미터명 수정)
  src/services/dopamineService.js                    (enterRaffle RPC 파라미터명 동기화)
  src/services/couponService.js                      (supabase.raw() → 올바른 v2 패턴)
  src/services/orderService.js                       (EMS URL 공백 제거)
  src/hooks/queries/useOrdersQuery.js                (enabled: isSupabaseConfigured())
  src/hooks/queries/useProductsQuery.js              (enabled: isSupabaseConfigured())
  src/hooks/queries/useCategoriesQuery.js            (enabled: isSupabaseConfigured())
  src/hooks/queries/useConfigsQuery.js               (enabled: isSupabaseConfigured())
```

---

## 🏗️ 현재 아키텍처

### 컴포넌트 트리
```
App.jsx  (뷰 전환: customer / admin / setup)
│
├── CustomerView.jsx          [orchestrator — React.lazy + Suspense]
│   ├── [isPhone]   → customer/phone/CustomerViewPhone
│   ├── [isTablet]  → customer/tablet/CustomerViewTablet
│   ├── [isDesktop] → customer/desktop/CustomerViewDesktop
│   └── LiveCommerceView.jsx  [orchestrator — React.lazy]
│       ├── [isPhone]   → live/LiveCommercePhone
│       ├── [isTablet]  → live/LiveCommerceTablet
│       └── [isDesktop] → live/LiveCommerceDesktop
│
├── AdminView.jsx             [orchestrator — React.lazy + Suspense]
│   ├── [!loggedIn] → admin/AdminLoginSection
│   ├── [isPhone]   → admin/mobile/AdminMobileView  (5-tabs)
│   ├── [isTablet]  → admin/tablet/AdminTabletView  (6-tabs)
│   └── [else]      → admin/desktop/AdminDesktopView
│
└── SetupView.jsx             (Supabase 미설정 시)
```

### 데이터 레이어
```
supabase (src/lib/supabase.js)
  → isSupabaseConfigured(): localStorage + VITE_SUPABASE_URL/KEY
  → supabase client: null (미설정) | createClient() (설정됨)

Services (src/services/)
  productService  orderService  categoryService  configService
  cartService     couponService  dopamineService  reviewService
  statsService    notificationService  paymentService
  → 모든 서비스: supabase === null 체크 후 early return

TanStack Query Hooks (src/hooks/queries/)
  useProductsQuery  useOrdersQuery  useCategoriesQuery  useConfigsQuery
  → enabled: isSupabaseConfigured()  (Supabase 미설정 시 쿼리 비활성화)

Zustand Stores (src/stores/)
  cartStore  liveStore  sessionStore
```

### 번들 청크 구조 (vite.config.js — manualChunks 함수형)
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

### 데이터베이스 Migration 순서
```
000_initial_schema.sql         products / orders / categories / configs 기본 DDL
001_add_sales_count.sql         products.sales_count 컬럼 + 인덱스
002_add_increment_sales_count_rpc.sql  increment/decrement_sales_count RPC
003_add_tracking_number.sql     orders.tracking_number / carrier
004_add_stats_views.sql         daily/monthly_sales_stats 뷰, popular_products 뷰
005_add_payment_method.sql      orders.payment_method
006_add_coupons.sql             coupons / coupon_usages 테이블 + increment_coupon_usage RPC
007_add_cart.sql                cart 테이블
008_add_reviews.sql             reviews 테이블
009_add_dopamine_features.sql   flash_sales / raffles / raffle_entries / raffle_winners 테이블
                                check_flash_sale_availability / increment_flash_sale_sold RPC
                                check_raffle_availability RPC (파라미터: p_raffle_id, p_customer_phone)
010_add_place_order_rpc.sql     place_order / decrement_stock RPC
```

---

## ⚠️ 주의사항

1. **`useDeviceType` 감지 기준**: `pointer:coarse` 기기는 width ≥ 768px여도 `phone`으로 분류됨 (소형 안드로이드 배려)
2. **`CustomerView`의 `sharedProps`**: 새로운 기기별 컴포넌트를 추가할 경우 `sharedProps`에 필요한 props를 추가해야 함
3. **`AdminTabletView`의 `setCurrentImages`**: `logic`에서 직접 구조분해 안 됨 — `logic.setCurrentImages`로 접근
4. **빌드 검증**: 변경 후 반드시 `npm run build`로 exit code 0 확인
5. **미니모드 리사이즈**: 화면 크기 변경 시 미니모드 위치가 비율로 재계산됨 (`LiveCommerceView.jsx` useEffect)
6. **SQL RPC 파라미터 명명 규칙**: 테이블 컬럼명과 충돌 방지를 위해 `p_` 접두사 사용 (`p_raffle_id`, `p_customer_phone` 등)
7. **Supabase JS v2 주의**: `supabase.raw()` 미존재 — 원자적 증가는 SELECT 후 UPDATE 패턴 사용
8. **`isSupabaseConfigured()` 의존성**: TanStack Query의 모든 `enabled` 옵션은 반드시 `isSupabaseConfigured()`를 포함해야 함
9. **새 RPC 추가 시**: JS 호출부 파라미터명과 SQL 함수 시그니처를 항상 동기화 확인

---

## 🚀 다음 세션 시작 방법

1. 이 파일 읽기
2. `npm run build`로 현재 상태 확인 (exit code 0, 500KB 경고 없음이 정상)
3. 신규 기능 개발 시작
