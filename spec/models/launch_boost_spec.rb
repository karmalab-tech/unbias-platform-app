require "rails_helper"

RSpec.describe LaunchBoost do
  before do
    limits = Rails.configuration.x.unbias
    allow(Rails.configuration).to receive(:x).and_return(double(unbias: limits.dup.tap { |l|
      l.launch_boost_photos_floor = 1_573
      l.launch_boost_people_floor = 1_100
    }))
  end

  def shown(real) = LaunchBoost.shown(real, floor: 1_573)

  it "starts at the floor and goes up by one per upload" do
    expect(shown(0)).to eq(1_573)
    expect(shown(1)).to eq(1_574)
    expect(shown(2)).to eq(1_575)
  end

  it "never goes down, never shows less than the real number, and lands on the real number at the end" do
    series = (0..2_600).map { |real| shown(real) }
    expect(series.each_cons(2).all? { |a, b| b >= a }).to be(true)
    expect(series.each_with_index.all? { |value, real| value >= real }).to be(true)
    expect(series[2_500..]).to eq((2_500..2_600).to_a)
    expect(series[2_499]).to eq(2_500)
  end

  it "scales the bucket boost with its target and ends when the bucket reaches its share of the milestone" do
    bucket = ->(approved, target = 1_000) { { approved: approved, target: target } }
    series = (0..260).map { |real| LaunchBoost.bucket_shown(bucket.(real)) }

    expect(series.first).to be_between(44, 176)
    expect(series.each_cons(2).all? { |a, b| b >= a }).to be(true)
    expect(series.each_with_index.all? { |value, real| value >= real }).to be(true)
    expect(series[250..]).to eq((250..260).to_a)
    expect(LaunchBoost.bucket_shown(bucket.(0, 0))).to eq(0)
  end

  it "skews the boost per bucket, identically on every call" do
    bucket = ->(value) { { dimension: "age", value: value, approved: 0, target: 1_000 } }
    floors = %w[18_24 25_34 35_44 45_54 55_64 65_plus].map { |value| LaunchBoost.bucket_shown(bucket.(value)) }

    expect(floors.uniq.size).to be > 1
    expect(floors).to eq(%w[18_24 25_34 35_44 45_54 55_64 65_plus].map { |value| LaunchBoost.bucket_shown(bucket.(value)) })
  end

  it "starts hand-set buckets at their own floor" do
    start = ->(dimension, value, target) { LaunchBoost.bucket_shown(dimension: dimension, value: value, approved: 0, target: target) }

    expect(start.("gender", "non_binary", 2_000)).to eq(148)
    expect(start.("body", "thin", 2_500)).to eq(183)
    expect(start.("disability", "glasses", 1_500)).to eq(171)
    expect(start.("disability", "wheelchair", 500)).to eq(3)
    expect(start.("age", "75_plus", 2_000)).to be < start.("age", "30_44", 2_000)
  end

  it "adds nothing when the floor is zero" do
    expect(LaunchBoost.shown(7, floor: 0)).to eq(7)
  end

  it "adds the boost to photos, approved people and approved bucket bars but leaves pending untouched" do
    bucket = { dimension: "age", value: "18_24", approved: 1, pending: 4, target: 1_000 }
    stats = { images: 3, total: { approved: 1, pending: 2, target: 10_000 }, buckets: [ bucket ] }
    result = LaunchBoost.apply(stats)

    expect(result[:images]).to be > 1_573
    expect(result[:total]).to include(pending: 2, target: 10_000)
    expect(result[:total][:approved]).to be > 1_100
    expect(result[:buckets].first).to include(pending: 4, target: 1_000)
    expect(result[:buckets].first[:approved]).to be > 1
    expect(result[:launch_boost]).to include(active: true, until: 2_500)
    expect(result[:launch_boost][:photos]).to include(real: 3, shown: result[:images])
  end
end
