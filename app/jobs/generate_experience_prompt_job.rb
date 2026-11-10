class GenerateExperiencePromptJob < ApplicationJob
  queue_as :default

  def perform(experience_prompt)
    experience_prompt.generate!
  end
end
