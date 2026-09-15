require "rails_helper"

RSpec.describe "Contribution flow", type: :request do
  include ActiveJob::TestHelper

  def json
    JSON.parse(response.body)
  end

  def headers_for(token)
    { "X-Submission-Token" => token }
  end

  def start
    post "/api/submissions", params: { locale: "fr" }, as: :json
    expect(response).to have_http_status(:created)
    json.fetch("session_token")
  end

  def direct_upload(token, content_type: "image/jpeg", byte_size: 1_000)
    post "/api/direct_uploads", headers: headers_for(token), as: :json,
         params: { blob: { filename: "person.jpg", byte_size: byte_size, checksum: "abc=", content_type: content_type } }
  end

  def uploaded_blob
    ActiveStorage::Blob.create_and_upload!(io: Rails.root.join("spec/fixtures/files/person.jpg").open,
                                           filename: "person.jpg", content_type: "image/jpeg")
  end

  def add_photo(token, blob: uploaded_blob)
    post "/api/submissions/current/assets", headers: headers_for(token), as: :json,
         params: { signed_blob_id: blob.signed_id, width: 900, height: 1200 }
    expect(response).to have_http_status(:created)
    json
  end

  def person(overrides = {})
    { detection_source: "manual", detection_region: { x: 0.2, y: 0.1, w: 0.4, h: 0.8 },
      age_bucket: "30_44", skin_tone_confirmed: 5, gender: "woman", body: "medium", disability_tags: [] }.merge(overrides)
  end

  it "walks a contributor from start to a code" do
    token = start
    expect(Submission.last.locale).to eq("fr")

    get "/api/submissions/current", headers: headers_for(token)
    expect(json).to include("status" => "draft", "assets" => [], "ready_to_submit" => false)

    direct_upload(token)
    expect(response).to have_http_status(:ok)
    expect(json["direct_upload"]).to include("url")

    asset = add_photo(token)
    expect(asset["image_url"]).to eq("/api/submissions/current/assets/#{asset['id']}/image")

    patch "/api/submissions/current", headers: headers_for(token), params: { permission_confirmed: true }, as: :json
    expect(json["permission_confirmed_at"]).to be_present

    put "/api/submissions/current/assets/#{asset['id']}/people", headers: headers_for(token), as: :json,
        params: { people_confirmed: true, people: [ person, person(gender: "man", disability_tags: [ "glasses" ]) ] }
    expect(response).to have_http_status(:ok)
    expect(json["people"].size).to eq(2)
    expect(json["complete"]).to be(true)
    expect(json["people"].last["disability_tags"]).to eq([ "glasses" ])

    post "/api/submissions/current/submit", headers: headers_for(token), as: :json
    expect(response).to have_http_status(:unprocessable_content)

    post "/api/submissions/current/consent", headers: headers_for(token), as: :json,
         params: { training_allowed: true, public_display_allowed: false }
    expect(json.dig("consent", "consent_version")).to eq("v0-draft")
    expect(json["ready_to_submit"]).to be(true)

    expect {
      post "/api/submissions/current/submit", headers: headers_for(token), as: :json
    }.to have_enqueued_job(ProcessAssetJob).once
    expect(response).to have_http_status(:ok)
    expect(json["public_code"]).to match(/\AUNB-/)
    expect(json["people_count"]).to eq(2)
    expect(json["status"]).to eq("submitted")

    put "/api/submissions/current/assets/#{asset['id']}/people", headers: headers_for(token), as: :json,
        params: { people: [] }
    expect(response).to have_http_status(:conflict)

    expect {
      post "/api/submissions/current/email_code", headers: headers_for(token), as: :json,
           params: { email: "someone@example.com", updates_opt_in: true }
    }.to have_enqueued_mail(ContributionMailer, :code)
    expect(response).to have_http_status(:accepted)
    expect(Submission.last).to have_attributes(email: "someone@example.com", updates_opt_in: true)
  end

  it "rejects unknown tokens and unsupported files" do
    get "/api/submissions/current", headers: headers_for("nope")
    expect(response).to have_http_status(:not_found)

    token = start
    direct_upload(token, content_type: "image/heic")
    expect(response).to have_http_status(:unprocessable_content)
    direct_upload(token, byte_size: 30.megabytes)
    expect(response).to have_http_status(:unprocessable_content)

    gif = ActiveStorage::Blob.create_and_upload!(io: StringIO.new("GIF89a"), filename: "x.gif", content_type: "image/gif")
    post "/api/submissions/current/assets", headers: headers_for(token), as: :json, params: { signed_blob_id: gif.signed_id }
    expect(response).to have_http_status(:unprocessable_content)
  end

  it "enforces the people-per-photo limit and the taxonomy" do
    token = start
    asset = add_photo(token)

    put "/api/submissions/current/assets/#{asset['id']}/people", headers: headers_for(token), as: :json,
        params: { people_confirmed: true, people: Array.new(5) { person } }
    expect(response).to have_http_status(:unprocessable_content)

    put "/api/submissions/current/assets/#{asset['id']}/people", headers: headers_for(token), as: :json,
        params: { people_confirmed: true, people: [ person(age_bucket: "kid") ] }
    expect(response).to have_http_status(:unprocessable_content)
    expect(json["errors"].join).to include("Age bucket")
  end

  it "serves the private image only to the owning token and lets the contributor delete a photo" do
    token = start
    asset = add_photo(token)

    get "/api/submissions/current/assets/#{asset['id']}/image", headers: headers_for(token)
    expect(response).to have_http_status(:found)

    other = start
    get "/api/submissions/current/assets/#{asset['id']}/image", headers: headers_for(other)
    expect(response).to have_http_status(:not_found)

    delete "/api/submissions/current/assets/#{asset['id']}", headers: headers_for(token)
    expect(response).to have_http_status(:no_content)
    expect(Asset.exists?(asset["id"])).to be(false)
  end

  it "exposes public settings" do
    get "/api/public/settings"

    expect(json.dig("limits", "max_photos_per_submission")).to eq(20)
    expect(json.dig("taxonomy", "monk_swatches").size).to eq(10)
    expect(json["consent_version"]).to eq("v0-draft")
  end
end
