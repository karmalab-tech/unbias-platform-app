require "rails_helper"

RSpec.describe "Bias experience", type: :request do
  include ActiveJob::TestHelper

  let(:admin) { create_staff(role: :admin) }

  def json
    JSON.parse(response.body)
  end

  def finished_image(path, position)
    prompt = ExperiencePrompt.find_by!(path: path)
    image = prompt.images.create!(position: position, status: :succeeded)
    image.file.attach(io: Rails.root.join("spec/fixtures/files/person.jpg").open, filename: "01.jpeg", content_type: "image/jpeg")
    image
  end

  it "serves the tree with the finished images only" do
    ExperiencePrompt.sync!
    finished_image("person/woman", 2)

    get "/api/public/experience"

    expect(response).to have_http_status(:ok)
    expect(json["images_per_prompt"]).to eq(20)
    expect(json["steps"]).to eq(%w[gender age origin body])
    woman = json["prompts"].find { |prompt| prompt["path"] == "person/woman" }
    expect(woman).to include("parent" => "person", "step" => "gender")
    expect(woman.dig("segments", "fr").pluck("text").join).to eq("Crée une photo d’une femme.")
    expect(woman["images"][0]).to be_nil
    expect(woman["images"][1]).to start_with("/rails/active_storage/representations/redirect/")
  end

  it "keeps generation admin only" do
    sign_in create_staff
    get "/api/admin/experience_prompts"
    expect(response).to have_http_status(:forbidden)
  end

  it "lists prompts with their generation status and queues generation" do
    sign_in admin
    get "/api/admin/experience_prompts"

    expect(json["prompts"].size).to eq(121)
    root = json["prompts"].first
    expect(root).to include("path" => "person", "prompt" => "Create a photo of a person.", "depth" => 0)
    expect(root["counts"]).to include("succeeded" => 0, "failed" => 0)

    expect { post "/api/admin/experience_prompts/#{root["id"]}/generate" }
      .to have_enqueued_job(GenerateExperiencePromptJob)
    expect(response).to have_http_status(:accepted)

    expect { post "/api/admin/experience_prompts/generate_all" }
      .to have_enqueued_job(GenerateExperiencePromptJob).exactly(121).times
  end

  it "shows a prompt's images and regenerates one" do
    sign_in admin
    ExperiencePrompt.sync!
    image = finished_image("person", 1)

    get "/api/admin/experience_prompts/#{image.experience_prompt_id}"
    expect(json["images"].first).to include("position" => 1, "status" => "succeeded")
    expect(json["images"].first["url"]).to be_present

    expect { post "/api/admin/experience_images/#{image.id}/regenerate" }.to have_enqueued_job(GenerateExperienceImageJob)
    expect(image.reload).to be_queued
    expect(image.file).not_to be_attached
  end
end
