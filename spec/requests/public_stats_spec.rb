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

  it "adds the disclosed launch boost to photos and approved people, and says so in the payload" do
    limits = Rails.configuration.x.unbias
    allow(Rails.configuration).to receive(:x).and_return(double(unbias: limits.dup.tap { |l|
      l.launch_boost_photos_floor = 1_573
      l.launch_boost_people_floor = 1_100
    }))
    complete_submission(people: 2).submit!

    get "/api/public/stats"
    expect(json["images"]).to be > 1_573
    expect(json["total"]).to include("pending" => 2)
    expect(json["total"]["approved"]).to be >= 1_100
    expect(json["launch_boost"]).to include("active" => true, "until" => 2_500)
    expect(json["launch_boost"]["photos"]).to include("real" => 1, "shown" => json["images"])
    expect(json["launch_boost"]["people_approved"]).to include("real" => 0)
  end

  it "serves a QR code pointing at the contribute flow" do
    get "/qr.svg"
    expect(response.content_type).to start_with("image/svg+xml")
    expect(response.body).to include("<svg")
  end
end
