# Architecture Decision Record (ADR): Data Ingestion Strategy & Normalization Pipeline

## Status

Accepted

## Context

The project strictly requires integrating a real-world data source providing tech job offers. Per the project specifications, leveraging the WeLoveDevs API is mandatory, operating under a strict rate limit constraint of **1 request per second per student**. To maintain database schema consistency, reduce payload size under limits, and ensure high-integrity user filtering, raw external data must be completely processed and normalized prior to final persistence.

## Decision

We choose to build a centralized, manually triggered server-side ingestion pipeline. This architectural component safely executes the 1 req/sec throttling mechanism, maps unstructured fields into consistent relational structures, and filters out obsolete or duplicated listings before updating our local persistent database.

---

## Why (Rationale)

### 1. Core Value Proposition

Without high-quality, real-world data, the platform provides zero concrete value to candidates. The WeLoveDevs API acts as an official source delivering highly relevant, recent, and geographically targeted French tech job posts that match the professional expectations of our user base (junior developers and Epitech students).

### 2. Mandatory Schema Normalization

External payloads from upstream APIs can be deeply nested, partially incomplete, or improperly formatted. Normalization guarantees that fields like salaries, publication dates, and skill sets comply with our relational constraints. This enables flawless server-side filtering, multi-criteria sorting, and immediate component rendering without any unpredictable client-side crashes.

---

## How (Implementation)

### 1. Core Ingestion Engine

* **Source:** WeLoveDevs REST API (OpenAPI 3.0 specification).
* **Authentication:** Secured via an official API Key tied strictly to `@epitech.eu` student domain names.
* **Ingestion Trigger:** Executed via a protected manual route endpoint (`POST /api/jobs/ingest`) allowing on-demand updates.

### 2. Processing Pipeline Workflow

The pipeline processes raw records through the following programmatic sequence:

1. **Fetch Layer:** Queries the API endpoint while strictly pausing execution for 1000ms between network requests to enforce the mandatory rate limit.
2. **Normalization & Sanitization Layer:**
* Missing optional strings are replaced with safe default database values (`"Not specified"`).
* Financial compensations are parsed, isolated into minimum/maximum values, and bound to a default currency.
* Keyword and technology tags are extracted and formatted into structured JSON arrays.
* Timestamps are unified into standard ISO 8601 formatting (`YYYY-MM-DDTHH:mm:ssZ`).


3. **Deduplication Layer:** Checks incoming API unique identifiers against existing entries inside our database. Existing records are skipped, preventing row fragmentation.
4. **Link Verification Layer:** Validates that all job links are accessible, relevant, and not broken. This ensures data quality and prevents users from encountering dead links.
5. **Match Scoring Layer:** Calculates a compatibility score (0-100) for each job based on how well it matches the user's technical stack and preferences.
6. **Persistence Layer:** New, verified entries with match scores are batch-written into the persistent SQL storage.

### 3. Rate-Limit Handling (Throttling Code)

To strictly respect the 1 req/sec restriction without overflowing backend event loops, we utilize an asynchronous promise-based delay loop inside our ingestion module:

```typescript
// Enforcing a strict 1-second delay between external API requests
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function ingestOffers(offers: ExternalOffer[]): Promise<void> {
  for (const offer of offers) {
    await this.fetchAndStore(offer);
    await delay(1000); // Strict compliance with WeLoveDevs rate limit
  }
}

```

### 4. Match Scoring Algorithm

The match scoring system calculates how well a job matches a user's profile:

```typescript
// Match scoring algorithm
function calculateMatchScore(userSkills: string[], jobSkills: string[]): number {
  // Exact matches (70% weight)
  const exactMatches = userSkills.filter(skill => jobSkills.includes(skill)).length;
  
  // Related technology matches (20% weight)  
  const relatedMatches = countRelatedTechnologies(userSkills, jobSkills);
  
  // General category matches (10% weight)
  const categoryMatches = countCategoryMatches(userSkills, jobSkills);
  
  // Calculate weighted score (0-100)
  const score = Math.min(100, (
    (exactMatches * 0.7) + 
    (relatedMatches * 0.2) + 
    (categoryMatches * 0.1)
  ) * 100);
  
  return Math.round(score);
}
```

### 5. Link Verification Process

