module AssetProcessing
  class TechnicalCheck
    KIND = "technical".freeze

    def initialize(asset, file)
      @asset = asset
      @file = file
      @limits = Rails.configuration.x.unbias
    end

    def call
      flags = []
      flags << "low_resolution" if [ @file.width, @file.height ].min < @limits.min_short_side_px
      flags << "blurry" if @file.sharpness < @limits.blur_variance_threshold

      @asset.update!(width: @file.width, height: @file.height, byte_size: @file.byte_size,
                     sha256: @file.sha256, phash: @file.phash)
      {
        width: @file.width, height: @file.height, byte_size: @file.byte_size,
        sharpness: @file.sharpness, sha256: @file.sha256, phash: @file.phash, flags: flags
      }
    end
  end
end
