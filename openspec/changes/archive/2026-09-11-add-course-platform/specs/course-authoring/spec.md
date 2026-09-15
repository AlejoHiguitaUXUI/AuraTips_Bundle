## Purpose

Lets any authenticated user create and manage courses, organize their content into modules and lessons, and control whether a course is a private draft or publicly listed.

## ADDED Requirements

### Requirement: Create a course

The system SHALL allow an authenticated user to create a course with a title, a URL-safe slug, a description, and an optional cover image URL. The creating user SHALL be recorded as the course owner. A new course SHALL start in `draft` status with price 0.

#### Scenario: Successful course creation

- **WHEN** an authenticated user submits a course with a title and a slug not already used
- **THEN** the course is created in `draft` status, owned by that user, and visible only to them

#### Scenario: Duplicate slug

- **WHEN** a user submits a course whose slug is already taken by another course
- **THEN** creation is rejected with a validation error and no course is created

#### Scenario: Missing title

- **WHEN** a user submits a course without a title
- **THEN** creation is rejected with a validation error

### Requirement: Owner-only course management

The system SHALL allow only a course's owner to edit its fields, add or reorder modules and lessons, change its status, or delete it. Any such action by a non-owner SHALL be rejected by the authorization layer.

#### Scenario: Owner edits course

- **WHEN** a course owner updates the title, description, or cover image
- **THEN** the changes are saved

#### Scenario: Non-owner attempts to edit

- **WHEN** an authenticated user who is not the owner submits an edit, status change, or delete for the course
- **THEN** the action is rejected and no data changes

#### Scenario: Owner deletes course

- **WHEN** a course owner deletes their course
- **THEN** the course and its modules, lessons, enrollments, and reviews are removed

### Requirement: Organize content into modules and lessons

The system SHALL let a course owner add modules to a course and lessons to a module, each with an explicit ordering position. A lesson SHALL have a title, optional Markdown body text, and an optional YouTube URL. The system SHALL reject a YouTube URL that is not a recognizable YouTube video link.

#### Scenario: Add a module and lesson

- **WHEN** an owner adds a module titled "Introduction" and then a lesson titled "Welcome" with body text and a valid YouTube URL
- **THEN** both are saved under the course in the given order

#### Scenario: Invalid video URL

- **WHEN** an owner saves a lesson with a URL that is not a YouTube video link
- **THEN** the save is rejected with a validation error identifying the video field

#### Scenario: Lesson with text only

- **WHEN** an owner saves a lesson with body text and no YouTube URL
- **THEN** the lesson is saved and renders as text-only

#### Scenario: Reorder lessons

- **WHEN** an owner changes the positions of lessons within a module
- **THEN** the new order is persisted and reflected when the course is viewed

### Requirement: Draft and publish lifecycle

The system SHALL support two course statuses, `draft` and `published`. A `draft` course SHALL be visible and accessible only to its owner. Publishing SHALL make the course appear in the public catalog. The owner SHALL be able to return a `published` course to `draft`, after which it leaves the catalog but existing enrollments are retained.

#### Scenario: Publish a course

- **WHEN** an owner sets a `draft` course to `published`
- **THEN** the course appears in the public catalog and is viewable by anyone

#### Scenario: Unpublish a course

- **WHEN** an owner sets a `published` course back to `draft`
- **THEN** the course no longer appears in the catalog and is not viewable by non-owners, while its enrollment records remain

#### Scenario: Draft not publicly visible

- **WHEN** a user who is not the owner requests a `draft` course by its URL
- **THEN** the system responds as if the course does not exist
