Feature: Ongoing Partnership Reassessment
  As a founding team that has completed the initial assessment,
  We want periodic check-ins on our partnership health,
  So that we can catch issues early and strengthen our collaboration over time.

  Background:
    Given team "Acme Ventures" has completed the initial compatibility assessment
    And the team has an active compatibility report

  # --- Pulse Survey Scheduling ---

  Scenario: System prompts for reassessment after configured interval
    Given the team has set reassessment frequency to "monthly"
    When 30 days have passed since the last assessment
    Then all partners should receive a notification to complete a pulse survey
    And the notification should explain "It's time for your monthly partnership check-in"

  Scenario Outline: Configurable reassessment frequency
    Given the team sets reassessment frequency to "<frequency>"
    Then partners should be prompted to complete a pulse survey every <days> days

    Examples:
      | frequency    | days |
      | Monthly      | 30   |
      | Quarterly    | 90   |
      | Semi-annually| 180  |

  Scenario: Custom reassessment frequency
    Given the team creator sets a custom reassessment frequency
    When they specify a custom interval of 45 days
    Then partners should be prompted to complete a pulse survey every 45 days
    And the custom interval must be between 14 and 365 days

  Scenario: Team creator configures the reassessment frequency
    Given I am the team creator
    When I navigate to team settings
    Then I should be able to choose from preset frequencies (Monthly, Quarterly, Semi-annually)
    Or set a custom interval in days

  # --- Pulse Survey Content ---

  Scenario: Pulse survey is shorter than the initial assessment
    When I begin a pulse survey
    Then it should take approximately 10-15 minutes to complete
    And it should focus on changes since the last assessment

  Scenario: Pulse survey covers key dynamic dimensions
    When I begin a pulse survey
    Then it should contain questions about:
      | topic                                                                  |
      | Overall satisfaction with the partnership (1-10)                       |
      | Has your commitment level changed?                                    |
      | Have your financial circumstances changed?                            |
      | Are you aligned on the current direction of the venture?              |
      | How effectively are you resolving disagreements?                      |
      | Is communication working well?                                        |
      | Do you feel heard and respected?                                      |
      | Have any new concerns emerged?                                        |
      | What's working really well in the partnership?                        |
      | What's the one thing you'd change about how you work together?       |
      | Trust level with each partner (1-10)                                  |

  Scenario: Pulse survey includes scenario-based check-ins
    When I see the scenario section of the pulse survey
    Then I should respond to at least 2 new scenarios relevant to the team's current stage
    And scenarios should evolve based on the team's stage and history

  Scenario: Pulse survey detects significant changes
    Given in my initial assessment I said my time commitment was "Full-time"
    When in the pulse survey I indicate my commitment has changed to "Part-time"
    Then this should be flagged as a significant change in the next report

  # --- Pulse Survey Anonymity ---

  Scenario: Pulse survey responses are anonymous
    When I complete a pulse survey
    Then my responses should follow the same anonymity rules as the initial assessment
    And the updated report should not attribute changes to specific partners

  # --- Updated Report Generation ---

  Scenario: Updated report is generated after all partners complete pulse survey
    Given all partners have completed the pulse survey
    Then an updated compatibility report should be generated
    And it should include a "Changes Since Last Assessment" section

  Scenario: Updated report highlights trajectory
    When the updated report is generated
    Then it should indicate for each dimension whether things are:
      | trajectory   | meaning                           |
      | Improving    | Scores trending upward            |
      | Stable       | No significant change             |
      | Declining    | Scores trending downward          |
      | New concern  | Issue not present in prior reports |
      | Resolved     | Previously flagged issue addressed |

  # --- Reminders and Nudges ---

  Scenario: Partners receive reminders if they haven't completed the pulse survey
    Given a pulse survey was triggered 5 days ago
    And Alice has not completed it
    Then Alice should receive a reminder notification
    And the reminder should be gentle and non-pressuring

  Scenario: Escalating reminders
    Given a pulse survey was triggered
    Then reminders should be sent on this schedule:
      | day  | action                                    |
      | 3    | First gentle reminder                     |
      | 7    | Second reminder with note about team value|
      | 14   | Final reminder                            |
      | 21   | Mark as skipped, notify team              |

  Scenario: Partner can skip a pulse survey
    Given a pulse survey is active
    When I choose to skip this round
    Then my skip should be recorded
    And the report should note "Not all partners participated in this round"
    And the report should use my most recent assessment answers as the baseline

  # --- Milestone-Based Reassessment ---

  Scenario: Trigger reassessment on major milestones
    When the team logs a major milestone
    Then the system should suggest an unscheduled reassessment
    And the milestone options should include:
      | milestone                                    |
      | Raised funding                               |
      | Launched MVP                                 |
      | First paying customer                        |
      | Hired first employee                         |
      | Pivoted direction                            |
      | A partner's circumstances changed             |
      | Significant disagreement occurred             |
      | Revenue milestone reached                     |

  Scenario: Milestone-triggered survey includes context-specific questions
    Given the team just raised a seed round
    When the milestone reassessment is triggered
    Then the pulse survey should include additional questions about:
      | topic                                                          |
      | How do you feel about the fundraising terms?                  |
      | Has the power dynamic shifted post-funding?                   |
      | Are you aligned on how to deploy the capital?                 |
      | Has your role clarity changed since involving investors?       |
