## Purpose

Lets an enrolled student leave a single rating-and-text review of a course and edit or remove it later, feeding the course's aggregate rating.

## Requirements

### Requirement: Enrolled user leaves one review per course

The system SHALL allow a user to create a review of a course only if they have an `active` enrollment in that course. A review SHALL have an integer rating from 1 to 5 and an optional text body. A user SHALL have at most one review per course.

#### Scenario: Enrolled user reviews a course

- **WHEN** an enrolled user submits a rating of 4 and review text for a course they have not yet reviewed
- **THEN** the review is created and attributed to that user

#### Scenario: Non-enrolled user cannot review

- **WHEN** a signed-in user who is not enrolled in the course submits a review
- **THEN** the review is rejected by the authorization layer

#### Scenario: Second review prevented

- **WHEN** a user who already reviewed the course submits another review for it
- **THEN** the submission is rejected and the user is directed to edit their existing review

#### Scenario: Rating out of range

- **WHEN** a user submits a review with a rating below 1 or above 5, or a non-integer rating
- **THEN** the submission is rejected with a validation error

### Requirement: Edit and delete own review

The system SHALL allow a user to update the rating and text of their own review, or delete it. A user SHALL NOT be able to modify or delete another user's review.

#### Scenario: User edits own review

- **WHEN** a user changes the rating or text of their existing review
- **THEN** the change is saved and the course's aggregate rating recalculates

#### Scenario: User deletes own review

- **WHEN** a user deletes their review
- **THEN** the review is removed and the course's aggregate rating recalculates

#### Scenario: User cannot edit another's review

- **WHEN** a user submits an edit or delete targeting a review they did not write
- **THEN** the action is rejected and no data changes

### Requirement: Reviews are publicly readable

The system SHALL make all reviews of a published course readable by any visitor, including the reviewer's display name, rating, text, and timestamp.

#### Scenario: Visitor reads reviews

- **WHEN** any visitor opens a published course's detail page
- **THEN** the list of reviews with reviewer names and ratings is visible without sign-in
