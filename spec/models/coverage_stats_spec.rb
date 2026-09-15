require "rails_helper"

RSpec.describe CoverageStats do
  let(:moderator) { create_staff }

  def moderated_submission(people:, decision: nil, **overrides)
    submission = complete_submission(people: people, **overrides)
    submission.submit!
    asset = submission.assets.first
    ProcessAssetJob.perform_now(asset)
    asset.reload.approve!(moderator) if decision == :approve
    asset.reload.reject!(moderator, "other") if decision == :reject
    submission
  end

  it "seeds 29 buckets with the POC targets" do
    expect(RepresentationBucket.count).to eq(29)
    expect(RepresentationBucket.find_by(dimension: "skin_tone", value: "4")).to have_attributes(target_count: 1_000, swatch: "#eadaba")
    expect(RepresentationBucket.find_by(dimension: "gender", value: "non_binary").target_count).to eq(2_000)
    expect(RepresentationBucket.find_by(dimension: "disability", value: "glasses").target_count).to eq(1_500)
  end

  it "splits approved and pending people per bucket and ignores rejected ones" do
    moderated_submission(people: 2, decision: :approve, disability_tags: [ "glasses" ])
    moderated_submission(people: 1, gender: "man", age_bucket: "75_plus")
    moderated_submission(people: 3, decision: :reject)

    stats = CoverageStats.compute
    bucket = ->(dimension, value) { stats[:buckets].find { |b| b[:dimension] == dimension && b[:value] == value } }

    expect(stats[:total]).to eq(approved: 2, pending: 1, target: 10_000)
    expect(stats[:images]).to eq(2)
    expect(stats[:contributions_last_24h]).to eq(2)
    expect(bucket.call("gender", "woman")).to include(approved: 2, pending: 0)
    expect(bucket.call("gender", "man")).to include(approved: 0, pending: 1)
    expect(bucket.call("age", "75_plus")).to include(approved: 0, pending: 1, target: 2_000)
    expect(bucket.call("disability", "glasses")).to include(approved: 2, pending: 0)
    expect(bucket.call("skin_tone", "6")).to include(approved: 2, pending: 1)
  end

  it "does not count not_sure style values toward any bucket" do
    moderated_submission(people: 1, decision: :approve, gender: "prefer_not_to_say", body: "not_visible", age_bucket: "not_sure")

    stats = CoverageStats.compute
    expect(stats[:total][:approved]).to eq(1)
    expect(stats[:buckets].select { |b| b[:dimension] == "gender" }.sum { |b| b[:approved] }).to eq(0)
    expect(stats[:buckets].select { |b| b[:dimension] == "body" }.sum { |b| b[:approved] }).to eq(0)
  end
end
