# Fixed POC taxonomy. Values are stored as-is; labels live in the frontend locales.
module Representation
  AGE = %w[18_29 30_44 45_59 60_74 75_plus not_sure].freeze
  SKIN_TONE = (1..10).to_a.freeze
  GENDER = %w[woman man non_binary not_sure prefer_not_to_say].freeze
  BODY = %w[thin medium large very_large not_visible not_sure].freeze
  DISABILITY = %w[glasses hearing_aid wheelchair cane_crutches_walker prosthetic limb_difference other].freeze

  MONK_SWATCHES = %w[#f6ede4 #f3e7db #f7ead0 #eadaba #d7bd96 #a07e56 #825c43 #604134 #3a312a #292420].freeze

  DIMENSIONS = %w[age skin_tone gender body disability].freeze

  # Bucket values that count toward coverage targets, with their POC targets.
  TARGETS = {
    "age" => %w[18_29 30_44 45_59 60_74 75_plus].index_with { 2_000 },
    "skin_tone" => SKIN_TONE.map(&:to_s).index_with { 1_000 },
    "gender" => { "woman" => 4_000, "man" => 4_000, "non_binary" => 2_000 },
    "body" => %w[thin medium large very_large].index_with { 2_500 },
    "disability" => { "glasses" => 1_500 }.merge(%w[hearing_aid wheelchair cane_crutches_walker prosthetic limb_difference other].index_with { 500 })
  }.freeze

  def self.column_for(dimension)
    { "age" => :age_bucket, "skin_tone" => :skin_tone_confirmed, "gender" => :gender, "body" => :body }.fetch(dimension)
  end
end
