Feature: AI-Powered Startup Idea Generation
  As a founding team,
  We want the system to generate startup ideas tailored to our combined profile,
  So that we can discover ventures uniquely suited to our skills, interests, and circumstances.

  Background:
    Given team "Acme Ventures" has partners: Alice and Bob
    And all partners have completed their venture discovery inputs
    And the team profile summary is visible on the venture discovery page

  # --- Idea Generation Triggering ---

  Scenario: Idea generation begins when all partners submit venture inputs
    Given Alice has completed her venture inputs
    And Bob has just completed his venture inputs
    Then the system should begin the idea generation process
    And all partners should be notified that ideas are being generated

  Scenario: Idea generation requires minimum inputs
    Given Alice has completed her inputs
    But Bob has only completed 1 of 7 sections
    Then idea generation should NOT begin
    And Bob should see a prompt to complete at least the minimum required sections

  # --- Idea Generation Progress ---

  Scenario: Partners see progress while ideas are being generated
    Given idea generation has been triggered
    When partners view the venture discovery page
    Then they should see a progress indicator
    And a message "Generating venture candidates tailored to your team"

  Scenario: Idea generation failure is handled gracefully
    Given idea generation has been triggered
    When the generation fails
    Then partners should see "Idea generation encountered an issue"
    And they should be offered the option to retry

  # --- Idea Generation Process ---

  Scenario: System generates a curated set of venture candidates
    When the idea generation completes
    Then the team should receive between 10-20 venture candidates
    And no two candidates should target the same customer segment with the same solution approach
    And the candidates should span multiple industries, business models, and risk levels

  Scenario: Generated ideas clearly reflect the team's profile
    When idea generation completes
    Then each venture candidate's "Team-Fit Score" explanation should reference:
      | observable_evidence                                                  |
      | Specific team skills that match the venture's requirements          |
      | Relevant domain expertise from the team profile                    |
      | Network strengths that could accelerate this specific venture      |
      | How the venture's revenue timeline fits the team's financial runway |
    And the set of ideas should not include ventures in industries the team marked as "avoid"
    And the set should reflect business models and customer types the team preferred

  Scenario: Partner-submitted ideas appear alongside system-generated ideas
    Given partners submitted their own startup ideas during the venture inputs phase
    When idea generation completes
    Then partner-submitted ideas should appear in the candidate list with the same structure as system-generated ones
    And each should have a full profile (team-fit score, market opportunity, feasibility, etc.)
    And their origin should NOT be attributed to a specific partner
    And if a submitted idea has no viable market or customer, it should still appear with a low market attractiveness score rather than being silently excluded

  # --- Venture Candidate Structure ---

  Scenario: Each venture candidate has a comprehensive profile
    When I view a generated venture candidate
    Then it should include:
      | section                | description                                         |
      | Name                   | A working name for the venture                      |
      | One-liner              | A single sentence describing the idea               |
      | Problem Statement      | The specific problem being solved                   |
      | Target Customer        | Who this is for (persona, segment, market)          |
      | Proposed Solution      | How the product/service addresses the problem       |
      | Business Model         | How it makes money                                  |
      | Market Opportunity     | TAM/SAM/SOM estimates with reasoning                |
      | Competitive Landscape  | Existing players and differentiation                |
      | Team-Fit Score         | Why THIS team is suited for THIS idea (0-100)       |
      | Market Attractiveness  | Market size, growth, timing (0-100)                 |
      | Feasibility            | What it takes to build an MVP (effort, cost, time)  |
      | Risk Profile           | Key risks and mitigations                           |
      | Unfair Advantages      | What this team has that competitors don't           |
      | First 90 Days          | Concrete steps to begin validating this idea        |
      | Revenue Timeline       | Estimated months to first revenue                   |

  Scenario: Team-fit score explains why the idea matches the team
    When I view the team-fit score for an idea
    Then the explanation should reference the team's strengths without naming individual partners:
      | example_reasoning                                                           |
      | "Your team's FinTech domain expertise gives you direct customer access"    |
      | "Your team's ML engineering skills align with the core technical challenge"|
      | "Your combined network includes potential design partners"                  |
      | "Your team's risk tolerance matches the 18-month R&D timeline"             |

  Scenario: Market opportunity includes data-informed estimates
    When I view the market opportunity for an idea
    Then it should include:
      | field                                    |
      | Total Addressable Market (TAM)           |
      | Serviceable Addressable Market (SAM)     |
      | Serviceable Obtainable Market (SOM)      |
      | Market growth rate                       |
      | Key market trends driving opportunity    |
      | Timing assessment (too early, right time, late) |

  Scenario: First 90 days plan is actionable
    When I view the "First 90 Days" for an idea
    Then it should include specific steps like:
      | week_range | activities                                              |
      | Week 1-2   | Customer discovery interviews (with suggested personas) |
      | Week 3-4   | Competitive deep-dive and positioning                   |
      | Week 5-8   | MVP specification and prototype                        |
      | Week 9-12  | Beta launch with target early adopters                  |

  # --- Idea Diversity ---

  Scenario: Ideas span different risk levels
    When idea generation completes
    Then the set should include:
      | risk_category  | count_range | description                         |
      | Safe bets      | 3-5         | Proven markets, clear demand        |
      | Calculated risks| 4-8        | Growing markets, some validation needed |
      | Moonshots      | 2-4         | Novel markets, high upside if it works |

  Scenario: Ideas span different time-to-revenue profiles
    When idea generation completes
    Then the set should include:
      | revenue_timeline | description                            |
      | Quick (0-6 mo)   | Can generate revenue fast              |
      | Medium (6-18 mo) | Requires some building before revenue  |
      | Long (18+ mo)    | Deep tech or marketplace dynamics      |

  Scenario: Ideas reflect intersections of team interests
    Given some partners are passionate about HealthTech and others about Developer Tools
    And all partners expressed interest in AI
    When idea generation completes
    Then at least some ideas should sit at the intersection of shared interests (e.g., AI tools for healthcare developers)
    And the reasoning should explain why the intersection is relevant to this team

  # --- External Intelligence ---

  Scenario: Generated ideas reference current market context
    When idea generation completes
    Then each venture candidate's "Market Opportunity" section should reference:
      | observable_evidence                                          |
      | Relevant technology or industry trends                      |
      | Why the timing is right (or risky) for this idea            |
      | How the competitive landscape looks today                   |
      | What market shifts or tailwinds support this opportunity    |

  Scenario: Competitive landscape is realistic
    When I view the competitive landscape for an idea
    Then it should identify:
      | competitive_element                                    |
      | Direct competitors (companies solving same problem)   |
      | Indirect competitors (alternative solutions)          |
      | Potential future competitors (big tech, adjacent companies) |
      | Open source alternatives                              |
      | Why this team can still win despite competition        |

  # --- Regeneration and Refinement ---

  Scenario: Request more ideas in a specific direction
    Given the team has received the initial set of ideas
    When a partner requests "more ideas like Candidate #3 but for healthcare"
    Then the system should generate 5 additional ideas in that direction
    And add them to the existing candidate pool

  Scenario: Request ideas with specific constraints
    When a partner requests ideas with constraints like:
      | constraint                                     |
      | Must reach revenue within 6 months            |
      | Must not require more than $50K to start      |
      | Must be B2B SaaS                              |
    Then the system should generate ideas that satisfy all constraints

  Scenario: Full regeneration with updated inputs
    Given partners have updated their venture inputs
    When they request a full regeneration
    Then the system should generate a new set of 10-20 ideas
    And the previous set should be archived but still accessible
