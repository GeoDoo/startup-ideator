Feature: Notifications & Communication
  As a platform user,
  I want to receive timely notifications about team activities,
  So that I stay informed and engaged without checking the app constantly.

  # --- Notification Channels ---

  Scenario: Notifications are delivered via email
    Given a notification-worthy event occurs
    Then the affected partner(s) should receive an email notification
    And the email should contain a clear call-to-action link

  Scenario: Notifications are delivered in-app
    Given a notification-worthy event occurs
    When I visit the platform
    Then I should see an unread notification badge
    And I should be able to view all notifications in a notification center

  Scenario: Notification preferences are configurable
    Given I am on my profile settings
    When I configure notification preferences
    Then I should be able to toggle notifications for each event type:
      | event_type                    | email | in_app |
      | Team invitation received      | On    | On     |
      | Partner joined team           | On    | On     |
      | Assessment reminder           | On    | On     |
      | Report generated              | On    | On     |
      | Pulse survey reminder         | On    | On     |
      | Venture ideas generated       | On    | On     |
      | Alignment reveal ready        | On    | On     |
      | Partner left team             | On    | On     |
      | Partnership health alert      | On    | On     |

  # --- Key Notification Events ---

  Scenario Outline: Notification is sent for key events
    When "<event>" occurs
    Then "<recipients>" should be notified
    And the notification should contain "<message_summary>"

    Examples:
      | event                          | recipients           | message_summary                                  |
      | Partner invited                | Invitee              | You've been invited to join a founding team       |
      | Partner joined                 | All existing partners| A new partner has joined your team                |
      | Partner completed assessment   | All other partners   | A partner has completed their assessment          |
      | All assessments complete       | All partners         | All assessments are in — report is being generated|
      | Compatibility report ready     | All partners         | Your compatibility report is ready to view        |
      | Pulse survey due               | All partners         | Time for your partnership check-in                |
      | Venture ideas generated        | All partners         | New venture candidates are ready for your review  |
      | All ratings complete           | All partners         | The alignment reveal is ready                     |
      | Partnership health alert       | All partners         | Important change detected in partnership health   |
      | Partner left team              | Remaining partners   | A partner has left the team                       |

  # --- Notification Timing ---

  Scenario: Notifications respect the partner's timezone
    Given a partner's timezone is set to "Europe/London"
    And a report is generated at 3:00 AM London time
    Then the email notification should arrive no earlier than 8:00 AM London time
    But the in-app notification should be available immediately

  Scenario: Rapid events are combined into a single email
    Given 3 events occur within 10 minutes
    Then I should receive a single email digest covering all 3 events
    But each should appear as a separate in-app notification
