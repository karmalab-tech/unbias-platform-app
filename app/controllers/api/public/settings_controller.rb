module Api
  module Public
    class SettingsController < BaseController
      def show
        render json: {
          limits: limits.slice(:max_photos_per_submission, :max_people_per_photo, :min_short_side_px, :max_file_bytes,
                               :accepted_content_types, :stats_poll_seconds, :installation_poll_seconds),
          consent_version: limits.consent_version,
          taxonomy: {
            age: Representation::AGE, skin_tone: Representation::SKIN_TONE, gender: Representation::GENDER,
            body: Representation::BODY, disability: Representation::DISABILITY, monk_swatches: Representation::MONK_SWATCHES
          }
        }
      end
    end
  end
end
