# == Schema Information
#
# Table name: moderation_decisions
#
#  id           :bigint           not null, primary key
#  decision     :string           not null
#  reason       :string
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  asset_id     :bigint           not null
#  moderator_id :bigint           not null
#
# Indexes
#
#  index_moderation_decisions_on_asset_id      (asset_id)
#  index_moderation_decisions_on_moderator_id  (moderator_id)
#
# Foreign Keys
#
#  fk_rails_...  (asset_id => assets.id)
#  fk_rails_...  (moderator_id => users.id)
#
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
