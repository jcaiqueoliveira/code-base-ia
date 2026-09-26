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

### No comments in code

`npm run lint:comments` fails on any comment in tracked `.ts`/`.js`/`.sh`/`.sql` files. It uses the
TypeScript parser, so `//` inside a string, URL, regex or template does not count, and a `/* */` in
the middle of an expression does. Only tool directives pass: `biome-ignore`, `@ts-expect-error`, a
shebang, and Drizzle's `--> statement-breakpoint`.

It also runs as a `pre-push` hook (`.githooks/pre-push`, installed by `npm install` through the
`prepare` script). The hook lints the exact commits being pushed, not the working tree.

## Engineering Principles

`code-standards` governs *style*. The principle skills in `.claude/skills/principle-*` govern *how to
think* about a change. Load the leaf skill in full before applying it, and name in the report which
principles shaped a decision and what they changed.

| When | Load |
| --- | --- |
| Before writing logic: types, tables, what concurrent writers share | `principle-foundational-thinking`, `principle-model-the-domain` |
| Any `.ts` file | `typescript-best-practices` → `principle-type-system-discipline` |
| Request input, env, webhook payloads, DB rows — anything crossing in | `principle-boundary-discipline` |
| Anything that can be retried: uploads, webhooks, migrations | `principle-make-operations-idempotent` |
| Two writers on one row or key | `principle-separate-before-serializing-shared-state` |
| Writing or keeping a test | `principle-test-behavior-not-implementation`, `tdd` |
| Before declaring anything done | `principle-prove-it-works` |
| Multi-step work, ordering commits | `principle-sequence-verifiable-units`, `principle-build-the-lever` |
| Sizing a diff, tempted to add a layer | `principle-laziness-protocol`, `principle-subtract-before-you-add`, `principle-minimize-reader-load` |
| Debugging | `principle-fix-root-causes`; after two failed fixes on one premise, `principle-attack-the-premise` |
| New requirement into existing design | `principle-redesign-from-first-principles`, `principle-migrate-callers-then-delete-legacy-apis` |
| Architectural fork with no precedent | `principle-exhaust-the-design-space` |
| API or UX tradeoffs | `principle-experience-first` |
| Same correction twice | `principle-encode-lessons-in-structure` |
| Reversible work vs. asking | `principle-never-block-on-the-human` |
| Long runs, big outputs, planned rewrites | `principle-guard-the-context-window`, `principle-outcome-oriented-execution` |

These skills come from Lauren Tan's [`pstack`](https://github.com/cursor/plugins/tree/main/pstack)
(MIT, see `.claude/skills/PSTACK-LICENSE`). They were adapted for Claude Code: the Cursor-only
`disable-model-invocation` flag is removed so Claude can load them on its own, and two references to
Cursor-specific tooling are reworded.
