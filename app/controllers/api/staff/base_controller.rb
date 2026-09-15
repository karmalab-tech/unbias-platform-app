module Api
  module Staff
    class BaseController < Api::BaseController
      include ActiveStorage::SetCurrent

      before_action :require_staff!

      private

      def signed_image_url(asset, max: 1600)
        return nil unless asset.original.attached?

        asset.original.variant(resize_to_limit: [ max, max ], saver: { quality: 85 }).processed
             .url(expires_in: 10.minutes, disposition: "inline")
      end
    end
  end
end
