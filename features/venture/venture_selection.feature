Feature: Venture Selection & Alignment Reveal
  As a founding team,
  We want to see where our idea preferences align,
  So that we can select the best venture to pursue together.

  Background:
    Given team "Acme Ventures" has partners: Alice and Bob
    And all partners have completed their idea ratings and rankings

  # --- Alignment Reveal ---

  Scenario: Alignment reveal becomes available when all ratings are complete
    Given all partners have submitted their ratings
    Then the alignment analysis should become available to all partners
    And all partners should be notified simultaneously

  Scenario: Alignment reveal shows mutual enthusiasm
    When I view the alignment reveal
    Then I should see ideas categorized as:
      | category            | criteria                                           |
      | Mutual Top Picks    | Ideas that appear in multiple partners' top 5      |
      | Strong Interest     | High average ratings across all partners           |
      | Divergent Interest  | One partner loves it, another doesn't              |
      | Low Interest        | Low ratings from all partners                      |

  Scenario: Mutual top picks are highlighted
    Given Alice ranked "AI Contract Review" as #1
    And Bob ranked "AI Contract Review" as #2
    When the alignment reveal is shown
    Then "AI Contract Review" should appear in "Mutual Top Picks"
    And it should show a combined enthusiasm score

  Scenario: Divergent interest triggers discussion prompt
    Given Alice rated "Crypto Payroll" as 9/10 excitement
    And Bob rated "Crypto Payroll" as 3/10 excitement
    When the alignment reveal is shown
    Then "Crypto Payroll" should be flagged as "Divergent Interest"
    And partners should see a note "This idea has split opinions — worth discussing why"

  # --- Alignment Score Per Idea ---

  Scenario: Each idea receives an alignment score
    When the alignment reveal is generated
    Then each idea should have an "Alignment Score" that reflects:
      | factor                                          |
      | How consistently excited partners are           |
      | Whether the idea appears in multiple top-5 lists|
      | How confident partners are in the idea          |
      | How willing partners are to commit to it        |
    And the scoring methodology should be explained to partners

  Scenario: Ideas are ranked by a combined score
    When the alignment reveal is generated
    Then the final ranked list should combine:
      | component                | description                              |
      | Partner Alignment        | How much do partners agree on this idea? |
      | Team-Fit                 | How well does the idea match the team?   |
      | Market Attractiveness    | How strong is the market opportunity?    |
    And the relative importance of each component should be visible to partners

  # --- Detailed Comparison View ---

  Scenario: View detailed alignment breakdown for a specific idea
    When I click on an idea in the alignment reveal
    Then I should see:
      | element                                                            |
      | Aggregated rating breakdown (excitement, confidence, fit, commit) |
      | Where partners agree and where they diverge (anonymized)         |
      | The system's team-fit analysis                                    |
      | The market opportunity summary                                   |
      | Suggested next steps if this idea is selected                    |

  Scenario: Anonymized rating aggregation for 2-person teams
    Given the team has exactly 2 partners
    When I view the aggregated ratings
    Then ratings should be presented in a way that doesn't trivially reveal individual responses
    And use ranges and averages rather than exact per-partner scores
    And include a note "With 2 partners, full anonymity of ratings is limited"

  # --- Team Discussion & Decision ---

  Scenario: Start a structured discussion on top ideas
    Given the alignment reveal has been generated
    When a partner initiates a discussion on a specific idea
    Then partners should see discussion prompts:
      | prompt                                                                |
      | What excites you most about this idea?                              |
      | What's your biggest concern about pursuing this?                    |
      | What would you need to believe to go all-in?                       |
      | How does this idea align with your long-term vision?               |
      | What's the first thing you'd want to validate?                     |

  Scenario: Vote to shortlist ideas
    Given the alignment reveal is visible
    When partners vote on which ideas to shortlist
    Then each partner can vote for up to 3 ideas to explore further
    And voting is anonymous until all partners have voted

  Scenario: Shortlisted ideas get deeper analysis
    Given 2 ideas have been shortlisted by mutual agreement
    When partners request a deeper analysis
    Then for each shortlisted idea partners should see:
      | deep_analysis_component                                           |
      | Detailed competitive analysis with named competitors             |
      | Detailed customer persona profiles (3-5 personas)                |
      | MVP specification outline                                        |
      | Go-to-market strategy options                                    |
      | Financial projections (12-month rough model)                     |
      | Key assumptions to validate                                      |
      | Recommended validation experiments with expected timelines        |

  # --- Final Venture Selection ---

  Scenario: Team selects a venture to pursue
    Given the team has reviewed shortlisted ideas
    When all partners vote to select one venture
    Then that venture should be marked as "Selected"
    And the team dashboard should update to reflect the selected venture
    And a "Getting Started" action plan should be presented to the team

  Scenario: Getting Started action plan for selected venture
    Given the team has selected "AI Contract Review" as their venture
    Then the action plan should include:
      | action_plan_section                                       |
      | Week-by-week plan for the first 90 days                  |
      | Role assignments based on partner strengths              |
      | Key milestones and decision points                       |
      | Budget estimate for MVP phase                            |
      | Customer discovery interview guide                       |
      | Competitive positioning statement                        |
      | Metrics to track from day one                           |

  Scenario: No consensus reached
    Given partners cannot agree on a single venture
    When no idea receives enough votes to be selected
    Then partners should see:
      | guidance                                                         |
      | The ideas closest to consensus highlighted                      |
      | A suggested decision framework to break the tie                 |
      | A recommendation to time-box exploration of top 2 ideas         |
      | A note that the disagreement has been recorded on the health timeline |

  Scenario: Voting rules are visible before voting begins
    Given the alignment reveal has been generated
    When partners are about to vote on venture selection
    Then the voting rules should be clearly displayed:
      | rule                                                              |
      | For 2-partner teams: both must agree (unanimous)                 |
      | For 3-partner teams: at least 2 of 3 must agree                 |
      | For 4+ partner teams: at least 75% must agree (supermajority)   |

  # --- Pivot and Re-selection ---

  Scenario: Team decides to pivot
    Given the team has been pursuing a selected venture
    When the team decides to pivot
    Then they should be able to:
      | action                                                        |
      | Return to the venture candidate list                         |
      | Regenerate ideas with updated inputs and learnings           |
      | Document why the previous idea was abandoned                 |
      | Re-enter the rating and selection flow                       |
    And the pivot should appear as an event on the partnership trend timeline

  Scenario: Learnings from abandoned venture inform next round
    Given the team abandoned "AI Contract Review" because "Market too small"
    When they regenerate venture candidates
    Then the new ideas should reflect the learnings
    And avoid generating similar ideas unless explicitly requested
    And the new ideas should address the lessons learned
