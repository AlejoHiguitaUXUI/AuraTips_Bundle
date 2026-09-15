## Purpose

Handles a user joining a published course for free and the access to lesson content that enrollment grants.

## Requirements

### Requirement: Free enrollment in a published course

The system SHALL allow an authenticated user to enroll in a `published` course with a single action, at no cost. Enrollment SHALL create one enrollment record linking the user and the course with status `active`. A user SHALL NOT be able to enroll in the same course twice, nor enroll in a `draft` course.

#### Scenario: Successful enrollment

- **WHEN** an authenticated user who is not yet enrolled chooses to enroll in a published course
- **THEN** an `active` enrollment record is created and the user gains access to the course's lessons

#### Scenario: Duplicate enrollment prevented

- **WHEN** an already-enrolled user attempts to enroll in the same course again
- **THEN** no second record is created and the user is shown as already enrolled

#### Scenario: Enrollment requires sign-in

- **WHEN** an unauthenticated visitor attempts to enroll
- **THEN** they are prompted to sign in or register, and no enrollment is created

#### Scenario: Cannot enroll in a draft

- **WHEN** a request attempts to enroll a user in a course that is in `draft` status
- **THEN** the enrollment is rejected

### Requirement: Enrolled access to lesson content

The system SHALL grant a user read access to every lesson's body text and video in a course if and only if that user is enrolled in the course or is the course owner. Non-enrolled users SHALL see only the lesson outline.

#### Scenario: Enrolled user reads a lesson

- **WHEN** an enrolled user opens a lesson in that course
- **THEN** the lesson's Markdown body and embedded YouTube video are shown

#### Scenario: Non-enrolled user blocked from lesson content

- **WHEN** a signed-in user who is not enrolled requests a lesson's content in that course
- **THEN** the content is not returned and the user is directed to the enrollment control

#### Scenario: Owner previews own course content

- **WHEN** a course owner opens a lesson in their own course without an enrollment record
- **THEN** the lesson content is shown

### Requirement: Learner's enrolled courses

The system SHALL let a signed-in user see the list of courses they are enrolled in, separate from courses they author.

#### Scenario: User views their learning list

- **WHEN** a signed-in user opens their learning dashboard
- **THEN** every course they have an `active` enrollment in is listed, and courses they only authored are not
