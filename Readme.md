# Tracksuit Take-Home Project

Hi 👋 — this repo contains my submission for the Tracksuit take-home.\
I focused less on “just make it work” and more on “make it organised,
future-proof, and easy to extend.”\
(Also: sorry Chuggs, I completely trashed your server code… but you’ll never
know 😉)

---

## Server

The original backend handled a couple of endpoints and one table, but wasn’t
designed to grow.\
So I refactored it into a more structured architecture:

- **Folder structure & pattern**\
  Split responsibilities into:
  - `repositories/` → SQL only
  - `services/` → business logic, transactions, error checks
  - `controllers/` → HTTP ↔ service glue, input validation, error handling
  - `routes/` → connect controllers to Oak router\
    Clear separation means easier reading, testing, and future features.

- **Database migrations**\
  Before: run app → “no such table” error 🙃\
  Now: `server/db/migrations/` holds SQL schema files. They auto-run on startup
  so the DB is always ready.

- **SQL queries**\
  Queries live in `server/db/queries/…` files, loaded once into memory.\
  Easier to read, test, and maintain than inline strings.

- **New endpoints**
  - `POST /api/insights` → create a new insight
  - `DELETE /api/insights/:id` → delete an insight\
    Following REST conventions instead of overusing GET.

- **Error handling**\
  Centralised in `utils/errors.ts`.
  - 404 for missing insights
  - 400 for invalid input (with Zod issues if validation fails)
  - 500 for unexpected errors\
    Clean messages without leaking stack traces.

- **Testing**
  - _Unit tests_ for services (business logic in isolation).
  - _E2E tests_ hitting the actual API with a temp DB (happy paths for
    create/list/delete).\
    Both live in `server/test/` for clarity.

---

## Client

The frontend needed a few fixes and new features:

- **Type consistency**\
  Fixed mismatches between server and client types so `Insight` means the same
  thing everywhere.

- **Creation & deletion**\
  Added a modal form to create new insights and a delete flow to remove them.\
  The list of insights updates in real-time — no manual refresh needed.

- **Delete confirmation**\
  Reused the existing `Modal` component to confirm before deleting.\
  Prevents accidental “oops” deletes.

- **UI polish & bugfixes**\
  Tidied naming conventions, fixed state handling, and surfaced API errors with
  proper messages.

---

## Wrap-up

The codebase is still small, but now it’s organised like a real project that can
scale and survive multiple developers touching it.\
It has clear layering, predictable error handling, working migrations, and tests
that prove the core flows.

For my thoughts on how this could grow into a platform that supports a
20-engineer team (and earns us that helicopter full of sequential USD bills),
see [ExtraForExperts.md](./ExtraForExperts.md).

That’s the story behind the refactor 🚀
