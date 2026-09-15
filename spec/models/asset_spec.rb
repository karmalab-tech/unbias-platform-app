require "rails_helper"

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
RSpec.describe Asset, type: :model do
  let(:moderator) { create_staff }

  def pending_asset
    submission = complete_submission
    submission.submit!
    asset = submission.assets.first
    ProcessAssetJob.perform_now(asset)
    asset.reload
  end

  it "reaches pending_moderation after processing" do
    expect(pending_asset).to be_pending_moderation
    expect(Asset.moderation_queue).to include(pending_asset)
  end

  describe "#approve!" do
    it "records a decision and moves to approved" do
      asset = pending_asset

      asset.approve!(moderator)

      expect(asset.reload).to be_approved
      expect(asset.moderated_at).to be_present
      expect(asset.moderation_decisions.last).to have_attributes(decision: "approved", reason: nil, moderator: moderator)
    end

    it "refuses to moderate twice" do
      asset = pending_asset
      asset.approve!(moderator)

      expect { asset.reject!(moderator, "duplicate") }.to raise_error(ActiveRecord::RecordInvalid)
    end
  end

  describe "#reject!" do
    it "requires a predefined reason" do
      asset = pending_asset

      expect { asset.reject!(moderator, "because") }.to raise_error(ActiveRecord::RecordInvalid)
      expect(asset.reload).to be_pending_moderation

      asset.reject!(moderator, "unusable_quality")
      expect(asset.reload).to be_rejected
    end
  end

  describe "counting scopes" do
    it "counts processing, pending and approved but not draft, rejected or withdrawn" do
      approved = pending_asset.tap { |a| a.approve!(moderator) }
      rejected = pending_asset.tap { |a| a.reject!(moderator, "other") }
      pending = pending_asset
      draft = add_asset(start_submission)

      expect(Asset.counted).to contain_exactly(approved, pending)
      expect(Asset.counted_as_pending).to contain_exactly(pending)
      expect(Asset.counted).not_to include(rejected, draft)
    end
  end
end
