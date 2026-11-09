module Api
  module Admin
    class ExperiencePromptsController < BaseController
      rescue_from ExperiencePrompt::UploadError do |error|
        render json: { error: error.message }, status: :unprocessable_content
      end

      def index
        ExperiencePrompt.seed!
        counts = ExperienceImage.group(:experience_prompt_id, :status).count
        outdated = ExperienceImage.succeeded.joins(:experience_prompt)
                                  .where(source: "generated")
                                  .where("experience_images.prompt IS DISTINCT FROM experience_prompts.prompt")
                                  .group(:experience_prompt_id).count
        render json: {
          images_per_prompt: ExperiencePrompt.images_per_prompt,
          configured: ImageGeneration::OpenaiClient.configured?,
          prompts: ExperiencePrompt.in_tree.map { |prompt| summary(prompt, counts, outdated) }
        }
      end

      def show
        prompt = ExperiencePrompt.find(params[:id])
        render json: {
          id: prompt.id,
          prompt: prompt.prompt,
          prompt_fr: prompt.prompt_fr,
          free_positions: prompt.free_positions,
          images: prompt.images.with_attached_file.map { |image| image_json(image) }
        }
      end

      def upload
        prompt = ExperiencePrompt.find(params[:id])
        image = prompt.upload!(params.require(:file), position: params[:position].presence&.to_i)
        render json: image_json(image), status: :created
      end

      def clear_image
        ExperienceImage.find(params[:id]).clear!
        head :no_content
      end

      def update
        prompt = ExperiencePrompt.find(params[:id])
        prompt.update!(params.require(:experience_prompt).permit(:prompt, :prompt_fr))
        render json: prompt.slice(:id, :prompt, :prompt_fr)
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

      def image_json(image)
        image.slice(:id, :position, :status, :source, :error, :attempts, :model, :generated_at)
             .merge(url: image.display_path, outdated: image.outdated?)
      end

      def summary(prompt, counts, outdated)
        statuses = ExperienceImage.statuses.keys.index_with { |status| counts[[ prompt.id, status ]].to_i }
        statuses["outdated"] = outdated[prompt.id].to_i
        statuses["succeeded"] -= statuses["outdated"]
        prompt.slice(:id, :path, :prompt, :prompt_fr, :depth).merge(counts: statuses)
      end
    end
  end
end
