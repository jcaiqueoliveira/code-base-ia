# CLAUDE.md

## Projects & Ports

| Service  | Stack                | Port | Location         |
| -------- | -------------------- | ---- | ---------------- |
| Backend  | Express (TypeScript) | 3000 | `src/`           |
| Database | PostgreSQL 18.4      | 5432 | `docker/`        |

The backend listens on port **3000** (`apps/server/src/index.ts`). The database runs on the default PostgreSQL port **5432**
(user `postgres`, password `123456`, database `example-api`).

## Install Dependencies

```bash
cd apps/server && npm install                      # backend (root)
```

## Run

```bash
# Backend (Express on :3000) — Node runs the TypeScript entrypoint directly
node apps/server/src/index.ts
```

> The backend needs the database running (see below) before it can serve requests.

## Database (Docker)

A PostgreSQL container is defined in `docker-compose.yaml` and runs on port
**5432**. On first start it initializes the schema from `database/create.sql`.

```bash
npm run docker:up    # start the database (detached)
npm run docker:down  # stop the database and remove its volume (-v)
```

## Coding Standards

> **MANDATORY:** Whenever ANY application code is created or changed in this project, the
> **`code-standards` skill** MUST be loaded — without exception. This applies to every
> code change: new files, new functions, new endpoints, new components, bug fixes,
> refactors, or any other modification to application code under `src/`.
> Before writing or editing code, load
> [.claude/skills/code-standards/](.claude/skills/code-standards/SKILL.md) and follow it.
> If you are about to touch code and have not loaded the skill, STOP and load it first.

This project ships a **`code-standards` skill** that defines how code is written and
structured. Whenever you write, refactor, or review application code — or the user asks
to clean up, simplify, or review code for style — use the skill in
[.claude/skills/code-standards/](.claude/skills/code-standards/SKILL.md); it is the
reference for method length, parameters, variable scope, error handling, comments, magic
numbers, nesting, and ternaries. Claude loads it automatically when a task touches code.