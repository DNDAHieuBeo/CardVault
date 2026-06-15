# YugiDeck — Project Context for Claude Agent

> This file is the single source of truth for the YugiDeck project.
> Read this entire file before writing any code, suggesting changes, or answering questions about the project.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Solution Structure](#3-solution-structure)
4. [Database Schema](#4-database-schema)
5. [Backend API — All Endpoints](#5-backend-api--all-endpoints)
6. [External API — YGOPRODeck](#6-external-api--ygoprodeck)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Frontend — Angular 20](#8-frontend--angular-20)
9. [Business Rules & Validation](#9-business-rules--validation)
10. [Coding Conventions](#10-coding-conventions)
11. [Environment & Configuration](#11-environment--configuration)
12. [Development Progress](#12-development-progress)

---

## 1. Project Overview

**YugiDeck** is a full-stack web application for Yu-Gi-Oh! players to manage their card collection, build decks, track duel scores, and use in-game utilities during matches.

### Core Features

| Feature | Description |
|---|---|
| Card Manager | Browse all Yu-Gi-Oh! cards synced from YGOPRODeck API, manage personal collection with quantity tracking |
| Deck Builder | Create and edit decks with drag-and-drop, auto-validate against official rules and TCG banlist |
| Score Board | Track Life Points for 2 players during a duel, starting at 8000 LP each, with full LP history log |
| Duel Timer | Countdown or stopwatch timer for timed duel matches |
| Dice & Coin | In-game dice roll (1d6, 2d6) and coin flip utilities with result history |

---

## 2. Tech Stack

### Backend

| Layer | Technology | Version |
|---|---|---|
| Runtime | .NET | 8.0 |
| Framework | ASP.NET Core Web API | 8.0 |
| ORM | Entity Framework Core | 8.x |
| Database | SQLite (dev) / PostgreSQL (prod) | - |
| Auth | ASP.NET Core Identity + JWT Bearer | 8.x |
| Mapping | AutoMapper | 12.x |
| HTTP Client | IHttpClientFactory (.NET built-in) | 8.0 |
| API Docs | Swagger / Swashbuckle | 6.x |

### Frontend

| Layer | Technology | Version |
|---|---|---|
| Framework | Angular | 20 |
| Language | TypeScript | 5.x |
| State Management | Angular Signals (built-in) | 20 |
| Styling | TailwindCSS | 3.x |
| HTTP | Angular HttpClient | 20 |
| Drag & Drop | @angular/cdk/drag-drop | 20 |
| Components | Angular Standalone Components | 20 |

### External Services

| Service | Purpose | URL |
|---|---|---|
| YGOPRODeck API | Card data source (free, no API key needed) | `https://db.ygoprodeck.com/api/v7/` |

---

## 3. Solution Structure

```
YugiDeck/                                  ← Solution root
├── YugiDeck.sln
│
├── YugiDeck.API/                          ← ASP.NET Core Web API (entry point)
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── CardsController.cs
│   │   ├── CollectionController.cs
│   │   ├── DecksController.cs
│   │   └── DuelsController.cs
│   ├── Program.cs                         ← DI registration, middleware pipeline
│   ├── appsettings.json
│   ├── appsettings.Development.json
│   └── YugiDeck.API.csproj
│
├── YugiDeck.Core/                         ← Domain layer (no dependencies)
│   ├── Entities/
│   │   ├── Card.cs
│   │   ├── UserCard.cs
│   │   ├── Deck.cs
│   │   ├── DeckCard.cs
│   │   ├── Duel.cs
│   │   └── LPLog.cs
│   ├── DTOs/
│   │   ├── Auth/
│   │   │   ├── RegisterDto.cs
│   │   │   ├── LoginDto.cs
│   │   │   └── AuthResponseDto.cs
│   │   ├── Cards/
│   │   │   ├── CardDto.cs
│   │   │   └── CardFilterDto.cs
│   │   ├── Collection/
│   │   │   ├── UserCardDto.cs
│   │   │   └── UpdateQuantityDto.cs
│   │   ├── Decks/
│   │   │   ├── DeckDto.cs
│   │   │   ├── CreateDeckDto.cs
│   │   │   ├── SaveDeckDto.cs
│   │   │   └── DeckValidationResultDto.cs
│   │   └── Duels/
│   │       ├── DuelDto.cs
│   │       ├── CreateDuelDto.cs
│   │       ├── UpdateLPDto.cs
│   │       └── LPLogDto.cs
│   ├── Interfaces/
│   │   ├── ICardRepository.cs
│   │   ├── IDeckRepository.cs
│   │   ├── IDuelRepository.cs
│   │   └── IYgoApiService.cs
│   └── YugiDeck.Core.csproj
│
└── YugiDeck.Infrastructure/               ← Data access + external services
    ├── Data/
    │   ├── AppDbContext.cs
    │   └── Migrations/                    ← EF Core auto-generated
    ├── Repositories/
    │   ├── CardRepository.cs
    │   ├── DeckRepository.cs
    │   └── DuelRepository.cs
    ├── Services/
    │   └── YgoApiService.cs               ← HTTP client for YGOPRODeck
    └── YugiDeck.Infrastructure.csproj
```

### Project References

```
YugiDeck.API → YugiDeck.Core
YugiDeck.API → YugiDeck.Infrastructure
YugiDeck.Infrastructure → YugiDeck.Core
```

---

## 4. Database Schema

### Entity: `Card`

Synced from YGOPRODeck API. Never modified by users directly.

```csharp
public class Card
{
    public int Id { get; set; }           // YGOPRODeck passcode (8-digit)
    public string Name { get; set; }
    public string Type { get; set; }      // "Effect Monster", "Spell Card", etc.
    public string FrameType { get; set; } // "effect", "spell", "trap", "xyz", etc.
    public string Desc { get; set; }
    public int? Atk { get; set; }
    public int? Def { get; set; }
    public int? Level { get; set; }
    public string? Race { get; set; }     // Monster race OR Spell/Trap subtype
    public string? Attribute { get; set; }// DARK, LIGHT, WATER, FIRE, EARTH, WIND
    public string? Archetype { get; set; }
    public string? ImageUrl { get; set; }
    public string? ImageUrlSmall { get; set; }
    public string? BanTcg { get; set; }  // "Banned", "Limited", "Semi-Limited"
    public string? BanOcg { get; set; }
    public DateTime SyncedAt { get; set; }
}
```

### Entity: `UserCard` (Collection)

```csharp
public class UserCard
{
    public int Id { get; set; }
    public string UserId { get; set; }    // FK → AspNetUsers.Id
    public int CardId { get; set; }       // FK → Cards.Id
    public int Quantity { get; set; }     // How many copies the user owns
    public Card Card { get; set; }
}
// Unique index on (UserId, CardId)
```

### Entity: `Deck`

```csharp
public class Deck
{
    public int Id { get; set; }
    public string UserId { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public ICollection<DeckCard> DeckCards { get; set; }
}
```

### Entity: `DeckCard`

```csharp
public class DeckCard
{
    public int Id { get; set; }
    public int DeckId { get; set; }
    public int CardId { get; set; }
    public string Section { get; set; }  // "main" | "extra" | "side"
    public Deck Deck { get; set; }
    public Card Card { get; set; }
}
```

### Entity: `Duel`

```csharp
public class Duel
{
    public int Id { get; set; }
    public string UserId { get; set; }
    public string Player1Name { get; set; }
    public string Player2Name { get; set; }
    public int Player1LP { get; set; }   // Default: 8000
    public int Player2LP { get; set; }   // Default: 8000
    public string Status { get; set; }   // "active" | "ended"
    public string? WinnerId { get; set; }// "player1" | "player2"
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public ICollection<LPLog> LPLogs { get; set; }
}
```

### Entity: `LPLog`

```csharp
public class LPLog
{
    public int Id { get; set; }
    public int DuelId { get; set; }
    public int PlayerNumber { get; set; } // 1 or 2
    public int Delta { get; set; }        // Negative = damage, Positive = heal
    public int NewValue { get; set; }     // LP value after this change
    public DateTime Timestamp { get; set; }
    public Duel Duel { get; set; }
}
```

### AppDbContext

```csharp
public class AppDbContext : IdentityDbContext<IdentityUser>
{
    public DbSet<Card> Cards => Set<Card>();
    public DbSet<UserCard> UserCards => Set<UserCard>();
    public DbSet<Deck> Decks => Set<Deck>();
    public DbSet<DeckCard> DeckCards => Set<DeckCard>();
    public DbSet<Duel> Duels => Set<Duel>();
    public DbSet<LPLog> LPLogs => Set<LPLog>();
}
```

---

## 5. Backend API — All Endpoints

All endpoints except Auth are protected with `[Authorize]` (JWT Bearer).
Base URL (development): `https://localhost:7001/api`

### Auth — `/api/auth`

| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/auth/register` | `{ username, email, password }` | Register new user |
| POST | `/auth/login` | `{ email, password }` | Login, returns JWT + refreshToken |
| POST | `/auth/refresh` | `{ refreshToken }` | Get new access token |

**Login response:**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "abc123...",
  "expiresIn": 3600,
  "userId": "guid",
  "username": "hieuleo"
}
```

---

### Cards — `/api/cards`

| Method | Endpoint | Query Params | Description |
|---|---|---|---|
| GET | `/cards` | `page, pageSize, fname, type, attribute, race, archetype, sort` | Search/filter all cards from local DB |
| GET | `/cards/{id}` | - | Get single card detail by passcode |
| GET | `/cards/archetypes` | - | List all archetypes (for dropdown filter) |
| POST | `/cards/sync` | - | Trigger full sync from YGOPRODeck API (admin) |
| GET | `/cards/dbversion` | - | Compare local DB version vs YGOPRODeck |

**GET /cards response:**
```json
{
  "data": [
    {
      "id": 46986414,
      "name": "Dark Magician",
      "type": "Normal Monster",
      "frameType": "normal",
      "desc": "The ultimate wizard in terms of attack and defense.",
      "atk": 2500,
      "def": 2100,
      "level": 7,
      "race": "Spellcaster",
      "attribute": "DARK",
      "archetype": "Dark Magician",
      "imageUrl": "https://images.ygoprodeck.com/images/cards/46986414.jpg",
      "imageUrlSmall": "https://images.ygoprodeck.com/images/cards_small/46986414.jpg",
      "banTcg": null,
      "banOcg": null
    }
  ],
  "totalCount": 1,
  "page": 1,
  "pageSize": 20,
  "totalPages": 1
}
```

---

### Collection — `/api/collection`

| Method | Endpoint | Body / Query | Description |
|---|---|---|---|
| GET | `/collection` | `page, pageSize, fname, type` | Get current user's card collection |
| POST | `/collection` | `{ cardId, quantity }` | Add card to collection |
| PATCH | `/collection/{cardId}/quantity` | `{ quantity }` | Update quantity of a card |
| DELETE | `/collection/{cardId}` | - | Remove card from collection |

---

### Decks — `/api/decks`

| Method | Endpoint | Body | Description |
|---|---|---|---|
| GET | `/decks` | - | Get all decks belonging to current user |
| GET | `/decks/{id}` | - | Get deck detail with all cards grouped by section |
| POST | `/decks` | `{ name, description }` | Create empty deck |
| PUT | `/decks/{id}` | `{ name, description, mainDeck[], extraDeck[], sideDeck[] }` | Save entire deck (full replace) |
| POST | `/decks/{id}/cards` | `{ cardId, section }` | Add single card to a section |
| DELETE | `/decks/{id}/cards/{cardId}?section=main` | - | Remove card from a section |
| GET | `/decks/{id}/validate` | - | Validate deck against official rules + TCG banlist |
| DELETE | `/decks/{id}` | - | Delete deck |

**GET /decks/{id} response:**
```json
{
  "id": 1,
  "name": "Dark Magician Control",
  "description": "Classic DM deck",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-02T00:00:00Z",
  "mainDeck": [ { "cardId": 46986414, "name": "Dark Magician", ... } ],
  "extraDeck": [],
  "sideDeck": [],
  "mainDeckCount": 40,
  "extraDeckCount": 0,
  "sideDeckCount": 0
}
```

**GET /decks/{id}/validate response:**
```json
{
  "isValid": false,
  "errors": [
    "Main deck must have between 40 and 60 cards (currently 38)",
    "Pot of Greed is Banned in TCG format"
  ]
}
```

---

### Duels — `/api/duels`

| Method | Endpoint | Body | Description |
|---|---|---|---|
| GET | `/duels` | `page, pageSize` | Get duel history for current user |
| POST | `/duels` | `{ player1Name, player2Name }` | Create new duel session (LP starts at 8000 each) |
| GET | `/duels/{id}` | - | Get current duel state (LP, status, winner) |
| POST | `/duels/{id}/lp` | `{ playerNumber, delta }` | Update LP — delta negative = damage, positive = heal |
| GET | `/duels/{id}/history` | - | Get full LP change log |
| PATCH | `/duels/{id}/end` | `{ winnerId }` | End duel and record winner |

**POST /duels/{id}/lp example:**
```json
// Request — Player 1 takes 2000 damage
{ "playerNumber": 1, "delta": -2000 }

// Response
{
  "playerNumber": 1,
  "previousLP": 8000,
  "delta": -2000,
  "newLP": 6000,
  "isDead": false
}
```

---

## 6. External API — YGOPRODeck

Base URL: `https://db.ygoprodeck.com/api/v7/`
- No API key required
- Rate limit: **20 requests per second** — never call in real-time from frontend
- All card images must be **downloaded and stored locally** — do NOT hotlink

### Endpoints Used

| Endpoint | Purpose | When Called |
|---|---|---|
| `GET /cardinfo.php` | Fetch all card data | Initial seed + periodic sync |
| `GET /cardinfo.php?fname=&type=&attribute=...` | Filter cards | Only for testing in Postman |
| `GET /archetypes.php` | Fetch all archetype names | Initial seed |
| `GET /cardsets.php` | Fetch all card set names | Initial seed (optional) |
| `GET /checkDBVer.php` | Check if DB has updates | Daily sync job |

### Sync Strategy

1. On first run → call `GET /cardinfo.php` (no params) → fetch all ~12,000 cards → save to local DB
2. Daily background job → call `checkDBVer.php` → compare with stored version → if different, re-sync
3. All runtime card queries go to **local DB only**, never to YGOPRODeck directly

### Card Response Shape from YGOPRODeck

```json
{
  "data": [
    {
      "id": 46986414,
      "name": "Dark Magician",
      "type": "Normal Monster",
      "frameType": "normal",
      "desc": "The ultimate wizard...",
      "atk": 2500,
      "def": 2100,
      "level": 7,
      "race": "Spellcaster",
      "attribute": "DARK",
      "archetype": "Dark Magician",
      "card_images": [
        {
          "id": 46986414,
          "image_url": "https://images.ygoprodeck.com/images/cards/46986414.jpg",
          "image_url_small": "https://images.ygoprodeck.com/images/cards_small/46986414.jpg",
          "image_url_cropped": "https://images.ygoprodeck.com/images/cards_cropped/46986414.jpg"
        }
      ],
      "banlist_info": {
        "ban_tcg": "Banned",
        "ban_ocg": "Limited"
      }
    }
  ]
}
```

---

## 7. Authentication & Authorization

### Flow

1. User calls `POST /auth/register` or `POST /auth/login`
2. Server returns a short-lived **JWT access token** (1 hour) and a **refresh token** (7 days)
3. Frontend stores tokens in memory (access token) and localStorage (refresh token)
4. Every API request includes `Authorization: Bearer {accessToken}` header
5. When access token expires, frontend calls `POST /auth/refresh` automatically

### JWT Configuration (appsettings.json)

```json
{
  "JwtSettings": {
    "SecretKey": "your-super-secret-key-minimum-32-chars",
    "Issuer": "YugiDeckAPI",
    "Audience": "YugiDeckClient",
    "ExpiryMinutes": 60
  }
}
```

### Postman Variables

| Variable | Value |
|---|---|
| `baseUrl` | `https://localhost:7001/api` |
| `jwtToken` | _(auto-set by Login test script)_ |
| `deckId` | _(set manually after creating a deck)_ |
| `duelId` | _(set manually after creating a duel)_ |
| `cardId` | _(set manually)_ |

**Postman Login Tests script** (auto-saves token):
```javascript
const res = pm.response.json();
pm.collectionVariables.set("jwtToken", res.accessToken);
```

**Postman Auth header** (set on collection level):
```
Authorization: Bearer {{jwtToken}}
```

---

## 8. Frontend — Angular 20

### Project Structure

```
yugi-deck-frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── card.service.ts
│   │   │   │   ├── collection.service.ts
│   │   │   │   ├── deck.service.ts
│   │   │   │   └── duel.service.ts
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts
│   │   │   └── interceptors/
│   │   │       └── jwt.interceptor.ts
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── cards/
│   │   │   │   └── card-browser/
│   │   │   ├── collection/
│   │   │   │   └── my-collection/
│   │   │   ├── decks/
│   │   │   │   ├── deck-list/
│   │   │   │   └── deck-builder/
│   │   │   └── duel/
│   │   │       ├── score-board/
│   │   │       ├── duel-timer/
│   │   │       └── dice-roller/
│   │   ├── shared/
│   │   │   └── components/
│   │   │       ├── card-thumbnail/
│   │   │       └── lp-display/
│   │   ├── app.routes.ts
│   │   └── app.config.ts
│   └── environments/
│       ├── environment.ts
│       └── environment.prod.ts
```

### Routing

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: '', redirectTo: 'cards', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: 'cards', loadComponent: () => import('./features/cards/card-browser/card-browser.component') },
      { path: 'collection', loadComponent: () => import('./features/collection/my-collection/my-collection.component') },
      { path: 'decks', loadComponent: () => import('./features/decks/deck-list/deck-list.component') },
      { path: 'decks/:id', loadComponent: () => import('./features/decks/deck-builder/deck-builder.component') },
      { path: 'duel', loadComponent: () => import('./features/duel/score-board/score-board.component') },
    ]
  }
];
```

### State Management with Signals

```typescript
// Example: DuelService using signals
@Injectable({ providedIn: 'root' })
export class DuelService {
  player1LP = signal(8000);
  player2LP = signal(7500);  // Updated reactively

  updateLP(player: 1 | 2, delta: number) {
    if (player === 1) {
      this.player1LP.update(lp => Math.max(0, lp + delta));
    } else {
      this.player2LP.update(lp => Math.max(0, lp + delta));
    }
  }
}
```

### Environment Config

```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7001/api'
};
```

---

## 9. Business Rules & Validation

### Deck Rules (enforced in `DeckService` on backend)

| Rule | Constraint |
|---|---|
| Main deck size | Minimum 40, maximum 60 cards |
| Extra deck size | Maximum 15 cards |
| Side deck size | Maximum 15 cards |
| Copies per card | Maximum 3 copies of the same card across main + side |
| Banned cards | 0 copies allowed (TCG banlist) |
| Limited cards | Maximum 1 copy |
| Semi-Limited cards | Maximum 2 copies |
| Extra deck cards | Only Fusion, Synchro, XYZ, Link monsters allowed in extra deck |

### LP Rules (enforced in `DuelService` on backend)

| Rule | Constraint |
|---|---|
| Starting LP | 8000 per player |
| Minimum LP | 0 (cannot go negative) |
| Win condition | LP reaches 0 |
| LP change types | +500, +1000, -500, -1000, or manual input |
| LP history | Every change is logged with timestamp |

### Card Quantity Rules (Collection)

| Rule | Constraint |
|---|---|
| Minimum quantity | 1 (0 = remove from collection) |
| Maximum quantity | No hard limit (depends on user) |

---

## 10. Coding Conventions

### Backend (.NET)

- **Controllers** are thin — no business logic, only call services/repositories
- **DTOs** are used for all request/response shapes, never expose entities directly
- **Repositories** handle all DB queries, return domain entities
- **Services** contain business logic (validation, orchestration)
- **Async/await** everywhere — all controller actions and repository methods are async
- **Naming**: PascalCase for classes/methods, camelCase for local variables
- **Error handling**: Return proper HTTP status codes — 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 500 (server error)

```csharp
// Controller pattern
[HttpPost]
public async Task<IActionResult> CreateDeck([FromBody] CreateDeckDto dto)
{
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    var deck = await _deckService.CreateAsync(userId, dto);
    return CreatedAtAction(nameof(GetById), new { id = deck.Id }, deck);
}
```

### Frontend (Angular)

- **Standalone components** only — no NgModule
- **Signals** for reactive state, avoid RxJS Subject for simple state
- **HttpClient** with typed responses using generics
- **Lazy loading** for all feature routes
- **Guard** protects all authenticated routes
- **Interceptor** automatically attaches JWT to every request

```typescript
// HTTP Interceptor pattern
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next(req);
};
```

---

## 11. Environment & Configuration

### appsettings.json (YugiDeck.API)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=yugideck.db"
  },
  "JwtSettings": {
    "SecretKey": "your-super-secret-key-minimum-32-characters-long",
    "Issuer": "YugiDeckAPI",
    "Audience": "YugiDeckClient",
    "ExpiryMinutes": 60,
    "RefreshTokenExpiryDays": 7
  },
  "YgoApi": {
    "BaseUrl": "https://db.ygoprodeck.com/api/v7/",
    "RateLimitPerSecond": 20
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

### Program.cs (current state)

```csharp
using Microsoft.EntityFrameworkCore;
using YugiDeck.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

### NuGet Packages Installed

**YugiDeck.API:**
- `Microsoft.EntityFrameworkCore.Design`
- `Microsoft.AspNetCore.Authentication.JwtBearer`
- `AutoMapper.Extensions.Microsoft.DependencyInjection`
- `Swashbuckle.AspNetCore`

**YugiDeck.Infrastructure:**
- `Microsoft.EntityFrameworkCore.Sqlite`
- `Microsoft.EntityFrameworkCore.Design`
- `Microsoft.AspNetCore.Identity.EntityFrameworkCore`
- `Microsoft.Extensions.Http`

### EF Core Migration Commands (run from YugiDeck.API folder)

```bash
# Create a new migration
dotnet ef migrations add <MigrationName> --project ../YugiDeck.Infrastructure --startup-project .

# Apply migrations to DB
dotnet ef database update --project ../YugiDeck.Infrastructure --startup-project .

# Remove last migration (if not applied)
dotnet ef migrations remove --project ../YugiDeck.Infrastructure --startup-project .
```

---

## 12. Development Progress

### Completed ✅

- [x] Solution created with 3 projects: `API`, `Core`, `Infrastructure`
- [x] Project references configured
- [x] All NuGet packages installed
- [x] All domain entities defined (`Card`, `UserCard`, `Deck`, `DeckCard`, `Duel`, `LPLog`)
- [x] `AppDbContext` configured with Identity
- [x] `appsettings.json` configured with SQLite connection string
- [x] `Program.cs` configured with DbContext registration + Swagger
- [x] Initial EF Core migration created and applied (`InitialCreate`)
- [x] SQLite DB file created (`yugideck.db`)

### In Progress 🚧

- [ ] `Program.cs` — add JWT Auth, Identity, AutoMapper, HttpClient, CORS
- [ ] `AuthController` — register, login, refresh token
- [ ] `CardsController` + `YgoApiService` — seed from YGOPRODeck, search/filter
- [ ] `CollectionController` — CRUD user card collection
- [ ] `DecksController` + deck validation logic
- [ ] `DuelsController` + LP tracking

### Pending ⏳

- [ ] Angular 20 frontend project setup
- [ ] JWT interceptor + auth guard
- [ ] Card browser UI
- [ ] Deck builder with drag-and-drop
- [ ] Score board (8000 LP, cộng/trừ buttons, history)
- [ ] Duel timer (countdown + stopwatch)
- [ ] Dice & coin roller UI

---

## Quick Reference — Common Card Types

**Main Deck Types:** Effect Monster, Normal Monster, Ritual Monster, Spell Card, Trap Card, Tuner Monster, Flip Effect Monster, Spirit Monster, Toon Monster, Union Effect Monster, Gemini Monster

**Extra Deck Types:** Fusion Monster, Synchro Monster, XYZ Monster, Link Monster (and Pendulum variants)

**Attributes:** DARK, LIGHT, WATER, FIRE, EARTH, WIND, DIVINE

**Monster Races:** Spellcaster, Warrior, Dragon, Beast, Machine, Fiend, Fairy, Aqua, Insect, Dinosaur, Rock, Reptile, Plant, Thunder, Zombie, Fish, Sea Serpent, Psychic, Cyberse, Wyrm, Divine-Beast

**Banlist Values:** `"Banned"` (0 copies), `"Limited"` (1 copy), `"Semi-Limited"` (2 copies), `null` (3 copies allowed)

---

*Last updated: June 2026 — YugiDeck project context file for Claude Code agent*
