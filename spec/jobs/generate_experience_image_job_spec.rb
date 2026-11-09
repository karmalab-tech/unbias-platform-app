require "rails_helper"

RSpec.describe GenerateExperienceImageJob do
  include ActiveJob::TestHelper

  it "marks the image failed once transient retries run out" do
    ExperiencePrompt.sync!
    image = ExperiencePrompt.first.images.create!(position: 1, status: :queued)
    allow_any_instance_of(ImageGeneration::OpenaiClient).to receive(:generate).and_raise(ImageGeneration::Transient, "OpenAI 503")
    stub_const("ENV", ENV.to_h.merge("OPENAI_API_KEY" => "test"))

    perform_enqueued_jobs { described_class.perform_later(image) }

    expect(image.reload).to be_failed
    expect(image.error).to eq("OpenAI 503")
    expect(image.attempts).to eq(6)
  end
end
