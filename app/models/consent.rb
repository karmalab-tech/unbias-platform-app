class Consent < ApplicationRecord
  belongs_to :submission

  validates :consent_version, :accepted_at, presence: true
  validates :training_allowed, acceptance: { accept: true, message: "is required" }
end
