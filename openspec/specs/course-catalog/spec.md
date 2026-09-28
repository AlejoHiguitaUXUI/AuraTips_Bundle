## Purpose

Presents the public listing of published courses and the course detail page that visitors and prospective students use to discover and evaluate a course before enrolling.

## Requirements

### Requirement: Public catalog of published courses

The system SHALL show a catalog listing every course in `published` status to all visitors, signed in or not. Courses in `draft` status SHALL NOT appear. Each catalog entry SHALL show the course title, cover image, author display name, and aggregate rating.

#### Scenario: Visitor browses catalog

- **WHEN** any visitor opens the catalog
- **THEN** all published courses are listed and no draft courses appear

#### Scenario: Newly published course appears

- **WHEN** an author publishes a course
- **THEN** it appears in the catalog without further action

#### Scenario: Empty catalog

- **WHEN** no courses are published
- **THEN** the catalog renders an empty state rather than an error

### Requirement: Course detail page (by slug)

The system SHALL provide a detail page at `/courses/[slug]` for a published course showing its title, description, cover image, author profile summary, module and lesson outline (titles only), aggregate rating, review list, and an enrollment control. Lesson bodies and videos SHALL NOT be shown on this page to users who are not enrolled and are not the owner.

#### Scenario: Visitor views published course detail

- **WHEN** any visitor opens a published course's detail page
- **THEN** the description, author, lesson outline, and reviews are visible, and lesson content is not

#### Scenario: Enrolled user sees enrolled state

- **WHEN** a user who is already enrolled opens the course detail page
- **THEN** the enrollment control shows an enrolled state and links into the lesson content

#### Scenario: Draft course detail hidden

- **WHEN** a non-owner opens the detail URL of a draft course
- **THEN** the system responds as if the course does not exist

### Requirement: Course detail page (by UUID) — v1.3.0

The system SHALL provide a second detail route at `/courses/[id]` that resolves a procedure by its Supabase UUID. This route MUST behave identically to `/courses/[slug]` in terms of content, but is optimized for direct UUID-based deep links (e.g., from notification emails or API payloads).

#### Scenario: Direct UUID deep link resolves correctly

- **WHEN** a user opens `/courses/<uuid>`
- **THEN** the correct procedure detail page is displayed, with identical content to the slug route

#### Scenario: Supabase offline — fallback to local dataset

- **WHEN** Supabase is unreachable
- **THEN** the page falls back to `CLINICAL_PROCEDURES` from `lib/clinical-data.ts` matching by `id`, and `isEnrolled` is set to `true` for free access to clinical protocols

#### Scenario: UUID not found in either source

- **WHEN** the id does not match any Supabase record nor any local clinical procedure
- **THEN** the system calls `notFound()` and renders the 404 page

#### Scenario: h1 present even without cover image

- **WHEN** a procedure has no `cover_url`
- **THEN** the page still renders one `<h1>` with the procedure title as visible text (WCAG 2.1 / S5 compliance)

#### Scenario: SEO metadata always meets minimum quality

- **WHEN** `generateMetadata` runs for any procedure
- **THEN** `metadata.title` is non-empty, `metadata.description` is at least 50 characters, and `og:image` is present (falling back to `/og/default.png`)

### Requirement: Aggregate rating display

The system SHALL compute and display each course's average rating and review count from its reviews. A course with no reviews SHALL display as unrated rather than as zero.

#### Scenario: Course with reviews

- **WHEN** a course has three reviews with ratings 4, 5, and 3
- **THEN** the course shows an average of 4.0 and a count of 3

#### Scenario: Course with no reviews

- **WHEN** a course has no reviews
- **THEN** the course shows "no ratings yet" and is not treated as rating 0

### Requirement: Accessibility baseline (A11y) — v1.3.0

All course detail pages (slug and UUID variants) MUST comply with the following WCAG 2.1 AA criteria:

- **A1** — All `<img>` / `<Image>` elements carry a descriptive `alt` attribute.
- **A2** — All interactive links include visible text **and** an `aria-label` where the visible text alone is not sufficiently descriptive (e.g., lesson links).
- **A6** — All focusable interactive elements define `:focus-visible` styles; `.stage-lesson-link` uses `outline: 2px solid var(--color-brand)` with `outline-offset: 3px`.
- **A8** — Decorative icons and aria-hidden hero duplicates carry `aria-hidden="true"` to prevent noise for screen readers.

### Requirement: Structured data (SEO) — v1.3.0

All procedure detail pages MUST emit a `<script type="application/ld+json">` block with the following schema.org properties:

| Property | Required | Value |
|---|---|---|
| `@type` | ✅ | `MedicalProcedure` |
| `name` | ✅ | Procedure title |
| `description` | if available | Procedure description |
| `procedureType` | ✅ | `https://schema.org/TherapeuticProcedure` |
| `additionalType` | ✅ | `https://schema.org/<category>` |
| `followup` | ✅ | Recovery time string |
| `performer` | if author present | `Physician` with `name` and `jobTitle` |
| `publisher` | ✅ | `Organization` (AuraTips) |

