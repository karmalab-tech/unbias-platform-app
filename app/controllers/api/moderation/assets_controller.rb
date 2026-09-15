module Api
  module Moderation
    class AssetsController < Api::Staff::BaseController
      before_action :load_asset

      def show
        render_asset
      end

      def approve
        @asset.approve!(current_user)
        render_asset
      end

      def reject
        @asset.reject!(current_user, params.require(:reason))
        render_asset
      end

      def image
        url = signed_image_url(@asset)
        raise ActiveRecord::RecordNotFound unless url

        redirect_to url, allow_other_host: true
      end

      private

      def load_asset
        @asset = Asset.where.not(status: :draft).includes(:submission, :person_annotations, :enrichments).find(params[:id])
      end

      def render_asset
        render json: {
          asset: ModerationAssetSerializer.new(@asset.reload).serializable_hash,
          summary: ModerationSummary.call
        }
      end
    end
  end
end
