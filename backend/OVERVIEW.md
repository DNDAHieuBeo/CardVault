# YugiDeck — Backend Overview

## Summary

The **YugiDeck** backend is a REST API built with Clean Architecture, serving the Yu-Gi-Oh! deck management application. It syncs card data from the free YGOPRODeck external API and stores it in a local database.

---

## Tech Stack

| Component | Technology | Version |
|---|---|---|
| Runtime | .NET | 10.0 |
| Framework | ASP.NET Core Web API | 10.0 |
| ORM | Entity Framework Core | 10.x |
| Database | SQLite (dev) / PostgreSQL (prod) | - |
| Auth | ASP.NET Core Identity + JWT Bearer | - |
| Mapping | AutoMapper | 12.x |
| API Docs | Swagger / OpenAPI | - |

---

## Solution Structure

```
backend/
├── YugiDeck.slnx
├── YugiDeck.API/                  <- Entry point: Controllers, DI, middleware
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── CardsController.cs
│   │   ├── CollectionController.cs
│   │   ├── DecksController.cs
│   │   └── DuelsController.cs
│   ├── Mapping/
│   │   └── MappingProfile.cs
│   └── Program.cs
├── YugiDeck.Core/                 <- Domain layer: Entities, DTOs, Interfaces
│   ├── Entities/
│   │   ├── Card.cs
│   │   ├── UserCard.cs
│   │   ├── Deck.cs
│   │   ├── DeckCard.cs
│   │   ├── Duel.cs
│   │   ├── LPLog.cs
│   │   └── RefreshToken.cs
│   ├── DTOs/
│   │   ├── Auth/
│   │   ├── Cards/
│   │   ├── Collection/
│   │   ├── Decks/
│   │   └── Duels/
│   └── Interfaces/
│       ├── IAuthService.cs
│       ├── ICardService.cs
│       ├── ICollectionService.cs
│       ├── IDeckService.cs
│       └── IDuelService.cs
└── YugiDeck.Infrastructure/       <- Data access + external services
    ├── Data/
    │   ├── AppDbContext.cs
    │   └── Migrations/
    └── Services/
        ├── AuthService.cs
        ├── CardService.cs
        ├── CollectionService.cs
        ├── DeckService.cs
        └── DuelService.cs
```

### Dependency Rules

```
YugiDeck.API  →  YugiDeck.Core
YugiDeck.API  →  YugiDeck.Infrastructure
YugiDeck.Infrastructure  →  YugiDeck.Core
```

`YugiDeck.Core` has **no external package dependencies**.

---

## Domain Entities

| Entity | Description |
|---|---|
| `Card` | Card data synced from YGOPRODeck — not editable by users |
| `UserCard` | Personal collection entry tracking how many copies a user owns |
| `Deck` | A named deck belonging to a user with name and description |
| `DeckCard` | Junction between Deck and Card, categorized by section: main / extra / side |
| `Duel` | A duel session between 2 players, starting at 8000 LP each |
| `LPLog` | Immutable record of every LP change during a duel |
| `RefreshToken` | Stored refresh token used to renew expired JWT access tokens |

---

## Database

- **SQLite** (development): `yugideck.db` file inside the API project folder
- **PostgreSQL** (production): configured via `appsettings.json`
- `AppDbContext` extends `IdentityDbContext<IdentityUser>` — ASP.NET Identity tables included
- Two migrations applied: `InitialCreate` + `AddRefreshToken`

---

## API Endpoints

Base URL (dev): `http://localhost:5252/api`

All endpoints except `/auth` require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create a new account |
| POST | `/auth/login` | Login and receive JWT + refresh token |
| POST | `/auth/refresh` | Renew access token |
| POST | `/auth/revoke` | Invalidate a refresh token |
| GET | `/cards` | Search and filter all cards (paginated) |
| GET | `/cards/{id}` | Get a single card by ID |
| POST | `/cards/sync` | Trigger full sync from YGOPRODeck |
| GET | `/collection` | Get your card collection |
| POST | `/collection` | Add a card to your collection |
| PATCH | `/collection/{cardId}/quantity` | Update card quantity |
| DELETE | `/collection/{cardId}` | Remove a card from collection |
| GET | `/decks` | List all your decks |
| GET | `/decks/{id}` | Get a deck with all cards by section |
| POST | `/decks` | Create a new deck |
| PUT | `/decks/{id}` | Save / overwrite a full deck |
| DELETE | `/decks/{id}` | Delete a deck |
| GET | `/decks/{id}/validate` | Validate deck against TCG rules + banlist |
| GET | `/duels` | List all your duel sessions |
| GET | `/duels/{id}` | Get a specific duel |
| POST | `/duels` | Start a new duel session |
| POST | `/duels/{id}/lp` | Apply LP damage or heal |
| GET | `/duels/{id}/history` | Get full LP change log |
| POST | `/duels/{id}/end` | Manually end a duel |

---

## Authentication Flow

```
1. POST /auth/register  →  create account
2. POST /auth/login     →  receive accessToken (60 min) + refreshToken (7 days)
3. GET  /api/...        →  send "Authorization: Bearer <accessToken>"
4. POST /auth/refresh   →  when access token expires, exchange refreshToken for new pair
5. POST /auth/revoke    →  logout: invalidate refreshToken in DB
```

---

## Business Rules

### Deck Validation

| Rule | Constraint |
|---|---|
| Main deck size | 40 – 60 cards |
| Extra deck size | Max 15 cards (Fusion / Synchro / XYZ / Link only) |
| Side deck size | Max 15 cards |
| Copies per card | Max 3 across main + side |
| Banned (TCG) | 0 copies allowed |
| Limited (TCG) | Max 1 copy |
| Semi-Limited (TCG) | Max 2 copies |

### Life Points

| Rule | Value |
|---|---|
| Starting LP | 8000 per player |
| Minimum LP | 0 (cannot go negative) |
| Win condition | Opponent LP reaches 0 — duel auto-ends |

---

## Development Progress

### Completed
- [x] Clean Architecture solution (API, Core, Infrastructure)
- [x] All domain entities defined
- [x] AppDbContext with ASP.NET Identity
- [x] EF Core migrations applied (SQLite DB ready)
- [x] JWT Auth + Identity configured in Program.cs
- [x] AuthService — register / login / refresh / revoke
- [x] CardService — search, filter, sync from YGOPRODeck
- [x] CollectionService — CRUD collection
- [x] DeckService — CRUD decks + TCG validation
- [x] DuelService — LP tracking + history
- [x] AutoMapper profile
- [x] All 5 controllers with full CRUD

### Pending
- [ ] Upgrade AutoMapper to fix known vulnerability (v12 → v13+)
- [ ] Add Swagger JWT Authorization button (blocked by Swashbuckle 10.x API change)
- [ ] Add unit tests

---

## Common Commands

```bash
# Build the solution
dotnet build YugiDeck.slnx

# Run the API
dotnet run --project YugiDeck.API

# Create a new migration
dotnet ef migrations add <MigrationName> --project YugiDeck.Infrastructure --startup-project YugiDeck.API

# Apply migrations
dotnet ef database update --project YugiDeck.Infrastructure --startup-project YugiDeck.API
```

API available at:
- Swagger UI: `http://localhost:5252/swagger`
- HTTP: `http://localhost:5252`
- HTTPS: `https://localhost:7047`

---

*Last updated: June 2026*
