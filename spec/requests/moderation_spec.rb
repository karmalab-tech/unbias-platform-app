require "rails_helper"

RSpec.describe "Moderation", type: :request do
  let(:moderator) { create_staff }

  def json
    JSON.parse(response.body)
  end

  def pending_asset(people: 1, **overrides)
    submission = complete_submission(people: people, **overrides)
    submission.submit!
    asset = submission.assets.first
    ProcessAssetJob.perform_now(asset)
    asset.reload
  end

  it "requires a signed-in staff member" do
    get "/api/moderation/queue"
    expect(response).to have_http_status(:unauthorized)
  end

  it "lists pending assets oldest first with a summary" do
    older = pending_asset
    older.update_column(:submitted_at, 2.hours.ago)
    newer = pending_asset(people: 3)
    pending_asset.approve!(moderator)

    sign_in moderator
    get "/api/moderation/queue"

    expect(json["summary"]).to eq("pending" => 2, "approved_today" => 1, "rejected_today" => 0)
    expect(json["items"].map { |i| i["id"] }).to eq([ older.id, newer.id ])
    expect(json["items"].last["people_count"]).to eq(3)
    expect(json["items"].first["public_code"]).to start_with("UNB-")
  end

  it "shows a review payload and records decisions" do
    asset = pending_asset(people: 2, disability_tags: [ "wheelchair" ])
    sign_in moderator

    get "/api/moderation/assets/#{asset.id}"
    expect(json.dig("asset", "people").size).to eq(2)
    expect(json.dig("asset", "people", 0, "disability_tags")).to eq([ "wheelchair" ])
    expect(json.dig("asset", "submission", "public_code")).to start_with("UNB-")
    expect(json.dig("asset", "submission", "asset_count")).to eq(1)
    expect(json.dig("asset", "flags")).to eq([])
    expect(json.dig("asset", "image_url")).to eq("/api/moderation/assets/#{asset.id}/image")

    post "/api/moderation/assets/#{asset.id}/reject", params: { reason: "incorrect_labeling" }, as: :json
    expect(response).to have_http_status(:ok)
    expect(json.dig("asset", "status")).to eq("rejected")
    expect(json.dig("asset", "decision")).to include("decision" => "rejected", "reason" => "incorrect_labeling", "moderator" => moderator.email)
    expect(json.dig("summary", "rejected_today")).to eq(1)

    post "/api/moderation/assets/#{asset.id}/approve", as: :json
    expect(response).to have_http_status(:unprocessable_content)
  end

  it "rejects unknown reasons and serves the image" do
    asset = pending_asset
    sign_in moderator

    post "/api/moderation/assets/#{asset.id}/reject", params: { reason: "meh" }, as: :json
    expect(response).to have_http_status(:unprocessable_content)

    get "/api/moderation/assets/#{asset.id}/image"
    expect(response).to have_http_status(:found)
  end
end
