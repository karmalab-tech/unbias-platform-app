class ModerationDecision < ApplicationRecord
  belongs_to :asset
  belongs_to :moderator, class_name: "User"

  REASONS = %w[
    permission_consent minor_visible unusable_quality incorrect_labeling duplicate
    ai_generated inappropriate guidelines other
  ].freeze

  enum :decision, { approved: "approved", rejected: "rejected" }

  validates :reason, inclusion: { in: REASONS }, if: :rejected?
  validates :reason, absence: true, if: :approved?
end
