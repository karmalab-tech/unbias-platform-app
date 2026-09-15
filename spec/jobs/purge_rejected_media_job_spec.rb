require "rails_helper"

RSpec.describe PurgeRejectedMediaJob do
  include ActiveJob::TestHelper

  let(:moderator) { create_staff }

  def rejected_asset(days_ago)
    submission = complete_submission
    submission.submit!
    asset = submission.assets.first
    ProcessAssetJob.perform_now(asset)
    asset.reload.reject!(moderator, "other")
    asset.update_column(:moderated_at, days_ago.days.ago)
    asset.reload
  end

  it "purges files of photos rejected longer ago than the retention window" do
    old = rejected_asset(31)
    recent = rejected_asset(2)

    expect { PurgeRejectedMediaJob.perform_now }.to have_enqueued_job(ActiveStorage::PurgeJob).once

    perform_enqueued_jobs
    expect(old.reload.original).not_to be_attached
    expect(old).to be_rejected
    expect(recent.reload.original).to be_attached
  end
end
