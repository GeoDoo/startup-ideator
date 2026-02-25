Feature: Authentication & User Accounts
  As a user of the platform,
  I want to securely create and manage my account,
  So that my data is protected and I can access my teams.

  # --- Registration ---

  Scenario: Register with email and password
    Given I am a new user
    When I register with email "alice@example.com" and a password
    Then my account should be created
    And I should receive a verification email
    And I should not be able to access the platform until I verify my email

  Scenario: Register via invitation link
    Given I received a team invitation to "alice@example.com"
    When I click the invitation link
    Then I should be guided to create an account
    And upon completion I should automatically join the team

  Scenario: Register with OAuth provider
    Given I am a new user
    When I register using Google OAuth
    Then my account should be created with my Google email
    And I should be logged in immediately

  Scenario: Password requirements
    When I set a password
    Then the password must meet:
      | requirement                     |
      | Minimum 10 characters           |
      | At least one uppercase letter   |
      | At least one number             |
      | At least one special character  |

  Scenario: Duplicate email prevention
    Given an account exists for "alice@example.com"
    When I try to register with "alice@example.com"
    Then I should see "An account with this email already exists"
    And I should be prompted to log in or reset my password

  # --- Login ---

  Scenario: Login with email and password
    Given I have a verified account
    When I log in with correct credentials
    Then I should be authenticated
    And redirected to my dashboard

  Scenario: Login with OAuth
    Given I registered with Google OAuth
    When I log in with Google
    Then I should be authenticated and redirected to my dashboard

  Scenario: Failed login attempt
    When I log in with incorrect credentials
    Then I should see "Invalid email or password"

  Scenario: Account lockout after repeated failures
    Given I have failed login 5 times in 15 minutes
    Then my account should be temporarily locked for 30 minutes
    And I should receive an email notification about the lockout

  # --- Staying Logged In ---

  Scenario: Stay logged in across browser restarts
    Given I am logged in with "Remember me" enabled
    When I close and reopen the browser
    Then I should still be logged in

  Scenario: Automatic logout after long inactivity
    Given I have been inactive for 30 days
    When I try to access the platform
    Then I should be prompted to log in again

  Scenario: Logout
    Given I am logged in
    When I log out
    Then I should be logged out
    And I should be redirected to the login page

  # --- Password Management ---

  Scenario: Forgot password
    When I request a password reset for "alice@example.com"
    Then a reset link should be sent to "alice@example.com"
    And the link should expire after 1 hour

  Scenario: Reset password via link
    Given I have a valid password reset link
    When I set a new password
    Then my password should be updated
    And I should be logged out on all other devices
    And I should be prompted to log in with the new password

  Scenario: Change password while logged in
    Given I am logged in
    When I change my password from settings
    Then I must provide my current password
    And I should be logged out on all other devices

  # --- Profile Management ---

  Scenario: View and edit my profile
    Given I am logged in
    When I navigate to my profile
    Then I should see my account details:
      | field              |
      | Email              |
      | Full name          |
      | Profile picture    |
      | Timezone           |
      | Account created on |
    And I should be able to edit name, picture, and timezone

  Scenario: View my team memberships
    Given I am a partner in 2 teams
    When I view my profile
    Then I should see a list of teams I belong to
    And I should be able to navigate to each team's dashboard

  # --- Account Deletion ---

  Scenario: Delete my account
    Given I am logged in
    When I request account deletion
    Then I should be warned about the consequences:
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

  Scenario: Account deletion transfers team ownership
    Given I am the creator of a team with other partners
    When I delete my account
    Then ownership should transfer to the next partner who joined
    And that partner should be notified they are now the team creator

  Scenario: Account deletion archives solo teams
    Given I am the only partner in a team
    When I delete my account
    Then the team should be archived and no longer accessible
