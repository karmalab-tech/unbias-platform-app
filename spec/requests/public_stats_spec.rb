require "rails_helper"

RSpec.describe "Public stats", type: :request do
  def json
    JSON.parse(response.body)
  end

  it "returns totals, buckets, needs and an ETag that changes with the data" do
    PublicCallToAction.create!(caption_en: "More people aged 75+", caption_fr: "Plus de 75 ans")
    complete_submission(people: 2).submit!

    get "/api/public/stats"
    expect(response).to have_http_status(:ok)
    expect(json["total"]).to include("approved" => 0, "pending" => 2, "target" => 10_000)
    expect(json["buckets"].size).to eq(29)
    expect(json["needs"].first["caption"]).to eq("en" => "More people aged 75+", "fr" => "Plus de 75 ans")
    etag = response.headers["ETag"]

    get "/api/public/stats", headers: { "If-None-Match" => etag }
    expect(response).to have_http_status(:not_modified)

    asset = Asset.processing.first
    ProcessAssetJob.perform_now(asset)
    asset.reload.approve!(create_staff)
    get "/api/public/stats", headers: { "If-None-Match" => etag }
    expect(response).to have_http_status(:ok)
    expect(json["total"]).to include("approved" => 2, "pending" => 0)
  end

  it "serves a QR code pointing at the contribute flow" do
    get "/qr.svg"
    expect(response.content_type).to start_with("image/svg+xml")
    expect(response.body).to include("<svg")
  end
end
