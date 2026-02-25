Feature: Team Creation
  As a founder looking to validate a potential partnership,
  I want to create a team workspace,
  So that I can invite my potential co-founders and begin the assessment process.

  Background:
    Given the platform is accessible

  # --- Core Team Creation ---

  Scenario: Create a new team with a name and description
    Given I am a registered user
    When I create a new team with name "Acme Ventures" and description "AI-powered logistics"
    Then a team "Acme Ventures" should be created
    And I should be assigned as the team creator
    And I should see the team dashboard

  Scenario: Team creator becomes the first partner automatically
    Given I am a registered user
    When I create a new team
    Then I should be added as the first partner of the team
    And my partner status should be "active"

  Scenario: Team requires a unique name per user
    Given I have already created a team named "Acme Ventures"
    When I try to create another team named "Acme Ventures"
    Then I should see an error "You already have a team with this name"

  # --- Team Configuration ---

  Scenario: Set team stage during creation
    Given I am creating a new team
    When I select the team stage as "Ideation"
    Then the team should be tagged with stage "Ideation"

  Scenario Outline: Available team stages
    Given I am creating a new team
    When I select the team stage as "<stage>"
    Then the team should be tagged with stage "<stage>"

    Examples:
      | stage              |
      | Ideation           |
      | Validation         |
      | Pre-revenue        |
      | Revenue            |
      | Scaling            |

  Scenario: Set the target industry or domain
    Given I am creating a new team
    When I optionally set the target domain as "HealthTech"
    Then the team profile should include domain "HealthTech"

  Scenario: Team creation with no domain specified
    Given I am creating a new team
    When I skip the target domain selection
    Then the team should be created without a domain tag
    And the domain can be set later from team settings

  # --- Team Dashboard ---

  Scenario: View empty team dashboard after creation
    Given I have just created a team
    When I view the team dashboard
    Then I should see a section for "Partnership Intelligence" with status "Not started"
    And I should see a section for "Venture Discovery" with status "Not started"
    And I should see a prompt to invite partners

  # --- Multiple Teams ---

  Scenario: A user can belong to multiple teams
    Given I am a partner in team "Acme Ventures"
    When I create a new team "Beta Labs"
    Then I should be able to switch between "Acme Ventures" and "Beta Labs"
    And each team should have independent assessments and data
