# == Schema Information
#
# Table name: submissions
#
#  id                      :bigint           not null, primary key
#  email                   :string
#  locale                  :string           default("en"), not null
#  permission_confirmed_at :datetime
#  public_code             :string
#  session_token_digest    :string           not null
#  status                  :string           default("draft"), not null
#  submitted_at            :datetime
#  updates_opt_in          :boolean          default(FALSE), not null
#  withdrawn_at            :datetime
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#
# Indexes
#
#  index_submissions_on_public_code            (public_code) UNIQUE
#  index_submissions_on_session_token_digest   (session_token_digest) UNIQUE
#  index_submissions_on_status_and_updated_at  (status,updated_at)
#
class Submission < ApplicationRecord
  CODE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ".chars.freeze
  CODE_PREFIX = "UNB".freeze

  has_many :assets, -> { order(:position, :id) }, dependent: :destroy
  has_one :consent, dependent: :destroy

  enum :status, { draft: "draft", submitted: "submitted", withdrawn: "withdrawn" }, default: :draft

  validates :session_token_digest, presence: true
  validates :public_code, uniqueness: true, allow_nil: true
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true
  validates :locale, inclusion: { in: %w[en fr] }

  scope :stale_drafts, -> { draft.where(updated_at: ...Rails.configuration.x.unbias.draft_ttl_hours.hours.ago) }

  attr_reader :session_token

  # Returns the raw token once; only its digest is stored.
  def self.start!(locale: "en")
    token = SecureRandom.base58(32)
    create!(session_token_digest: digest(token), locale: locale).tap { |s| s.instance_variable_set(:@session_token, token) }
  end

  def self.find_by_session_token(token)
    return nil if token.blank?

    find_by(session_token_digest: digest(token))
  end

  def self.digest(token)
    Digest::SHA256.hexdigest(token)
  end

  def self.generate_public_code
    loop do
      body = Array.new(8) { CODE_ALPHABET.sample(random: SecureRandom) }.join
      code = "#{CODE_PREFIX}-#{body[0, 4]}-#{body[4, 4]}"
      return code unless exists?(public_code: code)
    end
  end

  def confirm_permission!
    update!(permission_confirmed_at: Time.current)
  end

  def uploaded_assets
    assets.select { |asset| asset.original.attached? }
  end

  def ready_to_submit?
    draft? && permission_confirmed_at.present? && consent&.training_allowed? &&
      uploaded_assets.any? && uploaded_assets.all?(&:annotation_complete?)
  end

  def submit!
    raise ActiveRecord::RecordInvalid, self unless ready_to_submit?

    transaction do
      update!(status: :submitted, submitted_at: Time.current, public_code: self.class.generate_public_code)
      assets.each { |asset| asset.original.attached? ? asset.submit! : asset.destroy! }
    end
    assets.reload.each { |asset| ProcessAssetJob.perform_later(asset) }
    CoverageStats.bump!
    self
  end

  def people_count
    assets.sum { |asset| asset.person_annotations.size }
  end

  def withdraw!
    transaction do
      assets.each(&:withdraw!)
      consent&.update!(withdrawn_at: Time.current)
      update!(status: :withdrawn, withdrawn_at: Time.current)
    end
    CoverageStats.bump!
  end
end
