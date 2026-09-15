require "rails_helper"

RSpec.describe AssetProcessing::Pipeline do
  def submitted_asset(fixture: "person.jpg", people: 1)
    submission = start_submission
    submission.confirm_permission!
    asset = submission.assets.create!(position: 0)
    attach_fixture(asset, fixture)
    annotate(asset, people: people)
    consent!(submission)
    submission.submit!
    asset.reload
  end

  def fake_client(context:, safety:, refuse: false)
    result = ->(data) { AssetProcessing::VlmClient::Result.new(data: data, raw: { "id" => "msg_test" }, refused: refuse) }
    client = instance_double(AssetProcessing::VlmClient, model: "claude-sonnet-5")
    allow(client).to receive(:analyze) do |**args|
      args[:schema] == AssetProcessing::SafetyCheck::SCHEMA ? result.call(safety) : result.call(context)
    end
    client
  end

  let(:context) do
    { "setting" => [ "outdoors" ], "context" => [ "everyday" ], "description" => "A person stands on a court.", "caption" => "A person on a court" }
  end
  let(:safety) { { "possible_minor" => false, "unsafe_content" => false, "possible_synthetic" => false } }

  around do |example|
    original = ENV["ANTHROPIC_API_KEY"]
    ENV["ANTHROPIC_API_KEY"] = "test-key"
    example.run
    ENV["ANTHROPIC_API_KEY"] = original
  end

  it "runs every step, releases the asset to moderation and stores provenance" do
    asset = submitted_asset
    allow(AssetProcessing::VlmClient).to receive(:new).and_return(fake_client(context: context, safety: safety))

    described_class.new(asset).call

    asset.reload
    expect(asset).to be_pending_moderation
    expect(asset).to be_processing_done
    expect(asset.enrichments.map(&:kind)).to match_array(%w[technical duplicate vlm_context_caption vlm_safety])
    expect(asset.enrichments.all?(&:done?)).to be(true)
    expect(asset).to have_attributes(width: 900, height: 1200)
    expect(asset.sha256).to match(/\A[0-9a-f]{64}\z/)
    expect(asset.phash).to match(/\A[0-9a-f]{16}\z/)

    technical = asset.enrichments.find_by(kind: "technical")
    expect(technical.result["flags"]).to eq([ "blurry" ])

    caption = asset.enrichments.find_by(kind: "vlm_context_caption")
    expect(caption).to have_attributes(provider: "anthropic", model: "claude-sonnet-5", prompt_version: AssetProcessing::ContextCaption::PROMPT_VERSION)
    expect(caption.result["setting"]).to eq([ "outdoors" ])
    expect(caption.raw_response).to eq("id" => "msg_test")
    expect(ModerationFlags.for(asset)).to eq([ "blurry" ])
  end

  it "flags low resolution, exact and near duplicates" do
    first = submitted_asset(fixture: "small.jpg")
    described_class.new(first).call
    allow(AssetProcessing::VlmClient).to receive(:new).and_return(fake_client(context: context, safety: safety))

    second = submitted_asset(fixture: "small.jpg")
    described_class.new(second).call

    expect(second.enrichments.find_by(kind: "technical").result["flags"]).to include("low_resolution")
    duplicate = second.enrichments.find_by(kind: "duplicate")
    expect(duplicate.result["flags"]).to eq([ "exact_duplicate" ])
    expect(duplicate.result["exact"].first).to include("asset_id" => first.id, "public_code" => first.submission.public_code)
    expect(AssetProcessing::ImageFile.hamming(first.phash, second.phash)).to eq(0)
  end

  it "turns safety booleans and refusals into advisory flags" do
    asset = submitted_asset
    unsafe = { "possible_minor" => true, "unsafe_content" => false, "possible_synthetic" => true }
    allow(AssetProcessing::VlmClient).to receive(:new).and_return(fake_client(context: context, safety: unsafe))

    described_class.new(asset).call

    expect(ModerationFlags.for(asset.reload)).to include("possible_minor", "possible_synthetic")
    expect(asset.enrichments.find_by(kind: "vlm_safety").result.keys).not_to include("age")

    refused = submitted_asset
    allow(AssetProcessing::VlmClient).to receive(:new).and_return(fake_client(context: context, safety: safety, refuse: true))
    described_class.new(refused).call
    expect(ModerationFlags.for(refused.reload)).to include("unsafe_content")
    expect(refused.enrichments.find_by(kind: "vlm_context_caption").result).to eq("refused" => true)
  end

  it "still releases the asset when the VLM is not configured or fails" do
    ENV["ANTHROPIC_API_KEY"] = nil
    asset = submitted_asset
    described_class.new(asset).call
    expect(asset.reload).to be_pending_moderation
    expect(asset).to be_processing_failed
    expect(ModerationFlags.for(asset)).to include("processing_failed")

    ENV["ANTHROPIC_API_KEY"] = "test-key"
    broken = instance_double(AssetProcessing::VlmClient, model: "claude-sonnet-5")
    allow(broken).to receive(:analyze).and_raise(JSON::ParserError, "bad json")
    allow(AssetProcessing::VlmClient).to receive(:new).and_return(broken)
    other = submitted_asset
    described_class.new(other).call
    expect(other.reload).to be_pending_moderation
    expect(other.enrichments.find_by(kind: "vlm_safety")).to have_attributes(status: "failed", error: a_string_including("bad json"))
  end

  it "raises Retry on transient API errors after releasing to moderation, then resumes idempotently" do
    asset = submitted_asset
    flaky = instance_double(AssetProcessing::VlmClient, model: "claude-sonnet-5")
    allow(flaky).to receive(:analyze).and_raise(Anthropic::Errors::RateLimitError.new(url: URI("https://api.anthropic.com"), status: 429, headers: {}, body: {}, request: nil, response: nil))
    allow(AssetProcessing::VlmClient).to receive(:new).and_return(flaky)

    expect { described_class.new(asset).call }.to raise_error(AssetProcessing::Pipeline::Retry)
    expect(asset.reload).to be_pending_moderation
    expect(asset.enrichments.where(status: :done).map(&:kind)).to match_array(%w[technical duplicate])

    allow(AssetProcessing::VlmClient).to receive(:new).and_return(fake_client(context: context, safety: safety))
    expect(AssetProcessing::TechnicalCheck).not_to receive(:new)
    described_class.new(asset).call
    expect(asset.reload.enrichments.all?(&:done?)).to be(true)
  end
end
