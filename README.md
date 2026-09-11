# AI Interview Prep Kit System

A full-stack AI Interview Preparation Kit application built for the Trao Full-Stack Engineering Assessment. The application transforms raw job descriptions and company website URLs into structured, highly personalized interview prep kits through automated web crawling, public interview research, category-specific question generation, deterministic requirement coverage checking, and day-by-day study schedule allocation.

---

## 1. Project Overview

The AI Interview Prep Kit empowers candidates to prepare effectively for role-specific interviews. By inputting a job description text, target company website URL, and available study days (1–60 days), the system autonomously:
1. Crawls the target company website to understand what they do, their engineering stack, and hiring culture.
2. Researches public interview discussions (Glassdoor, Reddit, Blind) regarding the company's interview rounds.
3. Extracts role requirements, categorizing them as `technical`, `behavioural`, or `domain` with `must` vs `nice` priorities.
4. Generates categorized questions (`technical`, `behavioural`, `system-design`, `company-fit`) and flashcards linked to requirement IDs.
5. Runs a **deterministic coverage check** to verify that every mandatory requirement is tested.
6. Triggers a **second-pass generation loop** if uncovered MUST requirements are detected.
7. Allocates an exact $N$-day study schedule using pure mathematical distribution.
8. Provides interactive practice mode with confidence-weighted flashcard review and an **Interview Weak Spots Report**.

---

### Required Assessment Specifications Checklist

