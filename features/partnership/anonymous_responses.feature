Feature: Anonymous Response Collection
  As a partner completing the assessment,
  I want my individual answers to remain anonymous,
  So that I can be fully honest without fear of judgment or conflict.

  Background:
    Given team "Acme Ventures" has partners: Alice, Bob, and Carol
    And all partners have completed their assessments

  # --- Core Anonymity Guarantees ---

  Scenario: Partners cannot see each other's raw answers
    Given Alice has completed her assessment
    When Bob views the team dashboard
    Then Bob should NOT see Alice's individual answers
    And Bob should only see that Alice's assessment status is "completed"

  Scenario: Individual answers are never visible to other partners
    Given Alice submits her assessment
    When Bob or Carol browse the team workspace
    Then they should not find any way to view Alice's individual answers
    And the only information visible about Alice should be her completion status

  Scenario: The compatibility report only shows synthesized insights
    Given all partners have completed their assessments
    When the compatibility report is generated
    Then the report should contain aggregated and synthesized insights
    And the report should NOT attribute specific answers to specific partners
    And the report should use language like "One partner feels..." or "There is a divergence in..."

  # --- Anonymity in Partner-Specific Questions ---

  Scenario: Partner-specific reflections are anonymized in reports
    Given a partner expressed concern about another partner's time commitment
    When the compatibility report is generated
    Then the report may flag "time commitment" as a concern area
    But it should NOT attribute the concern to a specific partner
    And it should use phrasing like "There are concerns within the team about time commitment alignment"

  Scenario: Dealbreaker responses are aggregated
    Given multiple partners flagged "not full-time committed" as a dealbreaker
    When the report is generated
    Then it should indicate "Multiple partners consider full-time commitment a critical factor"
    But it should NOT reveal which partners flagged it or how many

  # --- Data Access Controls ---

  Scenario: A partner can only review their own answers
    Given Alice has submitted her assessment
    When Alice views her assessment
    Then she should see all of her own answers
    But she should not find any way to view Bob's or Carol's answers

  Scenario: Team creator has no special access to individual answers
    Given Bob is the team creator
    When Bob browses any part of the team workspace
    Then Bob should NOT see Alice's or Carol's individual answers
    And Bob should have the same visibility as any other partner

  # --- Editing and Withdrawal ---

  Scenario: A partner can edit their answers before report generation
    Given Alice has submitted her assessment
    And the compatibility report has NOT been generated yet
    When Alice edits her answers
    Then her updated responses should replace the previous ones

  Scenario: A partner can withdraw their responses
    Given Alice has submitted her assessment
    When Alice chooses to withdraw her responses
    Then her status should revert to "not completed"
    And her answers should no longer be accessible to anyone
    And any previously generated report should be marked as outdated
    And partners should be notified that a new report will be generated once all assessments are complete

  # --- Transparency About Anonymity ---

  Scenario: Partners are informed about anonymity policy before starting
    Given Alice is about to start the assessment
    Then she should see a clear explanation that:
      | policy_point                                                              |
      | Your individual answers will never be shown to other partners            |
      | Reports will only contain synthesized and aggregated insights            |
      | You can edit your answers until the report is generated                  |
      | You can withdraw your responses at any time                             |
      | Even the team creator cannot see your individual answers                |

  Scenario: Anonymity notice is visible throughout the assessment
    Given Alice is completing the assessment
    Then every section should display a subtle reminder "Your answers are anonymous"