The link verification ensures all job URLs are valid and relevant:

```typescript
// Link verification function
async function verifyJobLinks(job: Job): Promise<boolean> {
  const urls = extractUrls(job.description);
  
  for (const url of urls) {
    try {
      // Check if URL is accessible
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) return false;
      
      // Check domain reputation
      if (isSuspiciousDomain(url)) return false;
      
      // Verify content relevance
      if (!await isJobRelatedContent(url)) return false;
    } catch (error) {
      return false;
    }
  }
  
  return true;
}
```

### 4. Normalized Data Model Schema

Each processed listing is structuralized into the following unified properties:

* `id` — Unique alphanumeric identifier.
* `title` — Normalized job title.
* `description` — Cleaned raw description text.
* `company_id` — Relational reference to the posting enterprise.
* `salary_min` / `salary_max` — Explicit numerical range for salary filtering.
* `currency` — Set to `EUR` by default.
* `remote_type` — Enumerated constraint (`remote` / `hybrid` / `onsite`).
* `skills` — Core native JSON array containing precise technical keywords.
* `created_at` — Standardized ISO 8601 publication date.
* `match_score` — Numerical value (0-100) representing how well this job matches a user's profile based on their technical stack.
* `verified_links` — Boolean flag indicating whether all links in the job posting have been verified as valid and relevant.
* `match_score` — Numerical value (0-100) representing how well this job matches a user's profile based on their technical stack.
* `verified_links` — Boolean flag indicating whether all links in the job posting have been verified as valid and relevant.

---

## Trade-offs

### Pros

* **Real-World Fidelity:** Direct integration guarantees access to fresh, authentic job postings from a trusted tech recruitment ecosystem.
* **Data Consistency:** Eliminates unstructured data fields, making the offer data highly indexable for our backend search parameters.
* **Official Integrity:** Relying on Epitech's official partner platform eliminates the risk of sudden upstream layout breakages.
* **Enhanced User Experience:** The match scoring system helps users quickly identify the most relevant job opportunities.
* **Data Quality Assurance:** Link verification ensures users only see valid, relevant job postings.

### Cons & Limitations

* **Ingestion Bottlenecks:** Adhering strictly to the 1 req/sec rate limit limits the synchronization speed of massive data batches. Bulk updates must be performed asynchronously to avoid blocking user operations.
* **Data Loss Vulnerability:** Enforcing strict type formatting means highly specific or edge-case metadata properties present in the raw WeLoveDevs payload may be discarded during translation.
* **Scoring Complexity:** The match scoring algorithm requires ongoing refinement to accurately reflect user preferences and job requirements.

---

## Rejected Alternatives

### 1. Automated Web Scraping (Rejected)

* **Why Rejected:** Web scraping introduces heavy structural fragility as slight frontend changes in third-party websites instantly break selectors. Furthermore, executing unprompted scraping operations violates standard corporate Terms of Service, triggers anti-bot blocking walls, and creates unnecessary legal liabilities. The stable, authorized OpenAPI provided by WeLoveDevs completely removes this technological debt.

### 2. Static / Mocked Database Records (Rejected)

* **Why Rejected:** While mock data dramatically speeds up initial offline UI tests, it fails to demonstrate a functioning ingestion engineering lifecycle. Static datasets do not simulate rate-limit handling, real-world input anomalies, or network-bound synchronization routines required for proper project validation.

---

## Linked Evidence

* **Ingestion Service Path:** The rate limiter implementation and fetching loop are located at `/backend/src/modules/jobs/services/ingestionService.ts`.
* **Data Normalization Function:** The transformation parsing rules and text cleanup routines are located at `/backend/src/modules/jobs/utils/normalizer.ts`.
* **Match Scoring Algorithm:** The compatibility scoring logic is implemented in `/backend/src/modules/jobs/utils/matchScorer.ts`.
* **Link Verification:** URL validation and verification routines are located at `/backend/src/modules/jobs/utils/linkVerifier.ts`.
* **Database Target Schema:** Relational definitions, foreign keys, and JSON array definitions can be validated within the database schema migration file at `/database/schema.sql`.
* **Unit Testing Coverage:** Automated tests explicitly targeting the parsing accuracy of the normalization function are executed by the CI suite configured in `.github/workflows/ci.yml`.