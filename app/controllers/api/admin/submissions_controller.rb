module Api
  module Admin
    # Support tooling: find a contribution by its code and withdraw all or part of it.
    class SubmissionsController < BaseController
      def lookup
        submission = Submission.find_by!(public_code: params.require(:code).to_s.strip.upcase)
        render json: serialize(submission)
      end

      def withdraw
        submission = Submission.find(params[:id])
        submission.withdraw!
        render json: serialize(submission.reload)
      end

      def withdraw_asset
        asset = Asset.find(params[:id])
        asset.withdraw!
        CoverageStats.bump!
        render json: serialize(asset.submission.reload)
      end

      private

      def serialize(submission)
        {
          id: submission.id,
          public_code: submission.public_code,
          status: submission.status,
          submitted_at: submission.submitted_at,
          withdrawn_at: submission.withdrawn_at,
          email_present: submission.email.present?,
          consent: submission.consent && ConsentSerializer.new(submission.consent).serializable_hash,
          assets: submission.assets.map do |asset|
            {
              id: asset.id, status: asset.status, position: asset.position,
              people_count: asset.person_annotations.size,
              image_url: asset.original.attached? && !asset.withdrawn? ? "/api/moderation/assets/#{asset.id}/image" : nil
            }
          end
        }
      end
    end
  end
end
