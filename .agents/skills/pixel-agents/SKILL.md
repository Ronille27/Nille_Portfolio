---
name: pixel-agents
description: >-
  Orchestrate and execute tasks using specialized Pixel Agents (Frontend, Backend, Database, Security, Performance, QA) configured in .pixel-agents/.
  Activate when the user types /pixel-agents, mentions @pixel-agent, references pixel agents, or asks to delegate development tasks to specialized agent roles.
---

# Pixel Agents Workspace Skill

The **Pixel Agents** skill provides specialized multi-agent orchestration for end-to-end development, architecture, security, performance, and quality assurance within this workspace.

---

## 1. Configuration & Context Loading

Before executing or delegating tasks, load and inspect the configuration files from the `.pixel-agents/` directory:

1. **Global Configuration (`.pixel-agents/config.json`)**:
   - Contains codebase profile, active agents, color codes, file permissions, and orchestrator settings.
2. **State & Active Tasks (`.pixel-agents/state.json`)**:
   - Contains the current execution state, active tasks, agent workloads, and history.
3. **Agent Role Personas (`.pixel-agents/agents/<agent>.md`)**:
   - Detailed instructions, system prompts, role scope, and permission scopes for each agent persona (`frontend.md`, `backend.md`, `database.md`, `security.md`, `performance.md`, `qa.md`, `orchestrator.md`).
4. **Skill Playbooks (`.pixel-agents/skills/<skill>.md`)**:
   - Specialized technical domain guides (e.g., `codebase-intelligence.md`, `security-audit.md`, `performance-profiling.md`, `testing.md`, `playwright-e2e.md`, `api-architecture.md`).

---

## 2. Specialized Agent Roles

| Agent | Role & Domain | Sprite / Color | Primary File Scope & Permissions |
| :--- | :--- | :--- | :--- |
| **Frontend** | DOM / Web Components, Responsive Design, CSS animations, UI State | `frontend` (`#00f0ff`) | `components/**`, `pages/**`, `app/**`, `styles/**`, `public/**` |
| **Backend** | Node.js API, REST/GraphQL endpoints, business logic, controllers | `backend` (`#ff007f`) | `api/**`, `server/**`, `routes/**`, `controllers/**`, `lib/**` |
| **Database** | SQL / Relational schemas, migrations, ORM (Prisma / Drizzle), indexing | `database` (`#ffd700`) | `prisma/**`, `db/**`, `migrations/**`, `models/**`, `drizzle/**` |
| **Security** | OWASP hardening, vulnerability audits, secret scanning, sanitization | `security` (`#ff3344`) | `security/**`, `.env.example`, full codebase audit read |
| **Performance** | Core Web Vitals, LCP/CLS optimization, bundle profiling, memory efficiency | `performance` (`#39ff14`) | Full codebase read/write for optimization |
| **QA / Testing** | Unit tests, E2E test suites (Vitest, Playwright, Cypress), test coverage | `qa` (`#b026ff`) | `tests/**`, `__tests__/**`, `cypress/**`, `playwright/**`, `e2e/**` |
| **Orchestrator** | Task decomposition, dependency mapping, multi-agent dispatching | `orchestrator` | Coordinates all agent roles across milestones |

---

## 3. CLI & Command Execution

Execute tasks and manage agent workflows using `npx pixel-agents`:

```bash
# Run a specific task with automated agent routing
npx pixel-agents task "Design modern hero section with dynamic particle background"

# Assign a task explicitly to a specialized agent role
npx pixel-agents task --agent frontend "Implement accessible navigation drawer with keyboard shortcuts"
npx pixel-agents task --agent backend "Create RESTful endpoint for project inquiries"
npx pixel-agents task --agent database "Generate migration schema for portfolio projects"
npx pixel-agents task --agent security "Perform dependency vulnerability audit and CSP header checks"
npx pixel-agents task --agent performance "Analyze bundle size and optimize asset loading"
npx pixel-agents task --agent qa "Generate Playwright E2E tests for contact form submission"

# Check status and running tasks
npx pixel-agents status

# Launch the visual CRT/Pixel dashboard
npx pixel-agents start
```

---

## 4. Multi-Agent Workflow Guidelines

When handling user requests via `/pixel-agents`:

1. **Deconstruct the Task**:
   - Break large requests into phased deliverables across agent domains (Database → Backend → Frontend → QA → Performance → Security).
2. **Respect Permissions**:
   - Adhere strictly to the read and write permission boundaries specified in `.pixel-agents/config.json` for each agent persona.
3. **Run Verification & QA**:
   - Always validate deliverables by running QA/tests or verifying syntax and browser rendering before finalizing.
4. **Log Events & Reports**:
   - Output summary reports to `.pixel-agents/reports/` and log milestones to `.pixel-agents/events.jsonl` when completing multi-step agent runs.
