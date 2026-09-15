# == Schema Information
#
# Table name: representation_buckets
#
#  id            :bigint           not null, primary key
#  dimension     :string           not null
#  display_order :integer          default(0), not null
#  swatch        :string
#  target_count  :integer          default(0), not null
#  value         :string           not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_representation_buckets_on_dimension_and_value  (dimension,value) UNIQUE
#
class RepresentationBucket < ApplicationRecord
  validates :dimension, inclusion: { in: Representation::DIMENSIONS }
  validates :value, presence: true, uniqueness: { scope: :dimension }
  validates :target_count, numericality: { greater_than_or_equal_to: 0, only_integer: true }

  scope :ordered, -> { order(:dimension, :display_order) }

  after_commit { CoverageStats.bump! }

  # Idempotent: inserts missing buckets with POC targets, never overwrites admin-edited targets.
  def self.seed!
    Representation::TARGETS.each do |dimension, targets|
      targets.each_with_index do |(value, target), index|
        find_or_create_by!(dimension: dimension, value: value) do |bucket|
          bucket.display_order = index
          bucket.target_count = target
          bucket.swatch = Representation::MONK_SWATCHES[value.to_i - 1] if dimension == "skin_tone"
        end
      end
    end
  end
end
