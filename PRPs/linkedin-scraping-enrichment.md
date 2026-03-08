# LinkedIn Scraping & Data Enrichment PRP

> This PRP defines the implementation of an automated LinkedIn scraping pipeline to enrich alumni profiles during CSV imports or manual triggers.

## Goal
Implement a background processing pipeline (BullMQ + Puppeteer) to fetch and update alumni professional data (current position, company, status) from LinkedIn profile URLs.

## Why
**Business Value:**
- **Data Freshness:** Automatically keeps the alumni directory up-to-date.
- **Admin Productivity:** Reduces manual data entry after bulk student imports.
- **Reporting:** Enables accurate employment statistics for the school.

**Priority:** High

---

## What

### Feature Description
The system will handle LinkedIn profile enrichment as an asynchronous task. When an admin imports a CSV of alumni or manually triggers an update, jobs are added to a Redis-backed queue. A worker (Puppeteer) then visits the LinkedIn profiles to extract the latest "Experience" details.

### Scope

**In Scope:**
- **Scraping Module (NestJS):** Producer/Consumer pattern using BullMQ.
- **LinkedIn Worker:** Puppeteer script to extract `current_position`, `company`, and `status`.
- **CSV Import (Admin):** Backend endpoint to parse CSVs and trigger enrichment jobs.
- **Manual Enrichment (Admin):** Individual and bulk update triggers from the dashboard.
- **Frontend (Angular):** UI for CSV upload and enrichment status visibility.

**Out of Scope:**
- Scraping historical data (previous jobs).
- Handling LinkedIn login/authentication (scraping will be done on public profile views or via shared cookies if necessary).
- Sophisticated bot detection bypass (Initial version focuses on basic stealth).

### User Stories
1. **As an Admin**, I can upload a CSV of 100 students, and the system automatically starts updating their LinkedIn info in the background.
2. **As an Admin**, I can see which profiles have been "Enriched" in the alumni list.
3. **As an Admin**, I can click "Update from LinkedIn" on an individual profile to refresh its data.

---

## Technical Context

### Files to Reference (Read-Only)
| File | Purpose |
|------|---------|
| `ai_docs/services.md` | Contains the intended BullMQ/Puppeteer architecture. |
| `ai_docs/patterns.md` | NestJS & Angular patterns (Signals, DTOs, Guards). |
| `server/src/modules/alumni/models/alumni-profile.model.ts` | Existing model to update. |

### Files to Implement/Modify
| File | Action | Description |
|------|--------|-------------|
| `server/package.json` | MODIFY | Add `bull`, `@nestjs/bull`, `puppeteer`, `csv-parse`. |
| `server/src/modules/scraping/` | CREATE | Module, Service (Producer), Processor (Consumer). |
| `server/src/modules/alumni/alumni.service.ts` | MODIFY | Add logic to trigger scraping jobs. |
| `server/src/modules/admin/` | CREATE | AdminController for CSV upload and bulk actions. |
| `client/src/app/features/admin/` | CREATE | Components for CSV Import and Alumni Management updates. |

### Existing Patterns to Follow
- **BullMQ:** Use the standard `@Processor` and `@Process` decorators.
- **Guards:** All endpoints must use `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles('ADMIN')`.
- **Angular Signals:** Use signals to manage the state of the alumni list and enrichment status.

---

## Implementation Details

### API Endpoints

#### `POST /api/admin/alumni/import`
- **Purpose:** Create users/profiles from CSV and queue scraping jobs.
- **Body:** Multipart form-data (CSV file).

#### `POST /api/admin/alumni/:id/enrich`
- **Purpose:** Trigger a scraping job for a single profile.

#### `POST /api/admin/alumni/enrich-all`
- **Purpose:** Queue scraping jobs for all profiles with a `linkedin_url` and `data_enriched: false`.

### Database Schema Changes
No schema changes. We will use the existing `AlumniProfile` fields:
- `current_position`
- `company`
- `status`
- `data_enriched` (Boolean)
- `updated_at` (to track when the last scraping happened)

---

## Validation Criteria

### Functional Requirements
- [ ] Admin can upload a CSV and students are correctly created in `users` and `alumni_profiles`.
- [ ] Scraping jobs are successfully added to Redis (verified via logs/BullBoard if added).
- [ ] Alumni profiles are updated with correct job/company info after scraping.
- [ ] The `data_enriched` flag correctly switches to `true`.

### Technical Requirements
- [ ] `docker compose exec server npm run build` passes.
- [ ] Puppeteer runs in "headless" mode within the Docker container.
- [ ] Error handling: If scraping fails (e.g., profile not found), the job is retried or marked as failed without crashing the worker.

### Security Checklist
- [ ] Admin role verification on all scraping/import endpoints.
- [ ] CSV input validation to prevent injection or malformed data issues.

### Testing Steps
1. **Import Test:** Upload a sample CSV with 5 rows. Verify 5 users/profiles are created.
2. **Queue Test:** Check server logs to see "Job [id] added to queue".
3. **Success Test:** Wait for worker to finish. Verify the database entries for `current_position` are no longer null.
4. **Manual Test:** Click the "Enrich" button in the UI for a single user and verify update.

---

## External Resources
- [BullMQ Documentation](https://docs.bullmq.io/)
- [NestJS Bull Integration](https://docs.nestjs.com/techniques/queues)
- [Puppeteer API](https://pptr.dev/)

---

**Created:** Sunday, March 8, 2026
**Status:** Draft / Approved
**Branch:** `feat/linkedin-scraping`
