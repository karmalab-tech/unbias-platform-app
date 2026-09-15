module AssetProcessing
  class DuplicateCheck
    KIND = "duplicate".freeze

    def initialize(asset)
      @asset = asset
      @limits = Rails.configuration.x.unbias
    end

    def call
      others = Asset.where.not(id: @asset.id).where.not(status: %w[draft withdrawn]).includes(:submission)
      exact = others.where(sha256: @asset.sha256).to_a
      near = others.where.not(phash: nil).where.not(id: exact.map(&:id)).select do |other|
        ImageFile.hamming(other.phash, @asset.phash) <= @limits.phash_max_distance
      end

      flags = []
      flags << "exact_duplicate" if exact.any?
      flags << "near_duplicate" if near.any?
      { flags: flags, exact: describe(exact), near: describe(near) }
    end

    private

    def describe(assets)
      assets.first(5).map do |other|
        { asset_id: other.id, public_code: other.submission.public_code, status: other.status,
          distance: ImageFile.hamming(other.phash.to_s, @asset.phash.to_s) }
      end
    end
  end
end
