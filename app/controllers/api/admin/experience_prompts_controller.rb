module Api
  module Admin
    class ExperiencePromptsController < BaseController
      def index
        ExperiencePrompt.sync!
        counts = ExperienceImage.group(:experience_prompt_id, :status).count
        render json: {
          images_per_prompt: ExperiencePrompt.images_per_prompt,
          configured: ImageGeneration::OpenaiClient.configured?,
          prompts: ExperiencePrompt.in_tree.map { |prompt| summary(prompt, counts) }
        }
      end

      def show
        prompt = ExperiencePrompt.find(params[:id])
        render json: {
          id: prompt.id,
          prompt: prompt.prompt,
          images: prompt.images.with_attached_file.map do |image|
            image.slice(:id, :position, :status, :error, :attempts, :model, :generated_at).merge(url: image.display_path)
          end
        }
      end

      def generate
        GenerateExperiencePromptJob.perform_later(ExperiencePrompt.find(params[:id]))
        head :accepted
      end

      def generate_all
        ActiveJob.perform_all_later(ExperiencePrompt.in_tree.map { |prompt| GenerateExperiencePromptJob.new(prompt) })
        head :accepted
      end

      def regenerate_image
        ExperienceImage.find(params[:id]).regenerate!
        head :accepted
      end

      private

      def summary(prompt, counts)
        statuses = ExperienceImage.statuses.keys.index_with { |status| counts[[ prompt.id, status ]].to_i }
        prompt.slice(:id, :path, :prompt, :depth).merge(counts: statuses)
      end
    end
  end
end
