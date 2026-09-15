module Api
  module Admin
    class CallsToActionController < BaseController
      before_action :load_cta, only: [ :update, :destroy ]

      def index
        render json: PublicCallToAction.order(:display_order, :id).map { |cta| serialize(cta) }
      end

      def create
        cta = PublicCallToAction.create!(cta_params)
        render json: serialize(cta), status: :created
      end

      def update
        @cta.update!(cta_params)
        render json: serialize(@cta)
      end

      def destroy
        @cta.destroy!
        head :no_content
      end

      private

      def load_cta
        @cta = PublicCallToAction.find(params[:id])
      end

      def cta_params
        params.require(:call_to_action).permit(:caption_en, :caption_fr, :active, :display_order)
      end

      def serialize(cta)
        cta.slice(:id, :caption_en, :caption_fr, :active, :display_order, :updated_at)
      end
    end
  end
end
