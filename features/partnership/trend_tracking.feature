Feature: Partnership Trend Tracking
  As a founding team,
  We want to see how our partnership health evolves over time,
  So that we can proactively address negative trends and celebrate improvements.

  Background:
    Given team "Acme Ventures" has completed at least 2 assessment rounds
    And historical compatibility reports are available

  # --- Trend Dashboard ---

  Scenario: View partnership health timeline
    When I navigate to the trend tracking dashboard
    Then I should see a timeline visualization showing:
      | metric                    | visualization         |
      | Overall compatibility     | Line chart over time  |
      | Dimension sub-scores      | Multi-line chart      |
      | Risk count by severity    | Stacked bar chart     |
      | Key events / milestones   | Markers on timeline   |

  Scenario: Trend data starts from the initial assessment
    Given the team completed the initial assessment on Jan 1
    And pulse surveys on Feb 1, Mar 1, and Apr 1
    When I view the trend dashboard
    Then I should see 4 data points on the timeline
    And the initial assessment should be labeled as "Baseline"

  # --- Dimension-Level Trends ---

  Scenario: Track each section's trajectory independently
    When I view dimension-level trends
    Then I should see individual trend lines for each assessment section:
      | section                      |
      | Identity & Motivation        |
      | Working Style & Psychology   |
      | Skills & Capabilities        |
      | Structural & Practical       |
      | Relationship & Trust         |
    And each should show whether it is improving, stable, or declining

  Scenario: Drill into a specific section
    Given the "Relationship & Trust" score has declined over 3 months
    When I click on the "Relationship & Trust" trend
    Then I should see:
      | detail                                                    |
      | Score at each assessment point                           |
      | Key factors driving the change (anonymized)              |
      | Specific recommendations for improvement                  |
      | Comparison to baseline                                   |

  # --- Alerts and Early Warnings ---

  Scenario: Alert on significant score decline
    Given the overall compatibility score dropped by more than 15 points
    When the latest report is generated
    Then all partners should receive an alert
    And the alert should say "Your partnership health score has declined significantly"
    And it should recommend scheduling a partnership discussion

  Scenario: Alert on section score crossing into risk zone
    Given the "Structural & Practical" score was 72 last month
    And the "Structural & Practical" score is now 38
    When the report is generated
    Then a specific alert should be raised for "Structural & Practical"
    And the report should include urgent recommendations for this dimension

  Scenario: Positive trend acknowledgment
    Given the "Relationship & Trust" score has improved for 3 consecutive rounds
    When the latest report is generated
    Then the report should acknowledge the positive trend
    And suggest practices that are working to keep doing

  # --- Comparative Insights ---

  Scenario: Compare current state to baseline
    When I view the trend dashboard
    Then I should be able to toggle a "Compare to baseline" view
    And it should show delta values for each dimension
    And highlight the biggest improvements and declines

  Scenario: View report-over-report diff
    When I select two specific reports to compare
    Then I should see a side-by-side comparison of:
      | element             |
      | Overall score       |
      | Dimension scores    |
      | Risk factors        |
      | Recommendations     |
      | New vs resolved issues |

  # --- Trend Annotations ---

  Scenario: Add context annotations to the timeline
    Given I am viewing the trend dashboard
    When I add an annotation at a specific date
    Then I should be able to add a note like "Pivoted to B2B focus"
    And this annotation should appear as a marker on the timeline
    And subsequent reports should reference relevant annotations when explaining score changes

  Scenario: System auto-annotates milestone events
    Given a partner recorded the milestone "Raised Seed Round"
    Then the timeline should automatically show this event
    And correlate it with any score changes around that date

  # --- Data Export ---

  Scenario: Export trend data
    When I choose to export trend data
    Then I should be able to download:
      | format | contents                                    |
      | CSV    | All scores by section by date               |
      | PDF    | Visual trend report with charts             |

  # --- Predictive Insights ---

  Scenario: Predictive insights are shown after enough data points
    Given the team has at least 3 data points
    When I view the trend dashboard
    Then I should see a "Predictive Insights" section showing:
      | insight_type                                                     |
      | Projected trajectory if current patterns continue               |
      | Which section is most at risk of declining                      |
      | What actions would have the highest impact                      |
      | How this team compares to typical founding team patterns        |

  Scenario: Partnership health forecast
    Given the team has 6+ months of data
    When I view the trend dashboard
    Then I should see a 3-month forecast with confidence intervals
    And it should be clearly labeled as a projection, not a certainty
