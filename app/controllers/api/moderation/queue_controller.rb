module Api
  module Moderation
    class QueueController < Api::Staff::BaseController
      def show
        queue = Asset.moderation_queue.includes(:submission, :person_annotations)
        render json: {
          summary: ModerationSummary.call,
          items: queue.limit(100).map { |asset| ModerationQueueItemSerializer.new(asset).serializable_hash },
          total: queue.count,
          reasons: ModerationDecision::REASONS
        }
      end
    end
  end
end
