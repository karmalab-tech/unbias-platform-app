require "rails_helper"

RSpec.describe "Bias experience", type: :request do
  include ActiveJob::TestHelper

  let(:admin) { create_staff(role: :admin) }

  def json
    JSON.parse(response.body)
  end

  def finished_image(path, position)
    prompt = ExperiencePrompt.find_by!(path: path)
    image = prompt.images.create!(position: position, status: :succeeded, prompt: prompt.prompt)
    image.file.attach(io: Rails.root.join("spec/fixtures/files/person.jpg").open, filename: "01.jpeg", content_type: "image/jpeg")
    image
  end

  it "serves the tree with the finished images only" do
    ExperiencePrompt.seed!
    finished_image("person/woman", 2)

    get "/api/public/experience"

    expect(response).to have_http_status(:ok)
    expect(json["images_per_prompt"]).to eq(15)
    woman = json["prompts"].find { |prompt| prompt["path"] == "person/woman" }
    expect(woman["parent"]).to eq("person")
    expect(woman.dig("segments", "en")).to include({ "text" => "woman", "added" => true })
    expect(woman.dig("segments", "fr").pluck("text").join).to eq("Crée une photo d’une femme.")
    expect(woman["images"][0]).to be_nil
    expect(woman["images"][1]).to start_with("/rails/active_storage/representations/proxy/")
  end

  it "keeps generation admin only" do
    sign_in create_staff
    get "/api/admin/experience_prompts"
    expect(response).to have_http_status(:forbidden)
  end

  it "lists prompts with their generation status and queues generation" do
    sign_in admin
    get "/api/admin/experience_prompts"

    expect(json["prompts"].size).to eq(81)
    root = json["prompts"].first
    expect(root).to include("path" => "person", "prompt" => "Create a photo of a person.", "depth" => 0)
    expect(root["counts"]).to include("succeeded" => 0, "failed" => 0)

    expect { post "/api/admin/experience_prompts/#{root["id"]}/generate" }
      .to have_enqueued_job(GenerateExperiencePromptJob)
    expect(response).to have_http_status(:accepted)

    expect { post "/api/admin/experience_prompts/generate_all" }
      .to have_enqueued_job(GenerateExperiencePromptJob).exactly(81).times
  end

  it "edits the wording, which marks earlier images outdated" do
    sign_in admin
    ExperiencePrompt.seed!
    image = finished_image("person/woman", 1)

    patch "/api/admin/experience_prompts/#{image.experience_prompt_id}",
          params: { experience_prompt: { prompt: "Create a photo of a female person.", prompt_fr: "Une personne." } }, as: :json
    expect(json).to include("prompt" => "Create a photo of a female person.", "prompt_fr" => "Une personne.")

    get "/api/admin/experience_prompts"
    row = json["prompts"].find { |prompt| prompt["path"] == "person/woman" }
    expect(row["counts"]).to include("outdated" => 1, "succeeded" => 0)

    get "/api/public/experience"
    expect(json["prompts"].find { |prompt| prompt["path"] == "person/woman" }["images"].compact).to be_empty
  end

  it "shows a prompt's images and regenerates one" do
    sign_in admin
    ExperiencePrompt.seed!
    image = finished_image("person", 1)

    get "/api/admin/experience_prompts/#{image.experience_prompt_id}"
    expect(json["images"].first).to include("position" => 1, "status" => "succeeded")
    expect(json["images"].first["url"]).to be_present

    expect { post "/api/admin/experience_images/#{image.id}/regenerate" }.to have_enqueued_job(GenerateExperienceImageJob)
    expect(image.reload).to be_queued
    expect(image.file).not_to be_attached
  end
end
