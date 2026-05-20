# RBAC — Gestionale JEINS

## Ruolo Socio (associato)

Può solo:

- Segnare presenza alle **call** (RSVP su eventi `is_call`, invitati come partecipante)
- Aggiornare lo **stato dei propri lavori** (task assegnati via `/api/tasks/mytasks` e todo su progetti assegnati)
- Vedere **scadenze** (calendario: eventi a cui è invitato) e **i propri lavori**

Non può: clienti, lista progetti completa, contabilità, inbox, report, dashboard management.

## Fatturato (contratti / contabilità)

Accesso solo a:

- Ruolo **Tesoreria**
- Utenti con **area = Commerciale**
- **Admin** / **IT** (gestione sistema)

CDA, Presidente, Audit, ecc. **non** vedono il fatturato salvo area Commerciale o ruolo Tesoreria.

## Management / Admin

Clienti, progetti, eventi, report, inbox: ruoli privilegiati (`CDA`, `Responsabile`, `Presidente`, `Manager`, `Tesoreria`, `Audit`, `Admin`, `IT`).

## API chiave

| Risorsa | Socio |
|---------|-------|
| `GET /api/clients` | 403 |
| `GET /api/projects` | 403 (usa `/api/projects/my` se assegnato) |
| `GET /api/contracts` | 403 |
| `GET /api/chats` | 403 |
| `GET /api/tasks/mytasks` | Solo task assegnati |
| `PATCH /api/tasks/:id/status` | Solo propri task |
| `POST /api/events/:id/rsvp` | Solo call, se invitato |
| `GET /api/events` | Solo eventi dove è partecipante |

## Frontend

- Permessi in `user.permissions` (da login/verify/`/users/me`)
- Menu (`IconRail`) filtrato per permesso
- Home socio: `/tasks`

## File

- `backend/lib/roles.js`, `backend/lib/permissions.js`
- `gestionale-app/src/lib/permissions.ts`
