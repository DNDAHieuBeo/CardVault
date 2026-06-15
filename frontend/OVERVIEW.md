# YugiDeck — Frontend Overview

## Tổng quan

Frontend của **YugiDeck** là một Single Page Application (SPA) được xây dựng bằng Angular 21, cung cấp giao diện người dùng để quản lý bộ bài, bộ sưu tập thẻ bài, và các tiện ích trong trận đấu Yu-Gi-Oh!.

---

## Tech Stack

| Thành phần | Công nghệ | Phiên bản |
|---|---|---|
| Framework | Angular | ^21.2.0 |
| Language | TypeScript | ~5.9.2 |
| State Management | Angular Signals (built-in) | 21 |
| Styling | TailwindCSS | ^3.4.19 |
| HTTP | Angular HttpClient | 21 |
| Drag & Drop | @angular/cdk | ^21.2.14 |
| SSR | @angular/ssr + Express 5 | 21 |
| Test | Vitest | ^4.0.8 |
| Formatter | Prettier | ^3.4.19 |

---

## Cấu trúc thư mục

```
frontend/
├── src/
│   ├── app/
│   │   ├── app.ts               ← Root component
│   │   ├── app.html
│   │   ├── app.routes.ts        ← Routing chính
│   │   ├── app.config.ts        ← App-level providers (CSR)
│   │   ├── app.config.server.ts ← App-level providers (SSR)
│   │   └── app.routes.server.ts ← SSR routes
│   ├── main.ts                  ← Bootstrap (CSR)
│   ├── main.server.ts           ← Bootstrap (SSR)
│   ├── server.ts                ← Express server cho SSR
│   ├── index.html
│   └── styles.scss              ← Global styles + Tailwind imports
├── public/
│   └── favicon.ico
├── angular.json
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

> Lưu ý: Các thư mục features, services, guards, interceptors chưa được tạo — đây là cấu trúc mục tiêu theo kế hoạch dự án.

---

## Cấu trúc mục tiêu (theo kế hoạch)

```
src/app/
├── core/
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── card.service.ts
│   │   ├── collection.service.ts
│   │   ├── deck.service.ts
│   │   └── duel.service.ts
│   ├── guards/
│   │   └── auth.guard.ts
│   └── interceptors/
│       └── jwt.interceptor.ts
├── features/
│   ├── auth/           ← Login, Register
│   ├── cards/          ← Card Browser
│   ├── collection/     ← My Collection
│   ├── decks/          ← Deck List + Deck Builder
│   └── duel/           ← Score Board + Timer + Dice
└── shared/
    └── components/
        ├── card-thumbnail/
        └── lp-display/
```

---

## Tính năng chính (kế hoạch)

| Tính năng | Mô tả |
|---|---|
| Card Browser | Duyệt ~12,000 thẻ bài, lọc theo type/attribute/race/archetype |
| My Collection | Quản lý bộ sưu tập cá nhân, theo dõi số lượng từng thẻ |
| Deck Builder | Tạo và chỉnh sửa bộ bài với drag-and-drop (CDK), validate tự động |
| Score Board | Theo dõi LP 2 người chơi (bắt đầu 8000), lịch sử thay đổi LP |
| Duel Timer | Đồng hồ đếm ngược / bấm giờ cho trận đấu có giới hạn thời gian |
| Dice & Coin | Tung xúc xắc (1d6, 2d6) và tung đồng xu, lưu lịch sử kết quả |

---

## Routing (kế hoạch)

```typescript
// app.routes.ts
{ path: '', redirectTo: 'cards', pathMatch: 'full' }
{ path: 'login', component: LoginComponent }
{ path: 'register', component: RegisterComponent }
// Protected routes (canActivate: authGuard):
{ path: 'cards' }         ← Card Browser
{ path: 'collection' }    ← My Collection
{ path: 'decks' }         ← Deck List
{ path: 'decks/:id' }     ← Deck Builder
{ path: 'duel' }          ← Score Board
```

Tất cả feature components được **lazy-load** để tối ưu bundle size.

---

## Authentication

- JWT access token lưu trong **memory** (không lưu localStorage — bảo mật hơn)
- Refresh token lưu trong **localStorage** (tự động gia hạn khi access token hết hạn)
- `jwt.interceptor.ts` tự động gắn `Authorization: Bearer {token}` vào mọi request
- `auth.guard.ts` bảo vệ tất cả route yêu cầu đăng nhập

---

## State Management

Sử dụng **Angular Signals** (built-in Angular 16+) cho reactive state — không cần NgRx hay RxJS Subject cho state đơn giản.

```typescript
// Ví dụ: DuelService
player1LP = signal(8000);
player2LP = signal(8000);
updateLP(player: 1 | 2, delta: number) { ... }
```

---

## Kết nối Backend

```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7001/api'
};
```

---

## Trạng thái phát triển hiện tại

### Đã hoàn thành ✅
- Angular project khởi tạo với SSR (Server-Side Rendering)
- TailwindCSS tích hợp
- Angular CDK (@angular/cdk) cài đặt
- Prettier cấu hình
- Vitest cho unit testing
- Cấu trúc file gốc (app.ts, app.routes.ts, app.config.ts)

### Chưa thực hiện ⏳
- Tất cả features (auth, cards, collection, decks, duel)
- Core services, guards, interceptors
- Shared components
- Routing cấu hình đầy đủ
- Kết nối với backend API

---

## Lệnh thường dùng

```bash
# Cài dependencies
npm install

# Chạy dev server (http://localhost:4200)
npm start

# Build production
npm run build

# Chạy SSR server
npm run serve:ssr:frontend

# Chạy tests
npm test

# Build và watch (dev)
npm run watch
```

---

*Cập nhật: tháng 6/2026*
