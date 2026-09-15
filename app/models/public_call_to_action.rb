# == Schema Information
#
# Table name: public_call_to_actions
#
#  id            :bigint           not null, primary key
#  active        :boolean          default(TRUE), not null
#  caption_en    :string           not null
#  caption_fr    :string
#  display_order :integer          default(0), not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
class PublicCallToAction < ApplicationRecord
  validates :caption_en, presence: true, length: { maximum: 120 }
  validates :caption_fr, length: { maximum: 120 }, allow_blank: true
  validate :active_limit

  scope :active, -> { where(active: true).order(:display_order, :id) }

  after_commit { CoverageStats.bump! }

  def caption(locale)
    locale.to_s == "fr" && caption_fr.present? ? caption_fr : caption_en
  end

  private

  def active_limit
    return unless active?

    limit = Rails.configuration.x.unbias.max_active_calls_to_action
    others = self.class.where(active: true).where.not(id: id).count
    errors.add(:active, "at most #{limit} calls to action can be active") if others >= limit
  end
end
