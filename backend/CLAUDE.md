# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Build the solution
dotnet build YugiDeck.slnx

# Run the API (http://localhost:5252 or https://localhost:7047)
dotnet run --project YugiDeck.API

# Run tests (once test projects exist)
dotnet test YugiDeck.slnx

# Add EF Core migration (run from solution root)
dotnet ef migrations add <MigrationName> --project YugiDeck.Infrastructure --startup-project YugiDeck.API

# Apply migrations
dotnet ef database update --project YugiDeck.Infrastructure --startup-project YugiDeck.API
```

## Architecture

This is a Clean Architecture ASP.NET Core Web API (.NET 10) for managing Yu-Gi-Oh decks. Three projects with strict dependency rules:

- **YugiDeck.Core** — Domain layer. Entities, interfaces, DTOs, business rules. No external package dependencies.
- **YugiDeck.Infrastructure** — Data/external services layer. EF Core with SQLite, ASP.NET Identity, HttpClient for external card data APIs. Depends on Core only.
- **YugiDeck.API** — Presentation layer. Controllers/minimal API endpoints, DI wiring, JWT auth middleware, AutoMapper profiles. Depends on both Core and Infrastructure.

### Key packages
- **Database**: Entity Framework Core + SQLite (`YugiDeck.Infrastructure`)
- **Auth**: ASP.NET Identity + JWT Bearer (`YugiDeck.Infrastructure` + `YugiDeck.API`)
- **Mapping**: AutoMapper (`YugiDeck.API`)
- **API docs**: ASP.NET Core OpenAPI at `/openapi/v1.json` in Development

### Database
SQLite database managed via EF Core in `YugiDeck.Infrastructure`. Run migrations from the solution root using the `--startup-project` flag pointing to the API so EF can resolve the connection string from `appsettings.json`.
