Feature: Multi-Partner Support
  As a founding team with 2 or more partners,
  I want the system to handle any team size,
  So that teams of any composition can use the platform.

  # --- Team Size Dynamics ---

  Scenario: Two-partner team (minimum viable team)
    Given a team with exactly 2 partners
    Then the partnership assessment should work as pairwise analysis
    And the compatibility report should focus on the dyad
    And partners should see a note about limited anonymity with only 2 partners

  Scenario: Three-partner team
    Given a team with 3 partners
    Then the compatibility report should analyze:
      | analysis_level                                |
      | Overall team compatibility                   |
      | Pairwise: Partner A ↔ Partner B             |
      | Pairwise: Partner A ↔ Partner C             |
      | Pairwise: Partner B ↔ Partner C             |
      | Team-level dynamics and group patterns        |

  Scenario: Large team (5+ partners)
    Given a team with 5 partners
    Then the report should include:
      | additional_analysis                                            |
      | Subgroup detection (clusters of aligned partners)             |
      | Potential coalition risks                                     |
      | Role coverage analysis (are all critical roles covered?)      |
      | Communication complexity warnings as team size grows          |
      | Suggested organizational structure                            |

  Scenario: Maximum team size is 10
    Given a team has 10 partners
    When the creator tries to add an 11th partner
    Then they should see "Maximum team size of 10 partners reached"

  # --- Anonymity Scaling ---

  Scenario: Anonymity is stronger with more partners
    Given a team with 5 partners
    Then individual responses are well-protected by the group size
    And the report can safely use more specific language

  Scenario: Anonymity limitations with 2 partners are disclosed
    Given a team with 2 partners
    Then partners should see a clear disclosure:
      | disclosure                                                              |
      | "With only 2 partners, some inferences about individual answers may be possible" |
      | "The report uses aggregated language but full anonymity cannot be guaranteed"     |

  # --- Assessment Adaptations ---

  Scenario: Partner-specific questions scale with team size
    Given a team with 4 partners: Alice, Bob, Carol, and Dan
    When Alice reaches the "Relationship & Trust" section
    Then she should answer partner-specific questions for each of:
      | partner |
      | Bob     |
      | Carol   |
      | Dan     |

  Scenario: Assessment time increases with team size
    Given a team with 5 partners
    When a partner starts the assessment
    Then the estimated time should account for additional partner-specific questions
    And the estimated time should display as "60-75 minutes"

  # --- Report Adaptations ---

  Scenario: Pairwise compatibility matrix for 3+ partners
    Given a team with 4 partners
    When the compatibility report is generated
    Then it should include a pairwise compatibility matrix:
      | partner_a | partner_b | compatibility_score |
      | A         | B         | 78                  |
      | A         | C         | 65                  |
      | A         | D         | 82                  |
      | B         | C         | 71                  |
      | B         | D         | 59                  |
      | C         | D         | 88                  |
    And the matrix should be anonymized (partners identified by role, not name) if needed

  Scenario: Identify the strongest and weakest partner pairs
    Given a pairwise compatibility matrix exists
    Then the report should highlight:
      | insight                                                         |
      | The strongest partner pair and what makes them compatible      |
      | The weakest partner pair and specific friction points          |
      | Recommendations for strengthening weaker partnerships          |

  Scenario: Role suggestion adapts to team size
    Given a team with 3 partners
    When the report suggests roles
    Then it should suggest distinct roles for each partner:
      | role_type                                               |
      | Who should lead product/vision (CEO)                   |
      | Who should lead technology (CTO)                       |
      | Who should lead growth/operations (COO/CMO)            |
    And explain the reasoning based on skills and preferences

  # --- Venture Discovery Adaptations ---

  Scenario: Idea alignment is more complex with more partners
    Given a team with 4 partners
    When the alignment reveal is generated
    Then it should show:
      | metric                                                    |
      | Ideas with unanimous enthusiasm (all 4 excited)          |
      | Ideas with majority enthusiasm (3 of 4)                  |
      | Ideas with split opinions (2 vs 2)                       |
      | Ideas with minority enthusiasm (1 of 4)                  |

  Scenario: Voting threshold for 2-partner team
    Given a team with 2 partners
    When selecting a venture to pursue
    Then both partners must agree (unanimous)
    And if they disagree they should be guided through a structured discussion

  Scenario: Voting threshold for 3-partner team
    Given a team with 3 partners
    When selecting a venture to pursue
    Then at least 2 of 3 partners must agree
    And the threshold should be displayed before voting begins

  Scenario: Voting threshold for 4+ partner teams
    Given a team with 4 or more partners
    When selecting a venture to pursue
    Then at least 75% of partners must agree (supermajority)
    And the threshold should be displayed before voting begins

  Scenario: Voting rules are consistent across shortlisting and final selection
    Given the team is in the venture discovery flow
    Then the same voting thresholds should apply to both shortlisting and final selection

  # --- Partner Changes ---

  Scenario: New partner joins an existing team
    Given the team has completed one round of assessments
    When a new partner joins
    Then the new partner should complete the full assessment
    And the existing report should be flagged as "outdated — new partner added"
    And a new report should be generated once the new partner completes their assessment

  Scenario: Partner leaves the team
    Given the team has 3 partners and a compatibility report
    When one partner leaves
    Then the report should be regenerated for the remaining 2 partners
    And historical data should reflect the team composition at each point in time
    And the trend dashboard should show a marker for "Partner departed"

  Scenario: Partner removal does not delete historical data
    Given Carol left the team after 3 assessment rounds
    When I view the trend dashboard
    Then I should see data for all 3 rounds
    And rounds that included Carol should be noted as "3-partner team"
    And rounds after Carol left should be noted as "2-partner team"

  Scenario: Partner leaves during an active assessment round
    Given a pulse survey is in progress
    And Alice and Bob have completed it but Carol has not
    When Carol leaves the team
    Then the report should be generated for the remaining partners
    And the report should note "Generated after a team composition change"

  Scenario: Partner leaves during active idea rating
    Given venture candidates have been generated
    And Alice has completed her ratings but Carol has not
    When Carol leaves the team
    Then the alignment reveal should proceed with the remaining partners' ratings
    And a note should explain "Team composition changed during this round"
