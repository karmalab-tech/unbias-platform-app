require "rails_helper"

RSpec.describe ExperiencePrompt do
  include ActiveJob::TestHelper

  let(:webp) { Rails.root.join("spec/fixtures/files/person.jpg").binread }
  let(:client) do
    instance_double(ImageGeneration::OpenaiClient, generate: ImageGeneration::Result.new(bytes: webp, format: "jpeg", model: "gpt-image-test"))
  end

  before { ExperiencePrompt.seed! }

  it "mirrors the prompt tree" do
    expect(described_class.in_tree.count).to eq(1 + 2 + 6 + 24)
    expect(described_class.in_tree.first.prompt).to eq("Create a photo of a person.")
    expect(described_class.find_by(path: "person/man/old/arab").prompt)
      .to eq("Create a photo of an old Arab man.")
  end

  it "keeps removed nodes out of the tree without deleting their images" do
    described_class.create!(path: "person/robot", prompt: "Create a photo of a robot.", prompt_fr: "Un robot.", depth: 1, position: 999)
    described_class.seed!
    expect(described_class.find_by(path: "person/robot").in_tree).to be(false)
  end

  it "seeds French wording and never overwrites edited wording" do
    woman = described_class.find_by(path: "person/woman/old")
    expect(woman.prompt_fr).to eq("Crée une photo d’une femme âgée.")
    woman.update!(prompt: "Create a photo of an elderly woman.", prompt_fr: "Crée une photo d’une vieille femme.")
    described_class.seed!
    expect(woman.reload.prompt).to eq("Create a photo of an elderly woman.")
    expect(woman.prompt_fr).to eq("Crée une photo d’une vieille femme.")
  end

  it "highlights the words a prompt adds to its parent" do
    segments = ExperienceTree.highlight("Create a photo of a young Black woman with braids.", "Create a photo of a young woman.")
    expect(segments.select { |segment| segment[:added] }.pluck(:text)).to eq([ "Black", "with braids" ])
    expect(segments.pluck(:text).join).to eq("Create a photo of a young Black woman with braids.")
    expect(ExperienceTree.highlight("Create a photo of a person.", nil)).to eq([ { text: "Create a photo of a person." } ])
    thin = ExperienceTree.highlight("Create a photo of a thin old Arab man.", "Create a photo of an old Arab man.")
    expect(thin.select { |segment| segment[:added] }.pluck(:text)).to eq([ "thin" ])
  end

  it "queues one job per missing or failed image" do
    prompt = described_class.find_by(path: "person")
    expect { prompt.generate! }.to have_enqueued_job(GenerateExperienceImageJob).exactly(15).times
    expect(prompt.images.count).to eq(15)
    expect(prompt.images.queued.count).to eq(15)

    prompt.images.first.update!(status: :failed, error: "boom")
    prompt.images.second.update!(status: :succeeded, prompt: prompt.prompt)
    prompt.images.third.update!(status: :succeeded, prompt: "An older wording.")
    clear_enqueued_jobs
    expect { prompt.generate! }.to have_enqueued_job(GenerateExperienceImageJob).exactly(2).times
  end

  describe "#upload!" do
    let(:prompt) { described_class.find_by(path: "person") }

    def photo(name = "person.jpg", type = "image/jpeg")
      Rack::Test::UploadedFile.new(Rails.root.join("spec/fixtures/files", name), type)
    end

    it "fills the free spots in order and replaces a chosen spot" do
      prompt.images.create!(position: 1, status: :succeeded, prompt: prompt.prompt)
      first = prompt.upload!(photo)
      expect(first.position).to eq(2)
      expect(first).to be_uploaded
      expect(first).to be_succeeded
      expect(first.file).to be_attached

      replaced = prompt.upload!(photo, position: 1)
      expect(replaced.position).to eq(1)
      expect(replaced.reload).to be_uploaded
      expect(prompt.free_positions).to eq((3..15).to_a)
    end

    it "keeps uploaded images when the English wording changes" do
      image = prompt.upload!(photo)
      prompt.update!(prompt: "Create a portrait of a person.")
      expect(image.reload).to be_current
      expect { prompt.generate! }.to have_enqueued_job(GenerateExperienceImageJob).exactly(14).times
      expect(prompt.display_paths.first).to be_present
    end

    it "refuses other file types and a full prompt" do
      expect { prompt.upload!(photo("../../../README.md", "text/plain")) }
        .to raise_error(ExperiencePrompt::UploadError, "unsupported_type")
      15.times { prompt.upload!(photo) }
      expect { prompt.upload!(photo) }.to raise_error(ExperiencePrompt::UploadError, "no_free_position")
    end
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
