module Api
  module Admin
    class BucketsController < BaseController
      def index
        render json: RepresentationBucket.ordered.map { |bucket| serialize(bucket) }
      end

      def update
        bucket = RepresentationBucket.find(params[:id])
        bucket.update!(target_count: params.require(:target_count))
        render json: serialize(bucket)
      end

      private

      def serialize(bucket)
        bucket.slice(:id, :dimension, :value, :display_order, :target_count, :swatch)
      end
    end
  end
end
