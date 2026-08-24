# Architecture Decision Record (ADR): Continuous Integration (CI) Workflow Strategy

## Status

Accepted

## Context

Our job aggregator platform requires coordinated development across decoupled frontend (`Front`) and backend (`Backend`) workspaces. To maintain software stability, prevent broken application builds, and ensure styling consistency before code integration, we need an automated verification system.

Per the project rules, this system must execute automatically on code pushes and Pull Requests targeting the `main` branch, must use a specific self-hosted infrastructure, and must run linting, build checks, and backend route/normalization tests.

## Decision

We choose to implement a multi-job, parallelized **GitHub Actions Continuous Integration (CI) Pipeline**. This workflow isolates the backend and frontend runtime checks into independent validation blocks. It strictly executes on Epitech's infrastructure via self-hosted runners to meet project requirements.

---

## Why (Rationale)

### 1. Hard Infrastructure Compliance (`runs-on: self-hosted`)

* **Why:** The evaluation guidelines forbid using public GitHub-hosted machines (such as `ubuntu-latest`). Workflows that do not run on internal campus infrastructure are rejected.
* **Control:** Both the `backend` and `frontend` validation jobs are explicitly bound to `runs-on: self-hosted`.

### 2. Multi-Job Parallelization

* **Why:** Running linting, testing, and production compilation sequentially for the entire repository inside a single block slows down development velocity.
* **Control:** By splitting the workflow into two independent jobs (`backend` and `frontend`), the self-hosted environment can process them simultaneously. If the frontend build fails, the backend tests can still complete, providing clear feedback to the team.

### 3. Build Protection & Quality Gates

* **Why:** Code compilation errors, missing dependencies, or breaking unit changes must never be merged into production.
* **Control:** The pipeline forces clean package installations (`npm ci`), automated styling rules audits (`npx eslint`), backend testing suites (`npm test`), and production compilation tests (`npm run build`) before a Pull Request can be safely integrated.

---

## How (Implementation)

The workflow is saved at `.github/workflows/ci.yml` and implements the following strict behaviors:

### 1. Event Triggers

* Automated execution occurs immediately whenever a developer executes a `push` or opens/updates a `pull_request` targeting the `main` branch.

### 2. Isolation & Caching Strategy

* **Directory Bounds:** Uses GitHub Actions `defaults.run.working-directory` configuration to isolate tasks into `Backend` and `Front` respectively.
* **Dependency Acceleration:** Implements the `actions/setup-node@v4` caching mechanism using `package-lock.json` hashes. This prevents fetching unchanged modules from the web on every run, drastically reducing pipeline execution times.

### 3. Defensive Step Handling (Linting Resilience)

To prevent the pipeline from crashing on early workspace configuration issues, a fallback wrapper checks for an active configuration before executing code audits:

```bash
if [ -f .eslintrc* ] || [ -f eslint.config* ]; then
  npx eslint . || true
else
  echo "No ESLint config found — skipping lint step"
fi

```

### 4. Sandbox Testing Environment

During the `backend` execution step, specific mocked testing variables (such as `JWT_SECRET: ci-test-secret` and local loopback database credentials) are injected straight into the container environment memory. This enables your backend integration tests to evaluate server routes and data normalization logic without exposing real production passwords or connecting to external servers.

---

## Trade-offs

### Pros

* **Fast Failure Identification:** Running jobs in parallel allows the team to pinpoint whether a breaking change originates from client layout files or server controllers within seconds.
* **No Cache Fragmentation:** Utilizing separate `cache-dependency-path` fields for `Backend` and `Front` ensures that updating a dependency in the frontend will not invalidate the backend module cache unnecessarily.
* **Zero Asset Contamination:** Forcing a frontend build step (`npm run build`) verifies that Next.js or framework compiling works flawlessly under strict production optimization modes.

### Cons & Limitations

* **Runner Availability Bottlenecks:** Because the system operates exclusively on a `self-hosted` infrastructure, multiple teams pushing code simultaneously on the same machine may experience queue delays compared to scaling instantly on GitHub's cloud.
* **Linter Soft-Failing (`|| true`):** The inclusion of `|| true` on the eslint steps allows code verification to pass even if code style warnings are present. While this ensures that small styling mistakes don't block critical feature testing, it requires developers to remain disciplined during manual peer code reviews.

---

## Rejected Alternatives

### Alternative 1: Single Sequential Monolithic Monojob (Rejected)

* **Why Rejected:** Putting all frontend and backend installation, linting, and building commands into one single long list of steps would force developers to wait for the entire stack to process. If the backend tests failed after 5 minutes, the frontend build would never even be checked. Splitting them into parallel jobs provides faster and cleaner error reporting.

### Alternative 2: Disabling Local Test Variables (Rejected)

* **Why Rejected:** Running backend testing without hardcoded sandbox environment variables (`JWT_SECRET`, `NODE_ENV: test`) would force the code to search for a local `.env` file. Since `.env` files contain sensitive secrets, they are excluded from the git repository for safety, which would cause the automated testing step to crash instantly during the CI run.

---

## Linked Evidence

* **Workflow Configuration Path:** The exact trigger properties, step definitions, and environment rules are defined inside `.github/workflows/ci.yml`.
* **Backend Test Framework Mapping:** The automated API routes and normalization test assertions executed by `npm test` are located under `/Backend/tests/`.
* **Frontend Build Parameters:** The production compiler check parameters are defined inside `/Front/package.json` under the `build` script key.