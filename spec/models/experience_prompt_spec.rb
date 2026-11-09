require "rails_helper"

RSpec.describe ExperiencePrompt do
  include ActiveJob::TestHelper

  let(:webp) { Rails.root.join("spec/fixtures/files/person.jpg").binread }
  let(:client) do
    instance_double(ImageGeneration::OpenaiClient, generate: ImageGeneration::Result.new(bytes: webp, format: "jpeg", model: "gpt-image-test"))
  end

  before { ExperiencePrompt.sync! }

  it "mirrors the prompt tree" do
    expect(described_class.in_tree.count).to eq(1 + 3 + 9 + 36 + 72)
    expect(described_class.in_tree.first.prompt).to eq("Create a photo of a person.")
    expect(described_class.find_by(path: "person/man/old/east_asian/plus_size").prompt)
      .to eq("Create a photo of an old East Asian man who is plus-size.")
  end

  it "keeps removed nodes out of the tree without deleting their images" do
    described_class.create!(path: "person/robot", prompt: "Create a photo of a robot.", depth: 1, position: 999)
    described_class.sync!
    expect(described_class.find_by(path: "person/robot").in_tree).to be(false)
  end

  it "queues one job per missing or failed image" do
    prompt = described_class.find_by(path: "person")
    expect { prompt.generate! }.to have_enqueued_job(GenerateExperienceImageJob).exactly(20).times
    expect(prompt.images.count).to eq(20)
    expect(prompt.images.queued.count).to eq(20)

    prompt.images.first.update!(status: :failed, error: "boom")
    prompt.images.second.update!(status: :succeeded)
    clear_enqueued_jobs
    expect { prompt.generate! }.to have_enqueued_job(GenerateExperienceImageJob).exactly(1).times
  end

  describe ExperienceImage do
    let(:image) { described_class.create!(experience_prompt: ExperiencePrompt.find_by(path: "person/woman"), position: 3) }

    it "stores the generated file and the prompt used" do
      image.generate!(client: client)
      expect(image.reload).to be_succeeded
      expect(image.file).to be_attached
      expect(image.file.filename.to_s).to eq("03.jpeg")
      expect(image.prompt).to eq("Create a photo of a woman.")
      expect(image.model).to eq("gpt-image-test")
      expect(image.attempts).to eq(1)
    end

    it "marks permanent errors as failed" do
      allow(client).to receive(:generate).and_raise(ImageGeneration::Error, "OpenAI 400: blocked")
      image.generate!(client: client)
      expect(image.reload).to be_failed
      expect(image.error).to eq("OpenAI 400: blocked")
    end

    it "re-raises transient errors so the job retries" do
      allow(client).to receive(:generate).and_raise(ImageGeneration::Transient, "OpenAI 429")
      expect { image.generate!(client: client) }.to raise_error(ImageGeneration::Transient)
      expect(image.reload).to be_queued
    end

    it "fails without an API key" do
      stub_const("ENV", ENV.to_h.except("OPENAI_API_KEY"))
      image.generate!
      expect(image.reload.error).to eq("OPENAI_API_KEY is not set")
    end
  end
end
