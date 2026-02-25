Feature: Data Privacy & User Data Rights
  As a platform user,
  I want control over my data and clear privacy guarantees,
  So that I can trust the platform with sensitive partnership information.

  # --- Privacy Policy & Transparency ---

  Scenario: Privacy policy is accessible before registration
    Given I am visiting the platform for the first time
    Then I should see a link to the privacy policy
    And the privacy policy should clearly explain:
      | topic                                                           |
      | What personal data is collected                                |
      | How assessment data is used to generate reports                |
      | That individual answers are never shared with other partners   |
      | That data sent to AI services is not used for model training   |
      | How long data is retained                                      |
      | How to request data export or deletion                        |

  Scenario: Privacy policy is accessible after login
    Given I am logged in
    When I navigate to settings
    Then I should see a link to the privacy policy

  # --- Data Access Boundaries ---

  Scenario: Partners can only access their own teams
    Given Alice is in team "Acme" but NOT in team "Beta Labs"
    When Alice tries to navigate to team "Beta Labs"
    Then she should see a message "You don't have access to this team"
    And she should not see any of "Beta Labs" data

  Scenario: No partner can view another partner's individual responses
    Given Alice and Bob are partners in team "Acme"
    When Alice browses any part of the team workspace
    Then she should never see Bob's individual assessment answers
    And the only data visible about Bob should be his name and completion status

  Scenario: Team creator has no elevated access to partner data
    Given Bob is the team creator
    When Bob browses the team workspace
    Then Bob should see the same data as any other partner
    And Bob should NOT have any way to view individual answers from Alice or Carol

  # --- Cookie Consent ---

  Scenario: Cookie consent on first visit
    Given I visit the platform for the first time
    Then I should see a cookie consent banner
    And I should be able to opt out of non-essential cookies
    And the platform should function fully without non-essential cookies

  # --- Data Export ---

  Scenario: Export my personal data
    Given I am logged in
    When I request a data export from my profile settings
    Then I should receive a downloadable archive containing:
      | data_category                            |
      | My profile information                  |
      | All my assessment responses             |
      | All my venture inputs                   |
      | All my idea ratings                     |
      | My team memberships                     |
    And the export should be ready within 24 hours
    And I should receive a notification when it is ready

  # --- Data Deletion ---

  Scenario: Request deletion of all my personal data
    Given I am logged in
    When I request deletion of all my data from my profile settings
    Then I should see the same warnings as account deletion:
      | consequence                                                     |
      | All your personal data will be permanently deleted             |
      | You will be removed from all teams                             |
      | Reports will be regenerated without your data                  |
      | Anonymized insights already in published reports may be retained|
      | This action cannot be undone                                   |
    And I must confirm by typing "DELETE MY ACCOUNT"
    And I must provide my password
    And I should receive an email confirming the request
    And my data should be deleted within 30 days

  Scenario: Team data is deleted when the team is deleted
    Given the team creator deletes the team
    Then all team members should be notified
    And the team should no longer be accessible
    And all associated data should be permanently removed:
      | data_type                    |
      | All partner responses        |
      | All compatibility reports    |
      | All venture candidates       |
      | All ratings and rankings     |
      | All trend data               |

  # --- AI & Third-Party Data Handling ---

  Scenario: Users are informed how AI is used
    Given I am viewing the privacy policy
    Then it should clearly explain:
      | ai_policy                                                            |
      | Assessment data is analyzed by AI to generate reports               |
      | No partner names or identifying details are included in AI analysis |
      | Data sent to AI services is not used to train AI models            |
      | Only the minimum data necessary is used for each analysis          |

  # --- Data Retention ---

  Scenario: Assessment data is retained while the team is active
    Given the team "Acme" is active
    When I view my assessment history
    Then all my past assessment responses should be available
    And all historical reports should be preserved and accessible

  Scenario: Data from departed partners is handled gracefully
    Given Alice has left the team
    Then Alice's individual responses should no longer be accessible
    But previously generated reports should remain available
    And those reports should note "Generated with data from a partner who has since left"
