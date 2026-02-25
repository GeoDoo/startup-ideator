Feature: Deep Partnership Assessment
  As a potential co-founder,
  I want to complete an in-depth assessment about myself,
  So that the system can analyze compatibility with my potential partners.

  Background:
    Given I am a partner in team "Acme Ventures"
    And the team has at least 2 partners

  # =============================================
  # Section 1: Identity & Motivation
  # =============================================

  Scenario: Complete the Identity & Motivation section
    When I begin the assessment
    Then I should see "Identity & Motivation" as the first section
    And it should contain questions about:
      | topic                                                        |
      | Primary motivation for starting a company                    |
      | Definition of personal success in 1, 3, and 10 years        |
      | What I am willing to sacrifice (salary, time, relationships) |
      | Preferred exit strategy                                      |
      | Long-term vision for the venture                             |
      | Personal why — the deeper reason behind entrepreneurship     |
      | Previous entrepreneurial experience and lessons learned      |

  Scenario: Motivation ranking question
    Given I am on the Identity & Motivation section
    When I see the question "Rank your motivations for starting a company"
    Then I should be able to rank the following in order of importance:
      | motivation          |
      | Financial freedom   |
      | Impact / mission    |
      | Autonomy            |
      | Building a legacy   |
      | Creative expression |
      | Status / recognition|
      | Learning / growth   |

  Scenario: Exit strategy preference
    Given I am on the Identity & Motivation section
    When I answer the exit strategy question
    Then I should choose from:
      | option                                    |
      | Build a lifestyle business (no exit)      |
      | Acquisition within 3-5 years              |
      | Acquisition within 5-10 years             |
      | IPO                                       |
      | No preference — depends on circumstances  |
    And I should explain my reasoning in a free-text field

  # =============================================
  # Section 2: Working Style & Psychology
  # =============================================

  Scenario: Complete the Working Style & Psychology section
    When I navigate to "Working Style & Psychology"
    Then it should contain questions about:
      | topic                                                           |
      | Decision-making style (data-driven vs intuition, fast vs slow) |
      | Risk tolerance on a spectrum                                    |
      | Conflict resolution approach                                    |
      | Communication preferences and frequency                        |
      | Energy patterns (sprinter vs marathoner)                        |
      | Work schedule preferences                                      |
      | Response to failure and setbacks                                |
      | Stress management and coping mechanisms                         |
      | Need for structure vs flexibility                               |
      | Delegation comfort level                                        |

  Scenario: Decision-making style assessment
    Given I am on the "Working Style & Psychology" section
    When I answer the decision-making questions
    Then I should rate myself on multiple spectrums:
      | spectrum_left      | spectrum_right    |
      | Data-driven        | Intuition-driven  |
      | Fast decisions     | Deliberate        |
      | Consensus-seeking  | Decisive alone    |
      | Risk-taking        | Risk-averse       |
    And each spectrum should be a slider from 1 to 10

  Scenario: Conflict resolution style identification
    Given I am on the "Working Style & Psychology" section
    When I answer the conflict resolution question
    Then I should identify my primary and secondary styles from:
      | style          | description                                      |
      | Competing      | I push for my position firmly                    |
      | Collaborating  | I seek win-win solutions                         |
      | Compromising   | I find middle ground quickly                     |
      | Avoiding       | I prefer to let things cool down first           |
      | Accommodating  | I prioritize the relationship over the issue     |

  Scenario: Scenario-based stress response
    Given I am on the "Working Style & Psychology" section
    When I see a scenario question about stress
    Then I should respond to scenarios like:
      | scenario                                                                |
      | Your co-founder makes a major decision without consulting you          |
      | A key employee quits unexpectedly during a critical launch             |
      | You discover your co-founder has been talking to investors without you |
      | Revenue drops 40% in one quarter                                       |
    And for each scenario I should describe my likely reaction in free text
    And rate my emotional intensity from 1-10

  # =============================================
  # Section 3: Skills & Capabilities
  # =============================================

  Scenario: Complete the Skills & Capabilities section
    When I navigate to "Skills & Capabilities"
    Then it should contain questions about:
      | topic                                                    |
      | Technical skills inventory with self-rating              |
      | Business skills inventory with self-rating               |
      | Domain expertise areas and depth                         |
      | Network strength by category                             |
      | Skills I can teach others                                |
      | Skills I need to learn or hire for                       |
      | Unique abilities or unfair advantages                    |
      | Past roles and what I excelled at                        |

  Scenario: Technical skills self-assessment
    Given I am on the "Skills & Capabilities" section
    When I rate my technical skills
    Then I should rate each skill from 0 (none) to 5 (expert):
      | skill_category        | examples                                    |
      | Software Engineering  | Frontend, Backend, Mobile, DevOps            |
      | Data & AI             | ML, Data Engineering, Analytics              |
      | Design                | UI/UX, Product Design, Branding              |
      | Infrastructure        | Cloud, Security, Networking                  |
      | Hardware / IoT        | Embedded systems, Manufacturing              |
    And I should be able to add custom skills not in the list

  Scenario: Business skills self-assessment
    Given I am on the "Skills & Capabilities" section
    When I rate my business skills
    Then I should rate each skill from 0 (none) to 5 (expert):
      | skill_category      | examples                                       |
      | Sales               | B2B, B2C, Enterprise, Channel                  |
      | Marketing           | Growth, Content, Brand, Paid                   |
      | Finance             | Fundraising, Financial modeling, Accounting     |
      | Operations          | Supply chain, HR, Legal, Process                |
      | Strategy            | Market analysis, Competitive strategy, Pricing  |
      | Product             | Product management, User research, Roadmapping  |
      | Leadership          | Team building, Culture, Mentoring               |

  Scenario: Network strength assessment
    Given I am on the "Skills & Capabilities" section
    When I assess my network
    Then I should rate my network strength (weak/moderate/strong) in:
      | network_category    |
      | Investors (Angels)  |
      | Investors (VC)      |
      | Potential customers |
      | Technical talent    |
      | Industry experts    |
      | Advisors / mentors  |
      | Media / PR          |
      | Government / Policy |

  # =============================================
  # Section 4: Structural & Practical
  # =============================================

  Scenario: Complete the Structural & Practical section
    When I navigate to "Structural & Practical"
    Then it should contain questions about:
      | topic                                                         |
      | Financial runway (months without salary)                     |
      | Minimum salary requirements and timeline                     |
      | Time commitment (hours per week)                             |
      | Availability start date                                      |
      | Equity split expectations                                    |
      | Vesting preferences                                          |
      | Existing IP or non-compete constraints                       |
      | Geographic location and willingness to relocate              |
      | Timezone and working hours                                   |
      | Other active commitments (job, side projects, family)        |
      | Fundraising preferences (bootstrap, angel, VC, grants)      |

  Scenario: Financial runway disclosure
    Given I am on the "Structural & Practical" section
    When I answer the financial runway question
    Then I should specify:
      | field                                          | type       |
      | Months I can go without salary                 | number     |
      | Minimum monthly income needed                  | range      |
      | When I need to start drawing salary            | timeline   |
      | Savings I can invest in the venture            | range      |
      | Comfort with taking on debt for the business   | scale 1-10 |

  Scenario: Equity expectations
    Given I am on the "Structural & Practical" section
    When I answer the equity question
    Then I should specify:
      | field                                               |
      | My expected equity percentage                       |
      | Whether equity should be equal or merit-based       |
      | Vesting schedule preference (e.g. 4yr with 1yr cliff)|
      | Stance on advisor/early employee equity pool        |
      | What would change my equity expectations            |

  Scenario: Time commitment details
    Given I am on the "Structural & Practical" section
    When I answer the time commitment question
    Then I should specify:
      | field                                            |
      | Hours per week I can commit now                  |
      | When I can go full-time (if not already)         |
      | Hard constraints on my schedule                  |
      | Willingness to work weekends during crunch       |
      | Vacation expectations per year                   |

  # =============================================
  # Section 5: Relationship & Trust
  # =============================================

  Scenario: Complete the Relationship & Trust section
    When I navigate to "Relationship & Trust"
    Then it should contain questions about:
      | topic                                                              |
      | History with each partner (how long, in what context)             |
      | What I admire about each partner                                  |
      | What concerns me about each partner                               |
      | How I give and receive feedback                                   |
      | What would make me walk away from this partnership                |
      | Scenario-based trust questions                                    |
      | My expectations for transparency and information sharing          |
      | How I define loyalty in a business context                        |
      | Past partnership or collaboration experiences and lessons learned |

  Scenario: Partner-specific reflections for a 2-partner team
    Given the team has partners: Alice and Bob
    When Alice is on the "Relationship & Trust" section
    Then she should answer the following about Bob:
      | question                                                      |
      | How long have I known this person?                           |
      | In what context? (work, school, friends, met recently)       |
      | What do I admire most about them?                            |
      | What concerns me most about working with them?               |
      | On a scale of 1-10, how much do I trust their judgment?      |
      | On a scale of 1-10, how well do I know their work ethic?     |
      | Have we ever had a conflict? How was it resolved?            |

  Scenario: Partner-specific reflections scale with team size
    Given the team has partners: Alice, Bob, and Carol
    When Alice is on the "Relationship & Trust" section
    Then she should answer the same set of questions separately for Bob and for Carol

  Scenario: Dealbreaker identification
    Given I am on the "Relationship & Trust" section
    When I answer the dealbreaker question
    Then I should select from common dealbreakers and add my own:
      | dealbreaker                                             |
      | Partner is not full-time committed                     |
      | Fundamental disagreement on equity split               |
      | Lack of transparency about finances                    |
      | Partner takes another job or side project              |
      | Repeated failure to follow through on commitments      |
      | Unethical behavior                                     |
      | Inability to resolve conflicts constructively          |
      | Partner wants to pivot away from agreed direction      |
    And I should rank them by severity

  Scenario: Scenario-based trust questions
    Given I am on the "Relationship & Trust" section
    When I see the scenario-based trust questions
    Then I should respond to:
      | scenario                                                                          |
      | Your partner wants to bring in a third co-founder you don't know well            |
      | Your partner admits they made a costly mistake that sets you back 3 months        |
      | You find out your partner has been interviewing for full-time jobs               |
      | Your partner disagrees with you on a critical product decision                    |
      | A major investor wants to fund you but only if your partner steps down as CTO    |
    And for each scenario I describe what I would do and how I would feel

  # =============================================
  # Assessment Flow & UX
  # =============================================

  Scenario: Assessment can be completed in multiple sessions
    Given I have completed "Identity & Motivation" and "Working Style & Psychology"
    When I leave the assessment
    And I return later
    Then my progress should be saved
    And I should resume from "Skills & Capabilities"

  Scenario: Progress indicator shows completion status
    Given I am taking the assessment
    Then I should see a progress indicator showing:
      | section                      | status      |
      | Identity & Motivation        | Completed   |
      | Working Style & Psychology   | In Progress |
      | Skills & Capabilities        | Not Started |
      | Structural & Practical       | Not Started |
      | Relationship & Trust         | Not Started |

  Scenario: Cannot skip required questions
    Given I am on a section with required questions
    When I try to advance without answering a required question
    Then I should see a prompt to complete the required question
    And I should not be able to advance

  Scenario: Free-text answers have minimum length requirements
    Given I am answering a free-text question
    When I type fewer than 50 characters
    Then I should see a hint "Please elaborate — thoughtful answers lead to better insights"

  Scenario: Assessment estimated time is shown
    Given I am about to start the assessment
    Then I should see an estimated completion time of "45-60 minutes"
    And a note that I can save progress and return

  Scenario: Review answers before final submission
    Given I have completed all 5 sections
    When I reach the review step
    Then I should see a summary of all my answers organized by section
    And I should be able to edit any answer before submitting

  Scenario: Submit the completed assessment
    Given I have reviewed all my answers
    When I submit the assessment
    Then my assessment status should change to "completed"
    And other partners should see that I have completed the assessment
    But they should NOT see my individual answers
