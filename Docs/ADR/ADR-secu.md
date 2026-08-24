# Architecture Decision Record (ADR): Centralized Security Architecture & Controls

## Status

Accepted

## Context

Our job aggregator platform handles user authentication, multiple authorization roles (User and Admin), sensitive personal data, and internal automated tasks like API ingestion. Due to the public-facing nature of web applications, the system is highly vulnerable to automated exploitation attempts, data leaks, and credential compromise.

Per the project's cybersecurity requirements, we must explicitly protect both the application layer and data layer against major modern web vulnerabilities while enforcing strict control server-side.

## Decision

We choose to implement a defense-in-depth security paradigm built directly into our containerized full-stack architecture. We reject relying solely on client-side safety and instead enforce explicit server-side layers focusing on four primary threat vectors: Injection (SQL/NoSQL), Brute Force, Cross-Site Request Forgery (CSRF), and Cross-Site Scripting (XSS).

---

## Why (Rationale)

### 1. SQL & NoSQL Injection Protection

* **Why:** Attackers often exploit open search queries or user login forms to inject arbitrary database operations, which could compromise job listings or leak user tables.
* **Control:** We strictly mandate **Parameterized Queries (Prepared Statements)** via the `mysql2` (or ORM equivalent) driver placeholders (`?`) instead of string concatenation. This forces the database engine to treat user input purely as a literal value rather than executable code.

### 2. Brute Force & Credential Harvesting Mitigation

* **Why:** Automated bots frequently target `/auth` endpoints with high-velocity dictionary attacks to guess passwords and take over accounts.
* **Control:** We implement dedicated endpoint **Rate Limiting** paired with high-entropy **Password Hashing using bcrypt**. Even in the event of an underlying database data breach, user passwords remain cryptographically unreadable.

### 3. Cross-Site Request Forgery (CSRF) Defenses

* **Why:** Unprotected browser sessions can be manipulated by malicious third-party sites to perform unauthorized state-changing operations (such as deleting an offer or upgrading a user role) on behalf of an authenticated candidate.
* **Control:** We enforce a restrictive **Cross-Origin Resource Sharing (CORS)** policy alongside the **`SameSite=Strict`** cookie attribute to strictly bound authentication tokens to our frontend app domain.

### 4. Cross-Site Scripting (XSS) Prevention

* **Why:** Stolen session or authentication tokens allow an attacker to completely hijack an active user session.
* **Control:** By marking JWT/session cookies as **`HttpOnly`**, we block client-side JavaScript from accessing the credentials entirely, nullifying standard token-stealing script payloads.

---

## How (Implementation)

* **Centralized Validation Layer:** Inside our backend container, a global middleware/interceptor layer automatically filters all incoming HTTP payloads. String formatting rules prevent rogue data formats from ever reaching internal business components.
* **Rate-Limit Guard:** A rate-limiting middleware (e.g., `express-rate-limit`) tracks incoming traffic by client IP address. Exceeding 100 requests per 15 minutes on authentication endpoints instantly returns an HTTP `429 Too Many Requests` status code.
* **Data Flow Controls:**
* Frontend renders all server data via framework escaping (preventing unencoded HTML execution).
* Backend issues JWT cookies with explicit security flags: `HttpOnly: true`, `Secure: true` (in production), and `SameSite: 'Strict'`.



---

## Trade-offs

### Pros

* **Complete OWASP Coverage:** Our controls directly isolate and resolve the most dangerous entry points for external attackers without adding runtime lag.
* **Low Maintainability Overhead:** Using native driver parameterization and global middleware means developers do not have to write manual, error-prone sanitization regex for every new API route created.
* **Server-Side Sovereignty:** Even if an attacker completely bypasses the frontend validation UI, the server-side filters and rate limiters will drop the payload automatically.

### Cons & Limitations

* **Local Development Overhead:** Enforcing `SameSite` and strict CORS requires rigorous configuration when testing locally between differing Docker container container ports (e.g., frontend running on port `:3000` communicating with backend on port `:8000`).
* **Stateless Token Constraints:** Relying strictly on server-side rate limits by IP can theoretically impact multiple genuine corporate users who share a single public proxy IP address, though this risk is minimal for our user pool size.

---

## Rejected Alternatives

### Alternative 1: Storing JWTs in Client-Side LocalStorage (Rejected)

* **Why Rejected:** Storing authentication tokens inside the browser's `localStorage` makes them globally readable by any JavaScript execution thread. If our platform ever suffered from an accidental third-party dependency script injection, all user tokens could be swept and transmitted instantly. Moving tokens into `HttpOnly` cookies completely mitigates this threat vector.

### Alternative 2: Manual In-Line Input Filtering (Rejected)

* **Why Rejected:** Writing custom text-stripping algorithms inside every single route controller creates fragmented, hard-to-maintain code. Omitting a single route by accident creates a critical exploit window. A global centralized validation pipe provides uniform security guarantees across the entire application workspace.

---

## Linked Evidence

* **Security Configuration Path:** Global security middleware initialization, CORS policies, and rate-limit scopes are configured at `/backend/src/main.ts` (or your framework's server entry file).
* **Database Query Implementation:** Prepared statements usage and parameterized database schema mapping are declared in `/backend/src/modules/database/`.
* **Testing & Route Security:** Automated endpoint protection can be verified via the CI script at `.github/workflows/ci.yml`, where tests validate that unauthenticated requests to protected endpoints return an explicit HTTP `401 Unauthorized` or `403 Forbidden` response.