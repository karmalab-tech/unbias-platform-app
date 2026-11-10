module Api
  module Public
    class ExperiencesController < BaseController
      def show
        version = ExperiencePrompt.public_tree_version
        return unless stale?(etag: version, public: true)

        render json: Rails.cache.fetch([ "experience-tree", version ]) { ExperiencePrompt.public_tree }
      end
    end
  end
end
