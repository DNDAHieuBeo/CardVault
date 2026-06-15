# YugiDeck — Backend Overview

## Tổng quan

Backend của **YugiDeck** là một REST API được xây dựng theo kiến trúc Clean Architecture, phục vụ ứng dụng quản lý bộ bài và trận đấu Yu-Gi-Oh!. API nhận dữ liệu thẻ bài từ YGOPRODeck (API bên ngoài, miễn phí) và lưu vào cơ sở dữ liệu nội bộ.

---

## Tech Stack

| Thành phần | Công nghệ | Phiên bản |
|---|---|---|
| Runtime | .NET | 10.0 |
| Framework | ASP.NET Core Web API | 10.0 |
| ORM | Entity Framework Core | 10.x |
| Database | SQLite (dev) / PostgreSQL (prod) | - |
| Auth | ASP.NET Core Identity + JWT Bearer | - |
| Mapping | AutoMapper | 12.x |
| API Docs | Swagger / OpenAPI | - |

---

## Cấu trúc Solution

```
backend/
├── YugiDeck.slnx
├── YugiDeck.API/               ← Entry point — Controllers, DI, middleware
│   └── Program.cs
├── YugiDeck.Core/              ← Domain layer — Entities, DTOs, Interfaces
│   ├── Card.cs
│   ├── UserCard.cs
│   ├── Deck.cs
│   ├── DeckCard.cs
│   ├── Duel.cs
│   └── LPLog.cs
└── YugiDeck.Infrastructure/    ← Data access + external services
    ├── Data/
    │   ├── AppDbContext.cs
    │   └── Migrations/
    └── Class1.cs               ← (placeholder, chưa implement)
```

### Quy tắc phụ thuộc

```
YugiDeck.API → YugiDeck.Core
YugiDeck.API → YugiDeck.Infrastructure
YugiDeck.Infrastructure → YugiDeck.Core
```

`YugiDeck.Core` **không phụ thuộc vào bất kỳ package bên ngoài nào**.

---

## Domain Entities (đã hoàn thành)

| Entity | Mô tả |
|---|---|
| `Card` | Thẻ bài đồng bộ từ YGOPRODeck — không chỉnh sửa trực tiếp |
| `UserCard` | Bộ sưu tập cá nhân, theo dõi số lượng mỗi thẻ |
| `Deck` | Bộ bài của người dùng, có tên và mô tả |
| `DeckCard` | Quan hệ giữa Deck và Card, phân theo section: main / extra / side |
| `Duel` | Phiên đấu giữa 2 người chơi, bắt đầu với 8000 LP mỗi người |
| `LPLog` | Lịch sử thay đổi LP trong một trận đấu |

---

## Database

- **SQLite** (development): file `yugideck.db` ở thư mục API
- **PostgreSQL** (production): cấu hình qua `appsettings.json`
- Migration khởi tạo (`InitialCreate`) đã được tạo và apply thành công
- `AppDbContext` kế thừa `IdentityDbContext<IdentityUser>` — tích hợp sẵn bảng ASP.NET Identity

---

## API Endpoints (kế hoạch)

Base URL (dev): `https://localhost:7001/api`

| Module | Prefix | Chức năng |
|---|---|---|
| Auth | `/api/auth` | Đăng ký, đăng nhập, refresh token |
| Cards | `/api/cards` | Tìm kiếm, lọc thẻ bài, đồng bộ từ YGOPRODeck |
| Collection | `/api/collection` | Quản lý bộ sưu tập cá nhân |
| Decks | `/api/decks` | Tạo, sửa, xóa bộ bài; validate theo luật TCG |
| Duels | `/api/duels` | Tạo trận đấu, cập nhật LP, xem lịch sử |

Tất cả endpoint (trừ Auth) yêu cầu **JWT Bearer token**.

---

## Trạng thái phát triển hiện tại

### Đã hoàn thành ✅
- Solution với 3 project: API, Core, Infrastructure
- Project references đúng theo Clean Architecture
- Tất cả NuGet packages đã cài
- Tất cả domain entities đã định nghĩa
- `AppDbContext` với Identity
- `appsettings.json` cấu hình SQLite
- `Program.cs` cơ bản (DbContext + Swagger)
- Migration đầu tiên đã apply, SQLite DB đã tạo

### Đang thực hiện 🚧
- `Program.cs` — thêm JWT Auth, Identity, AutoMapper, HttpClient, CORS
- `AuthController` — register, login, refresh token
- `CardsController` + `YgoApiService` — sync từ YGOPRODeck, tìm kiếm
- `CollectionController`, `DecksController`, `DuelsController`

---

## Lệnh thường dùng

```bash
# Build toàn bộ solution
dotnet build YugiDeck.slnx

# Chạy API (http://localhost:5252 / https://localhost:7047)
dotnet run --project YugiDeck.API

# Tạo migration mới (chạy từ thư mục backend/)
dotnet ef migrations add <TênMigration> --project YugiDeck.Infrastructure --startup-project YugiDeck.API

# Apply migration
dotnet ef database update --project YugiDeck.Infrastructure --startup-project YugiDeck.API
```

---

## Business Rules chính

**Deck:**
- Main deck: 40–60 thẻ
- Extra deck: tối đa 15 thẻ
- Side deck: tối đa 15 thẻ
- Mỗi thẻ: tối đa 3 bản (trừ Banned/Limited/Semi-Limited theo TCG banlist)

**Duel:**
- LP bắt đầu: 8000 mỗi người
- LP tối thiểu: 0 (không âm)
- Mọi thay đổi LP đều được log với timestamp

---

*Cập nhật: tháng 6/2026*
