Feature: Partner Invitation
  As a team creator,
  I want to invite potential co-founders to join my team,
  So that they can participate in the partnership assessment and venture discovery.

  Background:
    Given I am the creator of team "Acme Ventures"

  # --- Sending Invitations ---

  Scenario: Invite a partner by email
    When I invite a partner with email "alice@example.com"
    Then an invitation email should be sent to "alice@example.com"
    And the invitation should have a unique secure link
    And the invitation status should be "pending"

  Scenario: Invite multiple partners
    When I invite partners with emails:
      | email              |
      | alice@example.com  |
      | bob@example.com    |
      | carol@example.com  |
    Then 3 invitation emails should be sent
    And each invitation should have a unique secure link

  Scenario: Cannot invite the same email twice
    Given I have already invited "alice@example.com"
    When I try to invite "alice@example.com" again
    Then I should see a message "This person has already been invited"
    And no duplicate invitation should be created

  Scenario: Cannot invite yourself
    Given my email is "founder@example.com"
    When I try to invite "founder@example.com"
    Then I should see an error "You cannot invite yourself"

  # --- Invitation Expiry & Resend ---

  Scenario: Invitation expires after 7 days
    Given I invited "alice@example.com" 8 days ago
    When Alice tries to use the invitation link
    Then she should see a message "This invitation has expired"
    And she should see an option to request a new invitation

  Scenario: Resend an expired or pending invitation
    Given the invitation to "alice@example.com" is pending
    When I resend the invitation
    Then a new invitation email should be sent
    And the old invitation link should be invalidated
    And the new invitation should expire in 7 days

  # --- Accepting Invitations ---

  Scenario: Accept invitation as a new user
    Given "alice@example.com" has received an invitation
    And Alice does not have an account
    When Alice clicks the invitation link
    Then she should be prompted to create an account
    And upon registration she should be added to team "Acme Ventures"
    And her partner status should be "active"

  Scenario: Accept invitation as an existing user
    Given "alice@example.com" has received an invitation
    And Alice already has an account
    When Alice clicks the invitation link
    Then she should be added to team "Acme Ventures"
    And her partner status should be "active"

  Scenario: Decline an invitation
    Given "alice@example.com" has received an invitation
    When Alice declines the invitation
    Then her invitation status should be "declined"
    And the team creator should be notified

  # --- Invitation Management ---

  Scenario: View all pending invitations
    Given I have invited 3 partners
    And 1 has accepted and 2 are pending
    When I view the invitations list
    Then I should see 2 pending invitations
    And I should see 1 accepted invitation

  Scenario: Revoke a pending invitation
    Given I have a pending invitation for "alice@example.com"
    When I revoke the invitation
    Then the invitation link should be invalidated
    And the invitation status should be "revoked"

  # --- Partner Roles ---

  Scenario: All partners have equal access by default
    Given Alice has joined team "Acme Ventures"
    Then Alice should have the same access level as the team creator
    And Alice should be able to view team dashboard
    And Alice should be able to complete assessments
    And Alice should be able to view reports

  Scenario: Only the team creator can invite new partners
    Given Alice is a partner but not the creator
    When Alice tries to invite a new partner
    Then she should see a message "Only the team creator can invite partners"

  # --- Team Size ---

  Scenario: Team supports 2 or more partners
    Given the team has 1 partner (the creator)
    When 1 more partner joins
    Then the team should have 2 partners
    And the partnership assessment should become available

  Scenario: Team supports up to 10 partners
    Given the team already has 10 partners
    When the creator tries to invite another partner
    Then they should see a message "Maximum team size reached"

  # --- Partner Removal ---

  Scenario: Remove a partner from the team
    Given Alice is a partner in the team
    When the team creator removes Alice
    Then Alice should no longer have access to the team
    And Alice's assessment data should be retained for historical reports
    And the compatibility report should be regenerated

  Scenario: A partner can leave the team voluntarily
    Given Alice is a partner in the team
    When Alice chooses to leave the team
    Then Alice should be removed from the team
    And the team creator should be notified

  # --- Creator Leaving ---

  Scenario: Team creator leaves the team
    Given the team has partners: Alice (creator), Bob, and Carol
    When Alice chooses to leave the team
    Then ownership should transfer to the next partner who joined (Bob)
    And Bob should be notified that he is now the team creator
    And Bob should gain the ability to invite and remove partners

  Scenario: Team creator is the last partner
    Given Alice is the only partner and creator of the team
    When Alice chooses to leave the team
    Then the team should be archived
    And Alice should see a warning "You are the only partner — leaving will archive this team"

  # --- Invitation Link Edge Cases ---

  Scenario: Using an already-accepted invitation link
    Given Alice has already accepted her invitation and joined the team
    When Alice clicks the invitation link again
    Then she should be redirected to the team dashboard
    And no duplicate partner record should be created

  Scenario: Using an invitation link after being removed
    Given Alice was previously a partner but has been removed
    When Alice clicks her old invitation link
    Then she should see "This invitation is no longer valid"
    And she should NOT be re-added to the team
