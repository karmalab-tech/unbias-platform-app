module Api
  class AssetsController < ContributorController
    include ActiveStorage::SetCurrent

    before_action :require_draft, except: :image
    before_action :load_asset, except: :create

    def create
      if @submission.assets.count >= limits.max_photos_per_submission
        return render json: { error: I18n.t("api.too_many_photos", max: limits.max_photos_per_submission) },
                      status: :unprocessable_content
      end

      blob = ActiveStorage::Blob.find_signed!(params.require(:signed_blob_id))
      unless acceptable_blob?(blob)
        blob.purge_later
        return render json: { error: I18n.t("api.unsupported_file") }, status: :unprocessable_content
      end

      asset = @submission.assets.create!(
        position: params.fetch(:position, @submission.assets.count).to_i,
        width: params[:width], height: params[:height],
        content_type: blob.content_type, byte_size: blob.byte_size
      )
      asset.original.attach(blob)
      @submission.touch
      render json: AssetSerializer.new(asset).serializable_hash, status: :created
    end

    def destroy
      @asset.destroy!
      @submission.touch
      head :no_content
    end

    # Replaces the whole people list: the contributor-confirmed list is canonical.
    def people
      people = params.fetch(:people, [])
      if people.size > limits.max_people_per_photo
        return render json: { error: I18n.t("api.too_many_people", max: limits.max_people_per_photo) },
                      status: :unprocessable_content
      end

      Asset.transaction do
        @asset.person_annotations.destroy_all
        people.each_with_index do |person, index|
          @asset.person_annotations.create!(person_attributes(person).merge(person_index: index))
        end
        @asset.update!(people_confirmed: params[:people_confirmed] == true)
      end
      @submission.touch
      render json: AssetSerializer.new(@asset.reload).serializable_hash
    end

    def image
      raise ActiveRecord::RecordNotFound unless @asset.original.attached?

      redirect_to @asset.original.url(expires_in: 10.minutes, disposition: "inline"), allow_other_host: true
    end

    private

    def load_asset
      @asset = @submission.assets.find(params[:id])
    end

    def acceptable_blob?(blob)
      limits.accepted_content_types.include?(blob.content_type) && blob.byte_size <= limits.max_file_bytes
    end

    def person_attributes(person)
      attrs = person.permit(:age_bucket, :skin_tone_auto, :skin_tone_confirmed, :gender, :body, :detection_source,
                            disability_tags: [], detection_region: [ :x, :y, :w, :h ]).to_h
      attrs["detection_source"] = attrs["detection_source"].presence_in(%w[detector manual]) || "manual"
      attrs["disability_tags"] = Array(attrs["disability_tags"]).compact_blank
      attrs
    end
  end
end
