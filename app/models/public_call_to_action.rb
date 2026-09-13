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
