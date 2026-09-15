# == Schema Information
#
# Table name: assets
#
#  id               :bigint           not null, primary key
#  byte_size        :bigint
#  content_type     :string
#  height           :integer
#  moderated_at     :datetime
#  people_confirmed :boolean          default(FALSE), not null
#  phash            :string
#  position         :integer          default(0), not null
#  processing_state :string           default("pending"), not null
#  sha256           :string
#  status           :string           default("draft"), not null
#  submitted_at     :datetime
#  width            :integer
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  submission_id    :bigint           not null
#
# Indexes
#
#  index_assets_on_phash                    (phash)
#  index_assets_on_sha256                   (sha256)
#  index_assets_on_status_and_submitted_at  (status,submitted_at)
#  index_assets_on_submission_id            (submission_id)
#
# Foreign Keys
#
#  fk_rails_...  (submission_id => submissions.id)
#
class Asset < ApplicationRecord
  belongs_to :submission
  has_many :person_annotations, -> { order(:person_index) }, dependent: :destroy
  has_many :enrichments, class_name: "AssetEnrichment", dependent: :destroy
  has_many :moderation_decisions, dependent: :destroy
  has_one_attached :original

  enum :status, {
    draft: "draft",
    processing: "processing",
    pending_moderation: "pending_moderation",
    approved: "approved",
    rejected: "rejected",
    withdrawn: "withdrawn"
  }, default: :draft

  enum :processing_state, { pending: "pending", running: "running", done: "done", failed: "failed" },
       default: :pending, prefix: :processing

  PENDING_STATUSES = %w[processing pending_moderation].freeze

  scope :counted_as_pending, -> { where(status: PENDING_STATUSES) }
  scope :counted, -> { where(status: PENDING_STATUSES + [ "approved" ]) }
  scope :moderation_queue, -> { pending_moderation.order(:submitted_at, :id) }

  def annotation_complete?
    people_confirmed? && person_annotations.any? && person_annotations.all?(&:complete?)
  end

  def submit!
    update!(status: :processing, submitted_at: Time.current)
  end

  def approve!(moderator)
    decide!(moderator, :approved, nil)
  end

  def reject!(moderator, reason)
    decide!(moderator, :rejected, reason)
  end

  def withdraw!
    original.purge_later if original.attached?
    update!(status: :withdrawn)
  end

  def counted?
    PENDING_STATUSES.include?(status) || approved?
  end

  private

  def decide!(moderator, decision, reason)
    raise ActiveRecord::RecordInvalid, self unless pending_moderation?

    transaction do
      moderation_decisions.create!(moderator: moderator, decision: decision, reason: reason)
      update!(status: decision, moderated_at: Time.current)
    end
    CoverageStats.bump!
    self
  end
end
