require "rails_helper"

RSpec.describe PurgeStaleDraftsJob do
  it "destroys drafts older than the TTL together with their files" do
    stale = start_submission
    add_asset(stale)
    stale.update_column(:updated_at, 2.days.ago)
    fresh = start_submission
    submitted = complete_submission.tap(&:submit!)
    submitted.update_column(:updated_at, 2.days.ago)

    expect { PurgeStaleDraftsJob.perform_now }.to change(Submission, :count).by(-1)
    expect(Submission.exists?(stale.id)).to be(false)
    expect(Submission.exists?(fresh.id)).to be(true)
    expect(Submission.exists?(submitted.id)).to be(true)
  end
end
