# Architecture Decision Record (ADR): Brute-Force Attack Mitigation Strategy

## Status

Accepted

## Context

The authentication gateway (`/api/auth/login`) is a primary target for malicious actors looking to harvest credentials or take over accounts. Without explicit mitigation strategies, automated bots can execute high-velocity dictionary or brute-force attacks, submitting thousands of password combinations per minute.

Per the project's cybersecurity requirements, we must implement active server-side controls to identify and suppress credential-guessing patterns without disrupting authentic platform users.

## Decision

We choose to deploy a network-layer throttling mechanism using **IP-based Rate Limiting** specifically targeting the `/api/auth/login` gateway, coupled with an explicit request cooldown block.

---

## Why (Rationale)

* **Resource and Credential Protection:** Password hashing algorithms (like `bcrypt`) are intentionally resource-intensive. Allowing unrestricted requests to the login endpoint would expose the server to an accidental Denial of Service (DoS) by maxing out CPU usage during heavy hashing, in addition to letting attackers guess credentials.
* **Deterministic Thresholds:** Setting a strict ceiling of **5 attempts per 15 minutes** strikes the perfect balance. It accommodates genuine users who occasionally mistype their passwords while completely arresting automated, high-velocity sequential automated scripts.

---

## How (Implementation)

### 1. Throttling Mechanism

We implement the rate limiter via the `express-rate-limit` package, configured directly within our centralized backend module architecture.

### 2. Operational Constraints Configuration

* **Window Duration:** 15 minutes (`15 * 60 * 1000` milliseconds).
* **Maximum Inbound Volume:** 5 attempts per individual client IP address before triggering the restriction layer.
* **Response Signature:** When a threshold violation occurs, the server instantly drops the request, bypasses heavy internal business modules, and returns an explicit **HTTP 429 Too Many Requests** status code carrying a clear error message.

### 3. Blocked Attack Scenario Flow

```text
[ Attacker Script ] --( Request 1 to 5 )---> [ Auth Endpoint ] ---> Success/Failure Evaluation
[ Attacker Script ] --( Request 6+ )-------> [ Rate Limiter  ] ---> BLOCKED: HTTP 429 (15-min Cooldown)

```

---

## Trade-offs

### Pros

* **Low Computational Overhead:** The rate-limiting middleware intercepts the HTTP request context at the absolute perimeter of the application router, saving database query and password-decryption processor cycles.
* **Zero Configuration Storage Costs:** By tracking hits directly via in-memory structures or lightweight cache indices, the filter runs instantly without overloading the core relational database tables.

### Cons & Limitations

* **Shared Network IP Collisions:** If multiple legitimate candidates share a single public-facing network gateway proxy (e.g., inside an enterprise corporate office or a school campus), one user failing their login 5 times will accidentally block the endpoint for all other users behind that identical external IP signature.
* **Volatile Cache Erasure:** Because tracking runs in-memory within the backend container, restarting the Docker Compose stack clears the current block history list, resetting the counter for an attacker.

---

## Rejected Alternatives

### Alternative 1: User Account Lockout Policies (Rejected)

* **Why Rejected:** Locking out a database account record (e.g., setting an `isLocked` flag on a specific user profile after 5 failed attempts) creates a severe surface area for **Denial of Service (DoS)** attacks. An attacker who knows a list of user emails could intentionally trigger failed logins for every user on the platform, locking out the entire platform community from accessing their profiles. Throttling by IP targets the attacker, not the victim.

### Alternative 2: Global Application-Wide Rate Limiting (Rejected)

* **Why Rejected:** Applying a uniform, aggressive 5-request limit across the entire API space would completely break standard user operations, like browsing through job offer lists or triggering the automated ingestion pipeline. Restrictions must be applied selectively to high-risk routes.

---

## Linked Evidence

* **Middleware Definition Path:** The operational initialization, window configurations, and custom handler rules are written inside `/backend/middleware/rateLimitMiddleware.js`.
* **Endpoint Protection Integration:** The active inclusion of the filter middleware onto the authentication router is declared inside `/backend/routes/authRoute.js`.
* **Defensive Verification:** The active behavior of the HTTP 429 interception can be verified via terminal manual execution logs using `curl -X POST` sequential scripts or through the continuous integration validation tests running on the pipeline specified in `.github/workflows/ci.yml`.