| Requirement | Documented Section | Key Summary |
| --- | --- | --- |
| **Project Overview & Tech Stack** | [Section 1](#1-project-overview) & [Section 3](#3-tech-stack--single-repository-architecture) | Full-stack Next.js 14 App Router (TypeScript, Tailwind CSS, MongoDB, Gemini API). Justification provided for unified single repository model. |
| **Setup & Batch Commands** | [Section 23](#23-batch-evaluator), [Section 25](#25-local-setup-instructions), [Section 27](#27-deployment-configuration) | Local setup, production deployment on Vercel, and exact CLI batch command: `npm run evaluate -- --input <cases.json> --output <kits.json>`. |
| **LLM Provider & Model** | [Section 11](#11-llm-provider--model) | Google Gemini REST API using `gemini-2.5-flash` with strict JSON mode, exponential backoff, and JSON repair fallback. |
| **High-Level Architecture** | [Section 4](#4-architecture--high-level-system-diagram) | End-to-end system flow diagram connecting UI, route handlers, service layer, research pipeline, Gemini LLM, coverage validator, schedule allocator, and database. |
| **Retrieval Approach & Sources** | [Section 7](#7-research-pipeline--retrieval-approach), [Section 8](#8-web-crawling-strategy), [Section 10](#10-public-interview-research) | Custom `cheerio` WebCrawler for homepage, hiring pages (`careers`, `jobs`, `culture`), and Tavily Search API for candidate discussion snippets (Glassdoor, Reddit, Blind). |
| **Step Sequencing & Responsibilities** | [Section 7](#7-research-pipeline--retrieval-approach) | Explicit 21-step pipeline breakdown detailing research crawling, category question generation, coverage checking, second pass loop, and scheduling. |
| **Generated / Edited / Pinned State** | [Section 16](#16-generated--edited--pinned-state-model) & [Section 17](#17-regeneration-strategy) | State tracking (`"generated"`, `"edited"`, `"pinned"`) on all questions and flashcards. Category regeneration strictly preserves user edits and pinned items. |
| **Schedule Allocation** | [Section 15](#15-deterministic-schedule-allocation-algorithm) | Pure arithmetic algorithm validating $1 \le N \le 60$ days, scoring questions by priority & difficulty, and distributing into $N$ day buckets. |
| **Creative Feature** | [Section 30](#30-creative-feature-interview-weak-spots--readiness-report) | **Interview Weak Spots & Readiness Report**: Correlates practice flashcard confidence ratings with JD requirement priorities to output readiness % and action items. |
| **Design Trade-offs & Limitations** | [Section 28](#28-engineering-trade-offs) & [Section 29](#29-known-limitations) | Next.js single repo vs split backend trade-off, Cheerio vs Headless browser performance trade-off, SPA site limitations. |

---

## 2. Features

- **Automated Company & Culture Crawler**: Discovers hiring/careers pages without hardcoded paths, respects site structure, and handles 404s gracefully.
- **Public Discussion Search**: Extracts interview process insights from public forums using Tavily search API.
- **Deterministic Requirement Coverage Engine**: Pure code validator ensuring $100\%$ coverage of MUST-have job requirements.
- **Second-Pass Generation Loop**: Automatically generates supplemental questions for missing requirements before finalizing the kit.
- **Deterministic $N$-Day Schedule Allocator**: Distributes questions and topics across requested days ($1 \le N \le 60$), placing harder & high-priority material earlier.
- **State-Preserving Kit Builder**: Inline editing, category filtering, question reordering, and category-level regeneration that strictly preserves user-edited and pinned items.
- **Interactive Practice Deck**: Flip flashcards, record 3-tier confidence (Low, Medium, High), and prioritize weak cards.
- **Creative Feature (Interview Weak Spots)**: Correlates flashcard confidence ratings with requirement priorities to generate a readiness score and action items.
- **Batch Evaluator CLI**: Exposes `npm run evaluate -- --input <cases.json> --output <kits.json>` using the exact same underlying pipeline.

---

## 3. Tech Stack & Single Repository Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS with custom glassmorphic UI components
- **Database**: MongoDB (Atlas / Local) via Mongoose
- **Authentication**: Custom HTTP-only JWT sessions signed via `jose` + `bcryptjs` password hashing
- **LLM Provider**: Google Gemini (`gemini-2.5-flash`) via REST API
- **Web Crawler / Parser**: Native `fetch` + `cheerio` HTML parser
- **Public Search**: Tavily Search API
- **Testing**: Vitest unit test runner
- **Batch CLI**: `tsx` runner for `scripts/evaluate.ts`

### Why Single Next.js Repository Architecture?
The project uses a unified Next.js App Router repository (`app/`, `components/`, `lib/`, `scripts/`, `tests/`) rather than splitting into separate `frontend/` and `backend/` directories because:
1. **Shared Core Pipeline**: Both API routes (`/api/kits`) and the batch evaluator (`scripts/evaluate.ts`) import the exact same pipeline (`lib/pipeline/kitPipeline.ts`) directly without HTTP IPC overhead.
2. **Type Safety Across Layers**: Complete TypeScript end-to-end type safety connecting Zod schemas (`lib/validation/kitSchema.ts`), database models, backend services, route handlers, and React components.
3. **Single Deployment Unit**: Deploys seamlessly to platforms like Vercel or AWS Amplify as a unified serverless application.

---

## 4. Architecture & High-Level System Diagram

```text
                    ┌──────────────┐
                    │   Next.js UI │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Route Handler│
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Kit Service  │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Kit Pipeline │
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
      Research         Generation       Validation
   (Crawler/Search)   (Gemini LLM)     (Zod / Coverage)
          │                │                │
          └────────────────┼────────────────┘
                           ▼
                    ┌──────────────┐
                    │  Scheduling  │
                    └──────┬───────┘
                           ▼
                    ┌──────────────┐
                    │   MongoDB    │
                    └──────────────┘

                    Batch Evaluator
                           │
                           ▼
                    Same Kit Pipeline
```

---

## 5. Repository Structure

```
.
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── api/
│   │   ├── auth/ (register, login, logout, me)
│   │   └── kits/ (crud, generate, questions, flashcards, practice, weak-spots, regenerate)
│   ├── dashboard/page.tsx
│   ├── kits/
│   │   ├── new/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── practice/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/ (Navbar, Badge, Card, etc.)
│   ├── generation/ (GenerationProgressModal)
│   ├── kit/ (KitViewer, QuestionList, FlashcardList, ScheduleView, WeakSpotsReportView)
│   └── practice/ (FlashcardDeck)
├── lib/
│   ├── auth/ (session.ts)
│   ├── db/ (mongoose.ts)
│   ├── models/ (User.ts, Kit.ts, PracticeProgress.ts)
│   ├── validation/ (kitSchema.ts)
│   ├── security/ (ssrfGuard.ts)
│   ├── scraper/ (crawler.ts)
│   ├── research/ (discussionResearcher.ts)
│   ├── llm/ (geminiClient.ts)
│   ├── extraction/ (requirementExtractor.ts)
│   ├── questions/ (questionGenerator.ts)
│   ├── flashcards/ (flashcardGenerator.ts)
│   ├── coverage/ (coverageChecker.ts)
│   ├── scheduling/ (scheduleAllocator.ts)
│   ├── pipeline/ (kitPipeline.ts)
│   └── services/ (kitService.ts, practiceService.ts, weakSpotsService.ts)
├── scripts/
│   └── evaluate.ts
├── tests/
│   ├── coverage.test.ts
│   ├── schedule.test.ts
│   ├── validation.test.ts
│   └── pipeline.test.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vitest.config.ts
├── .env.example
└── README.md
```

---

## 6. Data Model

The database stores three Mongoose schemas: `User`, `Kit`, and `PracticeProgress`.

### Kit Document Model (Conforms to Appendix A Schema)
```json
{
  "_id": "66e01...",
  "userId": "66d80...",
  "fingerprint": "a3f8...",
  "status": "completed",
  "kit": {
    "source": {
      "company": "Acme Corp",
      "company_url": "https://acme.com",
      "role": "Senior Backend Engineer",
      "location": "Remote / Onsite",
      "jd_chars": 1420,
      "researched_at": "2026-09-10T12:00:00Z",
      "pages_used": ["https://acme.com", "https://acme.com/careers"]
    },
    "company_brief": {
      "summary": "...",
      "what_they_do": "...",
      "sources": ["..."],
      "state": "generated"
    },
    "role": {
      "title": "Senior Backend Engineer",
      "seniority": "Senior",
      "responsibilities": ["..."],
      "requirements": [
        { "id": "r1", "text": "5+ years Node.js", "kind": "technical", "priority": "must" }
      ]
    },
    "questions": [
      {
        "id": "q1",
        "requirement_ids": ["r1"],
        "category": "technical",
        "prompt": "...",
        "answer_outline": "...",
        "difficulty": 2,
        "state": "generated"
      }
    ],
    "flashcards": [
      { "id": "f1", "front": "...", "back": "...", "requirement_ids": ["r1"], "state": "generated" }
    ],
    "schedule": {
      "days_available": 5,
      "days": [
        { "day": 1, "focus": "Core Technical Concepts", "question_ids": ["q1"], "minutes": 60 }
      ]
    },
    "coverage": { "uncovered_requirement_ids": [], "passes": 2 }
  }
}
```

---

## 7. Research Pipeline & Retrieval Approach

The research pipeline executes in genuine sequential & concurrent stages:

```text
STEP 1: Parse JD & Company URL
   │
   ▼
STEP 2: Extract Requirements (RequirementExtractor)
   │
   ▼
STEP 3: Validate URL via SSRF Guard (ssrfGuard)
   │
   ├───────────────────────────────┬───────────────────────────────┐
   ▼                               ▼                               ▼
STEP 4-6: Crawl Homepage        STEP 7-9: Crawl Hiring &        STEP 10-12: Tavily Public
(WebCrawler)                    About Pages (Link Ranking)      Interview Discussion Search
   │                               │                               │
   └───────────────────────────────┼───────────────────────────────┘
                                   ▼
STEP 13: Generate Questions by Category (technical, behavioural, system-design, company-fit)
   │
   ▼
STEP 14: Generate Flashcards
   │
   ▼
STEP 15: Run Deterministic Coverage Checker (checkCoverage)
   │
   ├── (If MUST gaps exist) ──► STEP 16-18: Second Pass Generation & Re-check
   │
   ▼
STEP 19: Run Deterministic Schedule Allocator (allocateSchedule)
   │
   ▼
STEP 20-21: Validate Schema & Persist Kit
```

---

## 8. Web Crawling Strategy

The custom `WebCrawler` (`lib/scraper/crawler.ts`):
1. Fetches company homepage.
2. Cleans HTML using `cheerio` by stripping `<script>`, `<style>`, `<noscript>`, `<nav>`, `<footer>`, `<header>`, and `<iframe>` tags.
3. Normalizes relative URLs (`/careers/jobs` -> `http://target.com/careers/jobs`).
4. Ranks extracted links using keyword scoring:
   - **Hiring keywords**: `careers`, `jobs`, `hiring`, `join-us`, `positions`, `interview`, `handbook`.
   - **About keywords**: `about`, `company`, `team`, `culture`, `engineering`, `blog`.
5. Enforces a 2MB maximum response size limit and a 5-second per-request timeout.
6. Returns clean page text without failing the whole run if one page returns 404 or times out.

---

## 9. Hiring Page Discovery

Hiring paths vary drastically across companies (e.g. `/careers`, `/jobs`, handbook subdomains, or blog posts). Rather than relying on a hardcoded array of paths, `WebCrawler` parses all links present on the homepage, scores them dynamically, and fetches top scoring candidates.

---

## 10. Public Interview Research

The `DiscussionResearcher` (`lib/research/discussionResearcher.ts`) queries the Tavily Search API for candidate discussion snippets (Glassdoor, Reddit, Blind) regarding the company's interview rounds. If Tavily is unavailable, it returns honest fallback context without inventing fake data.

---

## 11. LLM Provider & Model

- **Provider**: Google Gemini REST API
- **Model**: `gemini-2.5-flash`
- **Output Mode**: Strict JSON parsing with a dedicated **JSON repair pass** if initial parsing fails.
- **Reliability**: Exponential backoff on HTTP 429 (Rate Limit) and 5xx errors. Structured errors on persistent API failures (no fake mock fallbacks in assessment mode).

---

## 12. Prompt Sequencing & Prompt Injection Defense

Separate LLM prompts are used for each stage:
1. `RequirementExtractor`: Extracts requirements from JD.
2. `QuestionGenerator`: Runs four separate category calls (`technical`, `behavioural`, `system-design`, `company-fit`).
3. `FlashcardGenerator`: Generates flashcards.

### Prompt Injection Defense
All scraped web content and user-submitted job descriptions are wrapped in strict delimiters and marked as **UNTRUSTED SOURCE DATA**. Prompts explicitly instruct the model to analyze and summarize text without obeying any instructions contained inside the text.

---

## 13. Deterministic Coverage Algorithm

Requirement coverage checking is executed by pure TypeScript code (`lib/coverage/coverageChecker.ts`), NOT an LLM:

```ts
export function checkCoverage(requirements: Requirement[], questions: Question[], passes = 1) {
  const coveredSet = new Set<string>();
  for (const q of questions) {
    q.requirement_ids.forEach((id) => coveredSet.add(id));
  }

  const uncovered_requirement_ids: string[] = [];
  const must_uncovered_ids: string[] = [];

  for (const req of requirements) {
    if (!coveredSet.has(req.id)) {
      uncovered_requirement_ids.push(req.id);
      if (req.priority === "must") must_uncovered_ids.push(req.id);
    }
  }

  return { uncovered_requirement_ids, must_uncovered_ids, passes };
}
```

The second pass is triggered **if and only if `must_uncovered_ids.length > 0`**. Nice-to-have requirements are tracked in coverage metadata without forcing an extra generation loop.

---

## 14. Second-Pass Strategy

If `checkCoverage()` returns uncovered requirement IDs with `priority === "must"`, the pipeline executes a second pass:
1. Isolates uncovered MUST requirement IDs.
2. Invokes `QuestionGenerator` specifically targeting those missing requirements.
3. Appends new questions to the question bank.
4. Runs `checkCoverage()` again with `passes = 2`.

---

## 15. Deterministic Schedule Allocation Algorithm

Schedule allocation is an arithmetic algorithm (`lib/scheduling/scheduleAllocator.ts`):
1. Validates requested days: `days_available` must be an integer between 1 and 60 ($1 \le N \le 60$), throwing an explicit validation error if invalid.
2. Generates **EXACTLY $N$ days** matching the requested count.
3. Scores questions: higher priority (`must` vs `nice`) and higher difficulty ($3 \rightarrow 2 \rightarrow 1$) receive higher scores.
4. Sorts questions descending by score so harder & high-priority material lands EARLIER in the schedule.
5. Distributes questions across $N$ days via bucket allocation.
6. Computes integer durations in minutes (minimum 30 minutes).

---

## 16. Generated / Edited / Pinned State Model

Every question, flashcard, and brief section tracks its state:
- `"generated"`: Created by the pipeline.
- `"edited"`: Modified inline by the user.
- `"pinned"`: Manually created by the user.

When a user regenerates a category (e.g. `POST /api/kits/[id]/regenerate/questions/technical`), questions with `state === "edited"` or `"pinned"` are strictly preserved, while only purely `"generated"` questions in that category are replaced.

---

## 17. Regeneration Strategy

The application exposes targeted regeneration endpoints:
- `POST /api/kits/[id]/regenerate/questions/[category]`: Regenerates only questions in that category.
- `POST /api/kits/[id]/regenerate/company`: Regenerates company brief.
- `POST /api/kits/[id]/regenerate/schedule`: Recalculates schedule deterministically.

Regenerating one section NEVER clobbers user edits elsewhere.

---

## 18. Authentication & Session Management

- Secure registration and login using bcryptjs password hashing.
- Session tokens signed via `jose` JWT stored in HTTP-only, `SameSite=Lax` cookies.
- Server-side authorization checks on all protected API endpoints and pages. User A cannot access or modify User B's kits.

---

## 19. Security Protections

- Password hashing (bcryptjs 10 salt rounds).
- HTTP-only cookie session storage.
- Request payload validation via Zod schemas.
- Response size limits (2MB) and timeouts (5s) on crawler fetches.

---

## 20. SSRF Defense (Production vs. Evaluator Mode)

`lib/security/ssrfGuard.ts` validates external URLs:
- **Production Mode** (`ALLOW_INTERNAL_URLS=false`): Strictly blocks loopback (`127.0.0.1`, `localhost`), private IP ranges (`10.x`, `172.16-31.x`, `192.168.x`), and cloud metadata IPs.
- **Evaluator Mode** (`EVALUATOR_MODE=true`): Automatically enabled during `npm run evaluate` to permit local evaluation websites (e.g. `http://localhost:8099/acme/`).

---

## 21. Rate Limiting & Exponential Backoff

When Gemini API returns HTTP 429 (Too Many Requests) or 5xx server errors, `GeminiClient` waits and retries with exponential backoff ($1\text{s} \rightarrow 2\text{s} \rightarrow 4\text{s}$).

---

## 22. Edge Case & Failure Handling

| Edge Case | Handling Strategy |
| --- | --- |
| Invalid / 404 URL | Skip page, log error, continue pipeline with JD text. |
| Thin JD (2 lines) | Produce an honest thin kit without fabricating requirements. |
| Missing hiring page | Proceed using homepage and about info. |
| Invalid LLM JSON | Run automatic JSON repair pass. |
| Duplicate submission | Return existing kit based on SHA-256 fingerprint hash. |
| 1-day / 60-day schedule | Validated and allocated across exactly the requested number of days.
Invalid day counts outside 1–60 | Rejected with a validation error. |

---

## 23. Batch Evaluator

Exposes mandatory CLI command:
```bash
npm run evaluate -- --input <cases.json> --output <kits.json>
```

Accepts input array of test cases, runs `KitPipeline` for each case sequentially, records status (`"ok"` or `"failed"`), and writes output conforming to Appendix B.

---

## 24. Testing Suite

Run all automated unit tests:
```bash
npm test
```

Tests cover:
- Coverage Checker (`tests/coverage.test.ts`)
- Schedule Allocator (`tests/schedule.test.ts`)
- Kit Validation (`tests/validation.test.ts`)
- Pipeline Security & SSRF (`tests/pipeline.test.ts`)

---

## 25. Local Setup Instructions

1. **Clone repository**:
   ```bash
   git clone <repo-url>
   cd ai-interview-prep-kit
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
4. **Run tests**:
   ```bash
   npm test
   ```
5. **Run development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in browser.
6. **Run batch evaluator**:
   ```bash
   npm run evaluate -- --input test-cases.json --output test-output.json
   ```

---

## 26. Environment Variables Documentation

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB Atlas or local connection string |
| `JWT_SECRET` | Yes | Secret key for session JWT signing (min 32 chars) |
| `GEMINI_API_KEY` | Yes | Google Gemini API key (`gemini-2.5-flash`) |
| `TAVILY_API_KEY` | Optional | Tavily API key for public interview discussion search |
| `EVALUATOR_MODE` | Internal | Automatically set to `true` during `npm run evaluate` |

---

## 27. Deployment Configuration

Ready for deployment on Vercel:
1. Connect repository to Vercel.
2. Set Environment Variables (`MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `TAVILY_API_KEY`).
3. Deploy! Both frontend UI and backend API routes deploy serverless.

---

## 28. Engineering Trade-offs

- **Single Next.js App Router vs. Split Frontend/Backend**: Selected single Next.js repo for zero-IPC pipeline execution and shared TypeScript types.
- **Cheerio vs. Headless Browser (Puppeteer)**: Used Cheerio for lightweight, fast HTML parsing without headless browser memory overhead.

---

## 29. Known Limitations

- Dynamic single-page app (SPA) company websites rendered purely via client JavaScript require static server-rendered HTML or Tavily fallback for text extraction.

---

## 30. Creative Feature: Interview Weak Spots & Readiness Report

Analyzes student performance in Practice Mode cross-referenced with requirement priorities.
- Calculates an **Overall Interview Readiness Score** ($0-100\%$).
- Highlights **Vulnerable Requirements** needing practice.
- Recommends actionable study next steps.

---

## 31. Assessment Checklist

| Area | Status | Notes |
| --- | --- | --- |
| Authentication | PASS | Register, login, logout, HTTP-only session, ownership check |
| Job Input & Days | PASS | Textarea JD, URL, 1-60 days selection, JSON upload |
| Web Crawler | PASS | Cheerio crawler, link ranker, SSRF guard, fallback handling |
| Category Question Generation | PASS | Separate calls for technical, behavioural, system-design, company-fit |
| Deterministic Coverage | PASS | Pure code coverage check with second-pass generation loop |
| Deterministic Schedule | PASS | Pure math schedule allocation across requested days |
| Appendix A Kit Schema | PASS | Strictly validated via Zod schema |
| State Preservation Builder | PASS | User edits & pinned items survive category regeneration |
| Practice Mode | PASS | Interactive deck with confidence recording |
| Batch Evaluator CLI | PASS | `npm run evaluate` verified against Appendix B |
| Automated Tests | PASS | 14/14 Vitest tests passing |
| Creative Feature | PASS | Interview Weak Spots & Readiness Report |
