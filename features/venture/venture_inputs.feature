Feature: Venture Discovery Inputs
  As a founding team partner,
  I want to provide my interests, domain knowledge, and entrepreneurial preferences,
  So that the system can generate startup ideas uniquely suited to our team.

  Background:
    Given I am a partner in team "Acme Ventures"
    And the team has completed the partnership assessment

  # --- Team Profile from Partnership Assessment ---

  Scenario: Venture discovery shows a team profile derived from the partnership assessment
    When I open the venture discovery section
    Then I should see a "Team Profile" card that summarizes our combined strengths
    And the profile should reflect data from the completed partnership assessment:
      | derived_summary                                   |
      | Combined skills across all partners (aggregated) |
      | Domain expertise areas                           |
      | Network strength by category                     |
      | Risk tolerance range                             |
      | Financial runway range                           |
      | Time commitment range                            |
      | Exit preference (aligned or divergent)           |

  Scenario: Team profile card shows specific values
    When I view the venture discovery section
    Then the "Team Profile" card should display:
      | field                          | example                              |
      | Strongest skills               | Backend engineering, B2B sales       |
      | Domain expertise               | FinTech, Healthcare                  |
      | Network advantages             | Strong VC network, access to SMBs    |
      | Risk profile                   | Moderate (range: 4-7)                |
      | Runway                         | 8-14 months                          |
      | Preferred exit                 | Acquisition (aligned)                |

  # --- Partner-Specific Venture Inputs ---

  Scenario: Each partner completes venture discovery inputs independently
    When I begin the venture inputs questionnaire
    Then I should answer questions about my personal venture preferences
    And my answers should be anonymous by default

  Scenario: Passion and interest areas
    When I am on the "Interests & Passions" section
    Then I should be able to:
      | action                                                              |
      | Select industries I'm passionate about from a curated list         |
      | Add custom industries or niches not on the list                    |
      | Rank my top 5 industries by enthusiasm                            |
      | Describe in free text: problems I care deeply about               |
      | Describe in free text: communities or customers I want to serve    |

  Scenario: Industry selection from curated list
    When I view the industry list
    Then I should see categories including:
      | industry             |
      | HealthTech           |
      | FinTech              |
      | EdTech               |
      | Climate / CleanTech  |
      | AI / ML              |
      | Developer Tools      |
      | E-commerce / Retail  |
      | Real Estate / PropTech|
      | Food / AgriTech      |
      | Media / Entertainment|
      | Logistics / Supply Chain |
      | HR / Future of Work  |
      | Legal Tech           |
      | Cybersecurity        |
      | Biotech / Life Sciences |
      | Government / GovTech |
      | Social Impact        |
      | Gaming               |
      | Travel / Hospitality |
    And I should be able to select multiple and add custom entries

  Scenario: Problem spaces exploration
    When I am on the "Problem Spaces" section
    Then I should answer:
      | question                                                                  |
      | What frustrations do you encounter regularly in your work or life?       |
      | What industries have you seen inefficiency or waste in?                  |
      | What problems have you tried to solve before (even informally)?          |
      | What trends do you think will create new problems in the next 3-5 years? |
      | Are there underserved customer segments you've observed?                  |

  Scenario: Customer and market preferences
    When I am on the "Customer & Market" section
    Then I should specify:
      | preference                                                      |
      | Preferred customer type (B2B, B2C, B2B2C, B2G)                |
      | Company size I want to sell to (SMB, Mid-market, Enterprise)   |
      | Geographic market focus (local, national, global)              |
      | Market maturity preference (emerging, growing, mature)         |
      | Willingness to operate in regulated markets                    |

  Scenario: Business model preferences
    When I am on the "Business Model" section
    Then I should indicate preferences for:
      | model                    | interest_level                |
      | SaaS (subscription)      | Very interested / Neutral / Not interested |
      | Marketplace              | Very interested / Neutral / Not interested |
      | Transaction-based        | Very interested / Neutral / Not interested |
      | Usage-based / API        | Very interested / Neutral / Not interested |
      | Hardware + Software      | Very interested / Neutral / Not interested |
      | Services + Product       | Very interested / Neutral / Not interested |
      | Open source + Commercial | Very interested / Neutral / Not interested |
      | Advertising-based        | Very interested / Neutral / Not interested |

  Scenario: Technology and approach preferences
    When I am on the "Technology & Approach" section
    Then I should answer:
      | question                                                              |
      | Technologies I'm excited to work with (e.g., AI, blockchain, AR)    |
      | Do I prefer building from scratch or leveraging existing platforms?  |
      | Am I open to deep tech (long R&D cycles)?                           |
      | Preference for mobile-first, web-first, or platform-agnostic       |

  Scenario: Existing ideas and hunches
    When I am on the "Existing Ideas" section
    Then I should be able to:
      | action                                                               |
      | Add up to 10 startup ideas I've been thinking about                |
      | For each idea, describe the problem and proposed solution           |
      | Rate my conviction in each idea (1-10)                             |
      | Note any validation I've already done (customer conversations, etc) |

  Scenario: Anti-preferences (what to avoid)
    When I am on the "Avoid" section
    Then I should specify:
      | question                                                      |
      | Industries or verticals I want to avoid and why              |
      | Business models I'm not interested in                        |
      | Customer types I don't want to work with                     |
      | Constraints that rule out certain ideas (regulatory, ethical) |

  # --- Input Completeness ---

  Scenario: Venture inputs can be completed in multiple sessions
    Given I have completed 3 of 7 sections
    When I leave and return later
    Then my progress should be saved
    And I should see which sections are complete and which remain

  Scenario: Minimum required inputs for idea generation
    Given I have completed at least the following sections:
      | section                |
      | Interests & Passions   |
      | Problem Spaces         |
      | Customer & Market      |
    Then the system should allow idea generation to proceed
    And optional sections should be noted as "would improve results if completed"

  Scenario: Review and submit venture inputs
    Given I have completed all venture input sections
    When I review my inputs
    Then I should see a summary of all my preferences
    And I should be able to edit any section before submitting
    When I submit
    Then my venture input status should change to "completed"
