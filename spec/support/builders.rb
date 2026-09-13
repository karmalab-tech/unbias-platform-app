# Small builders instead of a factory library: the domain is narrow enough.
module Builders
  def create_staff(role: :moderator, email: "#{role}-#{SecureRandom.hex(3)}@example.com")
    User.create!(email: email, password: "password123", role: role)
  end

  def start_submission(locale: "en")
    Submission.start!(locale: locale)
  end

  def attach_fixture(asset, name = "person.jpg")
    asset.original.attach(io: Rails.root.join("spec/fixtures/files", name).open, filename: name, content_type: "image/jpeg")
    asset
  end

  def add_asset(submission, position: 0, upload: true)
    asset = submission.assets.create!(position: position)
    attach_fixture(asset) if upload
    asset
  end

  def annotate(asset, people: 1, **overrides)
    attrs = { age_bucket: "30_44", skin_tone_confirmed: 6, gender: "woman", body: "medium", detection_source: "manual",
              detection_region: { x: 0.2, y: 0.1, w: 0.4, h: 0.8 } }.merge(overrides)
    people.times { |i| asset.person_annotations.create!(attrs.merge(person_index: i)) }
    asset.update!(people_confirmed: true)
    asset
  end

  def consent!(submission, training: true, display: false)
    Consent.create!(submission: submission, training_allowed: training, public_display_allowed: display,
                    consent_version: "v0-draft", accepted_at: Time.current)
  end

  # A full contribution ready for submit!, with `people` annotated people on one image.
  def complete_submission(people: 1, **overrides)
    submission = start_submission
    submission.confirm_permission!
    annotate(add_asset(submission), people: people, **overrides)
    consent!(submission)
    submission
  end
end

RSpec.configure do |config|
  config.include Builders
  config.before { RepresentationBucket.seed! if RepresentationBucket.none? }
end
