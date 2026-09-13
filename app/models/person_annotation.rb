# == Schema Information
#
# Table name: person_annotations
#
#  id                  :bigint           not null, primary key
#  age_bucket          :string
#  body                :string
#  completed_at        :datetime
#  detection_region    :jsonb            not null
#  detection_source    :string           default("manual"), not null
#  disability_tags     :string           default([]), not null, is an Array
#  gender              :string
#  person_index        :integer          not null
#  skin_tone_auto      :integer
#  skin_tone_confirmed :integer
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  asset_id            :bigint           not null
#
# Indexes
#
#  index_person_annotations_on_asset_id                   (asset_id)
#  index_person_annotations_on_asset_id_and_person_index  (asset_id,person_index) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (asset_id => assets.id)
#
class PersonAnnotation < ApplicationRecord
  belongs_to :asset

  REQUIRED_FIELDS = %i[age_bucket skin_tone_confirmed gender body].freeze

  validates :person_index, presence: true, uniqueness: { scope: :asset_id }
  validates :detection_source, inclusion: { in: %w[detector manual] }
  validates :age_bucket, inclusion: { in: Representation::AGE }, allow_nil: true
  validates :gender, inclusion: { in: Representation::GENDER }, allow_nil: true
  validates :body, inclusion: { in: Representation::BODY }, allow_nil: true
  validates :skin_tone_auto, :skin_tone_confirmed, inclusion: { in: Representation::SKIN_TONE }, allow_nil: true
  validate :disability_tags_in_taxonomy

  before_save :stamp_completion

  def complete?
    REQUIRED_FIELDS.all? { |field| public_send(field).present? }
  end

  private

  def stamp_completion
    self.completed_at = complete? ? (completed_at || Time.current) : nil
  end

  def disability_tags_in_taxonomy
    unknown = disability_tags - Representation::DISABILITY
    errors.add(:disability_tags, "contains unknown values: #{unknown.join(', ')}") if unknown.any?
  end
end
