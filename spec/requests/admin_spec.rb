require "rails_helper"

RSpec.describe "Admin", type: :request do
  let(:admin) { create_staff(role: :admin) }
  let(:moderator) { create_staff }

  def json
    JSON.parse(response.body)
  end

  it "is closed to moderators" do
    sign_in moderator
    get "/api/admin/dashboard"
    expect(response).to have_http_status(:forbidden)
  end

  it "manages calls to action with the active limit" do
    sign_in admin
    3.times { |i| post "/api/admin/calls_to_action", params: { call_to_action: { caption_en: "Need #{i}" } }, as: :json }
    expect(response).to have_http_status(:created)

    post "/api/admin/calls_to_action", params: { call_to_action: { caption_en: "Fourth" } }, as: :json
    expect(response).to have_http_status(:unprocessable_content)

    id = PublicCallToAction.first.id
    patch "/api/admin/calls_to_action/#{id}", params: { call_to_action: { active: false, caption_fr: "Besoin" } }, as: :json
    expect(json).to include("active" => false, "caption_fr" => "Besoin")

    delete "/api/admin/calls_to_action/#{id}"
    expect(response).to have_http_status(:no_content)
    expect(PublicCallToAction.count).to eq(2)
  end

  it "edits bucket targets and reflects them in public stats" do
    sign_in admin
    bucket = RepresentationBucket.find_by!(dimension: "age", value: "75_plus")

    patch "/api/admin/buckets/#{bucket.id}", params: { target_count: 3_000 }, as: :json
    expect(json["target_count"]).to eq(3_000)

    get "/api/public/stats"
    expect(json["buckets"].find { |b| b["value"] == "75_plus" }["target"]).to eq(3_000)
  end

  it "invites moderators and protects the admin's own account" do
    sign_in admin

    expect {
      post "/api/admin/moderators", params: { email: "new@example.com", role: "moderator" }, as: :json
    }.to have_enqueued_mail(Devise::Mailer, :reset_password_instructions)
    expect(response).to have_http_status(:created)
    invited = User.find_by!(email: "new@example.com")

    patch "/api/admin/moderators/#{invited.id}", params: { role: "admin" }, as: :json
    expect(json["role"]).to eq("admin")

    delete "/api/admin/moderators/#{admin.id}"
    expect(response).to have_http_status(:unprocessable_content)

    delete "/api/admin/moderators/#{invited.id}"
    expect(response).to have_http_status(:no_content)
  end

  it "looks up a contribution by code and withdraws it" do
    submission = complete_submission(people: 2)
    add_asset(submission, position: 1).then { |a| annotate(a) }
    submission.submit!
    submission.assets.each { |a| ProcessAssetJob.perform_now(a) }
    sign_in admin

    get "/api/admin/submissions/lookup", params: { code: submission.public_code.downcase }
    expect(json["assets"].size).to eq(2)
    expect(json["assets"].first["image_url"]).to be_present

    post "/api/admin/assets/#{submission.assets.first.id}/withdraw"
    expect(json["assets"].map { |a| a["status"] }).to eq(%w[withdrawn pending_moderation])

    post "/api/admin/submissions/#{submission.id}/withdraw"
    expect(json["status"]).to eq("withdrawn")
    expect(json["assets"].map { |a| a["status"] }).to eq(%w[withdrawn withdrawn])

    get "/api/public/stats"
    expect(json["total"]["pending"]).to eq(0)

    get "/api/admin/submissions/lookup", params: { code: "UNB-0000-0000" }
    expect(response).to have_http_status(:not_found)
  end

  it "summarises the dashboard" do
    sign_in admin
    complete_submission.submit!

    get "/api/admin/dashboard"
    expect(json["assets_by_status"]).to eq("processing" => 1)
    expect(json["submissions"]["submitted"]).to eq(1)
    expect(json["moderation"]["pending"]).to eq(0)
  end
end
