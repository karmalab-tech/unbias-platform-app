# One run of an ExperiencePrompt. Each image is its own job so a failure only costs one retry.
class ExperienceImage < ApplicationRecord
  belongs_to :experience_prompt, touch: true

  has_one_attached :file do |attachable|
    attachable.variant :display, resize_to_limit: [ 640, 640 ], format: :webp, preprocessed: true
  end

  enum :status, { pending: "pending", queued: "queued", generating: "generating", succeeded: "succeeded", failed: "failed" },
       default: :pending

  def generate!(client: ImageGeneration::OpenaiClient.new)
    return if succeeded?

    update!(status: :generating, attempts: attempts + 1, error: nil)
    result = client.generate(prompt: experience_prompt.prompt)
    file.attach(io: StringIO.new(result.bytes), filename: format("%02d.%s", position, result.format),
                content_type: "image/#{result.format}")
    update!(status: :succeeded, prompt: experience_prompt.prompt, model: result.model, generated_at: Time.current)
  rescue ImageGeneration::Transient
    update!(status: :queued)
    raise
  rescue ImageGeneration::Error => error
    fail!(error.message)
  end

  def display_path
    return unless file.attached?

    Rails.application.routes.url_helpers.rails_representation_path(file.variant(:display), only_path: true)
  end

  def fail!(message)
    update!(status: :failed, error: message.to_s.truncate(2_000))
  end

  def regenerate!
    file.purge if file.attached?
    update!(status: :queued, error: nil, generated_at: nil)
    GenerateExperienceImageJob.perform_later(self)
  end
end
