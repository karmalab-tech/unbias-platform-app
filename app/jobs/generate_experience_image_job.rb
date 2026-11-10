class GenerateExperienceImageJob < ApplicationJob
  queue_as :default

  # Keeps the number of simultaneous OpenAI calls under the account's rate limit.
  limits_concurrency to: Rails.configuration.x.unbias.image_generation_concurrency, key: "experience-image-generation",
                     duration: 10.minutes

  retry_on ImageGeneration::Transient, wait: :polynomially_longer, attempts: 6 do |job, error|
    job.arguments.first.fail!(error.message)
  end

  def perform(experience_image)
    experience_image.generate!
  end
end
