Feature: Compatibility Report Generation
  As a founding team,
  We want an AI-generated compatibility report based on our assessments,
  So that we can understand our strengths, risks, and areas to address as partners.

  Background:
    Given team "Acme Ventures" has partners: Alice and Bob
    And all partners have completed their assessments

  # --- Report Triggering ---

  Scenario: Report is generated when all partners complete assessments
    Given Alice has completed her assessment
    And Bob has just completed his assessment
    Then the compatibility report should begin generating
    And all partners should be notified that the report is being generated

  Scenario: Report generation requires all partners to have completed assessments
    Given Alice has completed her assessment
    But Bob has NOT completed his assessment
    Then the report should NOT be generated
    And Alice should see a message "Waiting for all partners to complete their assessments"

  Scenario: Report generation shows progress
    Given all partners have completed their assessments
    When the compatibility report is being generated
    Then all partners should see a progress indicator on the team dashboard
    And the indicator should explain "Your compatibility report is being prepared"

  Scenario: Report generation failure is handled gracefully
    Given all partners have completed their assessments
    When the report generation fails
    Then all partners should see a message "Report generation encountered an issue"
    And they should be offered the option to retry

  Scenario: Manual report regeneration
    Given a compatibility report has already been generated
    When any partner requests a report regeneration
    Then a new report should be generated using the latest assessment data
    And the previous report should be archived and still accessible

  # --- Report Structure: Alignment Map ---

  Scenario: Report includes an Alignment Map
    When the compatibility report is generated
    Then it should contain an "Alignment Map" section showing:
      | element                                                          |
      | Areas of strong agreement across all partners                   |
      | Areas of moderate alignment                                     |
      | Areas of significant divergence                                 |
    And each area should include a brief explanation of why it matters

  Scenario: Alignment Map covers all assessment dimensions
    When the compatibility report is generated
    Then the Alignment Map should cover topics from all five assessment sections:
      | assessment_section           | example_topics_analyzed                            |
      | Identity & Motivation        | Vision alignment, exit strategy, core motivations  |
      | Working Style & Psychology   | Decision-making, risk tolerance, conflict style     |
      | Skills & Capabilities        | Skill overlap, complementarity, network coverage   |
      | Structural & Practical       | Financial runway, equity, time commitment           |
      | Relationship & Trust         | Trust levels, communication, dealbreakers           |

  # --- Report Structure: Risk Radar ---

  Scenario: Report includes a Risk Radar
    When the compatibility report is generated
    Then it should contain a "Risk Radar" section with:
      | element                                                              |
      | Identified risk factors ranked by severity (critical, high, medium) |
      | Explanation of each risk                                            |
      | Potential impact on the partnership                                 |
      | Suggested mitigations                                               |

  Scenario: Risk categorization
    When the compatibility report identifies risks
    Then each risk should be categorized as:
      | severity | meaning                                                    |
      | Critical | Could cause partnership failure if not addressed immediately |
      | High     | Significant friction likely without proactive management    |
      | Medium   | Worth discussing but manageable                             |
      | Low      | Minor difference, unlikely to cause issues                  |

  Scenario: Common risk patterns are detected
    When the report analyzes partner responses
    Then it should detect patterns such as:
      | risk_pattern                                               |
      | Equity expectation mismatch (sum exceeds 100%)            |
      | Commitment level asymmetry                                 |
      | Conflicting exit timelines                                 |
      | Overlapping skills with no one covering critical gaps      |
      | Financial runway mismatch                                  |
      | Divergent conflict resolution styles                       |
      | Dealbreaker conflicts (one partner's must-have is another's no-go) |
      | Trust deficit signals                                      |

  # --- Report Structure: Blind Spots ---

  Scenario: Report identifies blind spots
    When the compatibility report is generated
    Then it should contain a "Blind Spots" section with:
      | element                                                           |
      | Skills neither partner possesses that are critical for the stage |
      | Topics no partner mentioned or considered                        |
      | Assumptions both partners are making                             |
      | External risks neither partner has accounted for                 |

  Scenario: Skill gap identification
    Given no partner in the team has strong Finance skills
    When the report is generated
    Then the Blind Spots section should flag "Financial expertise is a critical gap"
    And suggest "Consider bringing on a finance-savvy advisor or third co-founder"

  # --- Report Structure: Recommendations ---

  Scenario: Report includes actionable recommendations
    When the compatibility report is generated
    Then it should contain a "Recommendations" section with:
      | recommendation_type                                                |
      | Conversations the partners need to have (specific topics)         |
      | Agreements to put in writing (e.g., vesting, equity, roles)       |
      | Exercises or activities to strengthen the partnership             |
      | External resources (books, frameworks, advisors)                  |
      | Suggested role division based on complementary strengths          |

  Scenario: Recommendations are prioritized
    When the report lists recommendations
    Then they should be ordered by urgency:
      | priority     | meaning                            |
      | Do now       | Address before committing          |
      | Do soon      | Address within first month         |
      | Ongoing      | Build into regular partnership habits |

  # --- Report Structure: Overall Score ---

  Scenario: Report includes an overall compatibility score
    When the compatibility report is generated
    Then it should include an overall score from 0-100
    And a qualitative label:
      | score_range | label                                           |
      | 80-100      | Strong foundation — well-positioned to succeed  |
      | 60-79       | Promising — address flagged areas                |
      | 40-59       | Proceed with caution — significant work needed   |
      | 20-39       | High risk — critical issues to resolve           |
      | 0-19        | Reconsider — fundamental misalignment detected   |

  Scenario: Score breakdown by assessment section
    When the compatibility report is generated
    Then the score should break down into sub-scores matching the five assessment sections:
      | section                      | score_range |
      | Identity & Motivation        | 0-100       |
      | Working Style & Psychology   | 0-100       |
      | Skills & Capabilities        | 0-100       |
      | Structural & Practical       | 0-100       |
      | Relationship & Trust         | 0-100       |

  # --- Report Structure: Partnership Archetype ---

  Scenario: Report identifies the partnership archetype
    When the compatibility report is generated
    Then it should map the partnership to known archetypes:
      | archetype                  | description                                     |
      | The Mirror                 | Very similar profiles — beware of blind spots   |
      | The Complement             | Strong yin-yang dynamic — classic founder duo    |
      | The Specialist Duo         | Both deep in different domains                   |
      | The Visionary + Operator   | One dreams big, one executes — powerful if aligned|
      | The Collective             | Multiple partners covering wide ground           |
    And explain the strengths and watchouts for their archetype

  # --- Report Delivery ---

  Scenario: All partners receive the report simultaneously
    When the compatibility report is generated
    Then all partners should be notified at the same time
    And the report should be visible to all partners on the team dashboard

  Scenario: Report is presented in readable sections
    When a partner views the report
    Then it should be organized into clear sections with:
      | section                | format                    |
      | Executive Summary      | 3-5 bullet points         |
      | Alignment Map          | Visual + prose            |
      | Risk Radar             | Severity-ranked list      |
      | Blind Spots            | Categorized warnings      |
      | Recommendations        | Prioritized action items  |
      | Score & Archetype      | Score card + description  |

  Scenario: Report can be exported as PDF
    Given the compatibility report has been generated
    When a partner chooses to export the report
    Then a well-formatted PDF should be generated
    And it should include all report sections

  # --- Report for 3+ Partners ---

  Scenario: Report handles multi-partner teams
    Given the team has partners: Alice, Bob, and Carol
    When the compatibility report is generated
    Then it should analyze:
      | analysis_type                              |
      | Overall team compatibility                 |
      | Pairwise compatibility (Alice-Bob, etc.)  |
      | Team-level skill coverage                  |
      | Team-level risk factors                    |
      | Role suggestions for each partner          |
    And pairwise insights should be anonymized where needed

  # --- AI Analysis Quality ---

  Scenario: Report insights reference established research where relevant
    When the compatibility report is generated
    Then insights should cite or draw on recognized partnership research where relevant
    And the report should name the frameworks it draws from (e.g., "The Founder's Dilemmas", Belbin Team Roles)
    And each cited framework should be connected to a specific finding about this team

  Scenario: Report avoids generic advice
    When the compatibility report is generated
    Then every insight should be specific to this team's actual assessment answers
    And the report should NOT contain generic platitudes like "communication is important"
    And each recommendation should clearly reference what in the team's responses prompted it
