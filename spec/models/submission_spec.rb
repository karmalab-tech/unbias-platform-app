require "rails_helper"

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
RSpec.describe Submission, type: :model do
  describe ".start!" do
    it "returns the raw session token once and stores only its digest" do
      submission = Submission.start!(locale: "fr")

      expect(submission.session_token).to be_present
      expect(submission.session_token_digest).to eq(Digest::SHA256.hexdigest(submission.session_token))
      expect(Submission.find_by_session_token(submission.session_token)).to eq(submission)
      expect(Submission.find_by_session_token("nope")).to be_nil
      expect(submission.locale).to eq("fr")
    end
  end

  describe ".generate_public_code" do
    it "uses the UNB-XXXX-XXXX shape without ambiguous glyphs" do
      code = Submission.generate_public_code

      expect(code).to match(/\AUNB-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}\z/)
    end
  end

  describe "#submit!" do
    it "refuses without permission, consent or complete annotations" do
      submission = start_submission
      annotate(add_asset(submission))

      expect { submission.submit! }.to raise_error(ActiveRecord::RecordInvalid)
      submission.confirm_permission!
      expect { submission.submit! }.to raise_error(ActiveRecord::RecordInvalid)
      consent!(submission)
      expect(submission.reload.ready_to_submit?).to be(true)
    end

    it "refuses when a person is missing a required field" do
      submission = complete_submission
      submission.assets.first.person_annotations.first.update!(body: nil)

      expect(submission.reload.ready_to_submit?).to be(false)
    end

    it "assigns a code, moves uploaded assets to processing and drops empty drafts" do
      submission = complete_submission(people: 2)
      empty = submission.assets.create!(position: 1)

      expect { submission.submit! }.to have_enqueued_job(ProcessAssetJob).once

      expect(submission.reload).to be_submitted
      expect(submission.public_code).to start_with("UNB-")
      expect(submission.assets.map(&:status)).to eq([ "processing" ])
      expect(Asset.exists?(empty.id)).to be(false)
      expect(submission.people_count).to eq(2)
    end
  end

  describe "#withdraw!" do
    it "withdraws every asset and the consent" do
      submission = complete_submission
      submission.submit!

      submission.withdraw!

      expect(submission.reload).to be_withdrawn
      expect(submission.assets.map(&:status)).to eq([ "withdrawn" ])
      expect(submission.consent.withdrawn_at).to be_present
    end
  end

  describe ".stale_drafts" do
    it "returns drafts untouched for longer than the configured TTL" do
      old = start_submission
      old.update_column(:updated_at, 30.hours.ago)
      fresh = start_submission
      submitted = complete_submission.tap(&:submit!)
      submitted.update_column(:updated_at, 30.hours.ago)

      expect(Submission.stale_drafts).to contain_exactly(old)
      expect(Submission.stale_drafts).not_to include(fresh)
    end
  end
end
