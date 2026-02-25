Feature: Anonymous Idea Rating & Ranking
  As a founding team partner,
  I want to independently and anonymously rate the generated startup ideas,
  So that we can discover which ideas we're mutually excited about.

  Background:
    Given team "Acme Ventures" has partners: Alice and Bob
    And the system has generated 15 venture candidates

  # --- Individual Rating ---

  Scenario: Each partner rates ideas independently
    When I begin the idea rating process
    Then I should see all 15 venture candidates
    And I should rate each one independently
    And my ratings should be anonymous until the alignment reveal

  Scenario: Rating dimensions for each idea
    When I rate a venture candidate
    Then I should score it on:
      | dimension              | scale  | description                                    |
      | Excitement             | 1-10   | How excited am I about working on this?        |
      | Confidence             | 1-10   | How confident am I that this can succeed?      |
      | Personal fit           | 1-10   | How well does this match MY strengths?         |
      | Willingness to commit  | 1-10   | Would I go all-in on this idea?                |
    And there should be an optional free-text field for comments on each idea

  Scenario: Quick reaction before deep rating
    When I first see a venture candidate
    Then I should give an initial gut reaction:
      | reaction       | meaning                   |
      | Love it        | Immediately excited       |
      | Interesting    | Worth exploring further   |
      | Neutral        | No strong feeling         |
      | Not for me     | Doesn't resonate          |
    And then proceed to the detailed rating

  Scenario: Side-by-side comparison mode
    When I am rating ideas
    Then I should have the option to compare two ideas side-by-side
    And the comparison should show their profiles next to each other
    And I should be able to pick a preference in each dimension

  # --- Ranking ---

  Scenario: Rank top 5 ideas after rating all
    Given I have rated all 15 venture candidates
    When I reach the ranking step
    Then I should select and rank my top 5 ideas in order of preference
    And the ranking should be drag-and-drop enabled

  Scenario: Forced ranking prevents ties
    When I rank my top 5 ideas
    Then each idea must have a unique rank (1-5)
    And the system should not allow ties

  # --- Anonymity During Rating ---

  Scenario: Partners cannot see each other's ratings during the process
    Given Alice is rating ideas
    And Bob is also rating ideas
    Then Alice should NOT see Bob's ratings or progress
    And Bob should NOT see Alice's ratings or progress

  Scenario: Rating status is visible without revealing details
    Given Alice has completed her ratings
    When Bob views the team dashboard
    Then Bob should see "Alice has completed idea ratings"
    But Bob should NOT see any of Alice's actual ratings

  # --- Rating Completion ---

  Scenario: All partners must complete ratings before reveal
    Given Alice has completed her ratings
    But Bob has not
    Then the alignment reveal should NOT be triggered
    And Alice should see "Waiting for all partners to complete ratings"

  Scenario: Reminder for incomplete ratings
    Given Alice completed her ratings 3 days ago
    And Bob has not started
    Then Bob should receive a reminder notification
    And Alice should NOT be told who hasn't completed ratings

  # --- Editing Ratings ---

  Scenario: Edit ratings before the alignment reveal
    Given I have submitted my ratings
    And the alignment reveal has NOT been triggered
    When I choose to edit my ratings
    Then I should be able to change any rating or ranking
    And the updated ratings should replace the previous ones

  Scenario: Cannot edit ratings after alignment reveal
    Given the alignment reveal has been triggered
    When I try to edit my ratings
    Then I should see "Ratings are locked after the alignment reveal"
    And I should NOT be able to make changes
