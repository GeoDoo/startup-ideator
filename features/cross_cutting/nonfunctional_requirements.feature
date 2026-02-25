Feature: Non-Functional & Security Requirements
  As the platform operations team,
  We need to ensure the system meets security, performance, and compliance standards,
  So that user data is protected and the platform is reliable.

  Note: These are system-level requirements that are not directly observable by end users.
  They are captured here for completeness and should be verified via infrastructure
  tests, security audits, and compliance reviews rather than UI-level acceptance tests.

  # --- Data Protection ---

  Scenario: Assessment data is encrypted at rest
    Given sensitive user data is stored in the system
    Then it should be encrypted at rest using industry-standard encryption
    And encryption keys should be rotated according to a defined schedule

  Scenario: All communication is encrypted in transit
    Given users interact with the platform over the internet
    Then all connections should use TLS 1.2 or higher
    And no sensitive data should be transmitted in plain text

  # --- Access Control ---

  Scenario: Backend enforces team-level access boundaries
    Given a user makes a request for team data
    Then the system should verify the user is authenticated
    And verify the user is a member of the requested team
    And deny the request if either check fails

  Scenario: Individual assessment responses are isolated at the data layer
    Given partner responses are stored in the system
    Then a partner's individual responses should only be retrievable in their own session
    And no query path should allow one partner to retrieve another's raw responses

  # --- AI Service Integration ---

  Scenario: AI calls exclude personally identifiable information
    Given assessment data is sent to an external AI service for analysis
    Then partner names and email addresses should be stripped before transmission
    And partners should be referenced only by anonymized labels
    And the AI service should be configured to not retain or train on the data

  # --- Audit & Compliance ---

  Scenario: Security-relevant actions are auditable
    Then the system should maintain an audit trail covering:
      | event_category                    |
      | Account lifecycle (create, delete)|
      | Authentication (login, lockout)   |
      | Team lifecycle (create, delete)   |
      | Partner changes (join, leave)     |
      | Assessment submissions            |
      | Report generation                 |
      | Data export and deletion requests |
    And audit records should be retained for a minimum of 2 years
    And audit records should not contain raw assessment answers

  # --- Performance ---

  Scenario: Report generation completes within a reasonable time
    Given all partners have completed their assessments
    When the compatibility report is generated
    Then partners should see a progress indicator
    And the report should be ready within 5 minutes under normal load

  Scenario: Idea generation completes within a reasonable time
    Given all partners have completed their venture inputs
    When venture candidates are generated
    Then partners should see a progress indicator
    And ideas should be ready within 5 minutes under normal load

  # --- Availability ---

  Scenario: Assessment progress is not lost on connection interruption
    Given a partner is completing an assessment
    When their connection is interrupted
    Then all previously saved section progress should be preserved
    And they should be able to resume from where they left off
