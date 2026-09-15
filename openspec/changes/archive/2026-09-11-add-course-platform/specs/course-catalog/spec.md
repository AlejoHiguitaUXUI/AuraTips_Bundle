## Purpose

Presents the public listing of published courses and the course detail page that visitors and prospective students use to discover and evaluate a course before enrolling.

## ADDED Requirements

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

### Requirement: Course detail page

The system SHALL provide a detail page for a published course showing its title, description, cover image, author profile summary, module and lesson outline (titles only), aggregate rating, review list, and an enrollment control. Lesson bodies and videos SHALL NOT be shown on this page to users who are not enrolled and are not the owner.

#### Scenario: Visitor views published course detail

- **WHEN** any visitor opens a published course's detail page
- **THEN** the description, author, lesson outline, and reviews are visible, and lesson content is not

#### Scenario: Enrolled user sees enrolled state

- **WHEN** a user who is already enrolled opens the course detail page
- **THEN** the enrollment control shows an enrolled state and links into the lesson content

#### Scenario: Draft course detail hidden

- **WHEN** a non-owner opens the detail URL of a draft course
- **THEN** the system responds as if the course does not exist

### Requirement: Aggregate rating display

The system SHALL compute and display each course's average rating and review count from its reviews. A course with no reviews SHALL display as unrated rather than as zero.

#### Scenario: Course with reviews

- **WHEN** a course has three reviews with ratings 4, 5, and 3
- **THEN** the course shows an average of 4.0 and a count of 3

#### Scenario: Course with no reviews

- **WHEN** a course has no reviews
- **THEN** the course shows "no ratings yet" and is not treated as rating 0
