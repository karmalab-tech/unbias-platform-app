module Api
  # Same contract as ActiveStorage::DirectUploadsController, but only for an active draft
  # and only for the accepted image types and sizes.
  class DirectUploadsController < ContributorController
    include ActiveStorage::SetCurrent

    before_action :require_draft

    rate_limit to: 120, within: 10.minutes, with: -> { too_many_requests }

    def create
      args = blob_args
      unless limits.accepted_content_types.include?(args[:content_type]) && args[:byte_size].to_i <= limits.max_file_bytes
        return render json: { error: I18n.t("api.unsupported_file") }, status: :unprocessable_content
      end

      blob = ActiveStorage::Blob.create_before_direct_upload!(**args)
      render json: blob.as_json(root: false, methods: :signed_id).merge(
        direct_upload: { url: blob.service_url_for_direct_upload, headers: blob.service_headers_for_direct_upload }
      )
    end

    private

    def blob_args
      params.expect(blob: [ :filename, :byte_size, :checksum, :content_type, metadata: {} ]).to_h.symbolize_keys
    end
  end
end
