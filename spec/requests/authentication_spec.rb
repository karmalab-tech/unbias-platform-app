require "rails_helper"

RSpec.describe "Authentication", type: :request do
  let(:credentials) { { email: "user@example.com", password: "password123" } }

  def json
    JSON.parse(response.body)
  end

  describe "POST /users (sign up)" do
    it "is not routable: staff accounts are created by admins" do
      post "/users", params: { user: credentials }, as: :json

      expect(response).to have_http_status(:not_found)
      expect(User.count).to eq(0)
    end
  end

  describe "POST /users/sign_in (sign in)" do
    before { User.create!(credentials) }

    it "signs in with valid credentials" do
      post user_session_path, params: { user: credentials }, as: :json

      expect(response).to have_http_status(:ok)
      expect(json.dig("user", "email")).to eq("user@example.com")
      expect(json.dig("user", "role")).to eq("moderator")
    end

    it "returns 401 with a JSON body for bad credentials" do
      post user_session_path,
           params: { user: { email: credentials[:email], password: "wrong" } },
           as: :json

      expect(response).to have_http_status(:unauthorized)
      expect(json["error"]).to be_present
    end
  end

  describe "GET /current_user" do
    it "returns nil when signed out" do
      get current_user_path, as: :json

      expect(response).to have_http_status(:ok)
      expect(json["user"]).to be_nil
    end

    it "returns the user once signed in" do
      User.create!(credentials)
      post user_session_path, params: { user: credentials }, as: :json

      get current_user_path, as: :json

      expect(json.dig("user", "email")).to eq("user@example.com")
    end
  end
end
