# Capitolo 2bis — Vista C4 (Container & Component)

> **Prerequisito:** [Cap. 1](./01-fondamenta-architetturali-e-flusso-richiesta.md), [Cap. 2](./02-livello-dati-architettura-stato-type-safety.md)

---

## 2bis.1 Diagramma container

```mermaid
flowchart TB
    User[Utente staff]
    subgraph browser [Browser]
        SPA[gestionale-app SPA]
    end
    subgraph render_fe [Render · Static]
        CDN[Frontend build]
    end
    subgraph render_be [Render · Web Service]
        NODE[Node 18+ · server.js]
        APP[createApp · Express]
    end
    subgraph data_ext [Dati e esterni]
        PG[(PostgreSQL)]
        PGHOST[Render Postgres / Supabase host]
    end
    User --> SPA
    SPA --> CDN
    SPA -->|HTTPS JWT credentials| NODE
    NODE --> APP
    APP --> PG
    PG --- PGHOST
```

---

## 2bis.2 Component map (backend)

```mermaid
flowchart LR
    subgraph bootstrap
        server[server.js]
        app[app.js createApp]
    end
    subgraph middleware
        helmet[helmet]
        reqlog[requestLog]
        cors[cors]
        cookie[cookieParser]
        body[express.json]
        rl[apiLimiter]
        authMw[authenticateToken]
        authz[authorize]
    end
    subgraph routes
        R1[auth]
        R2[clients projects contracts]
        R3[events polls tasks]
        R4[users messages HR]
    end
    subgraph domain
        svc[authService]
        lib[lib/*]
        val[validators]
    end
    DB[(connection.js pool)]
    server --> app
    app --> middleware --> routes
    routes --> svc
    routes --> lib
    routes --> DB
    svc --> DB
```

| Path | Ruolo architetturale |
|------|----------------------|
| `server.js` | bind porta, smoke DB |
| `app.js` | composizione middleware + mount route + error handler |
| `routes/*` | adapter HTTP (target: sottili) |
| `services/*` | use case (oggi: principalmente auth) |
| `lib/*` | policy, token, pagination, access helpers |
| `middleware/*` | cross-cutting per request |
| `database/*` | schema, migrazioni, pool |

---

## 2bis.3 Flusso request/response (end-to-end)

```mermaid
sequenceDiagram
    participant SPA
    participant LB as Render LB
    participant APP as Express
    participant PG as Postgres

    SPA->>LB: GET /api/projects + Authorization
    LB->>APP: forward
    APP->>APP: helmet cors json limiter
    APP->>APP: authenticateToken loadUser
    APP->>PG: SELECT projects ...
    PG-->>APP: rows
    APP-->>SPA: 200 JSON
```

Tempo dominante tipico: **DB + JSON serialize**, non CPU Express.

---

## 2bis.4 Failure esterni

| Punto | Sintomo | Prima azione |
|-------|---------|--------------|
| PostgreSQL down | `/health` `db: error`, 500 su API | status Render DB, `DATABASE_URL` |
| TLS / cert | connessione rifiutata | SSL mode prod in pool |
| CORS prod | 403 Origin | `FRONTEND_URL` lista esatta |
| JWT_SECRET rotato | mass 403 token | logout globale, re-login |
| Deploy rolling | 502 brevi | health check, drain |

```mermaid
flowchart TD
    F[Failure] --> DB{DB raggiungibile?}
    DB -->|no| A1[Ripristino Postgres]
    DB -->|sì| CORS{CORS ok?}
    CORS -->|no| A2[Fix FRONTEND_URL]
    CORS -->|sì| AUTH{Token valido?}
    AUTH -->|no| A3[Refresh / re-login]
```

---

## 2bis.5 Sotto carico ×100 — saturazione

Ordine tipico (allineato Cap. 1 §1.8):

1. **PostgreSQL** — pool, query N+1, lock  
2. **`loadUser` per request** — query utente ripetuta  
3. **Event loop Node** — bcrypt, JSON grandi, log sincrono  
4. **Rate limit in-memory** — non globale tra repliche  

**Backpressure:** assente — Express accetta fino a saturazione; mitigazione = limiter + pool max + scale orizzontale stateless.

---

*Capitolo 2bis — v1*
