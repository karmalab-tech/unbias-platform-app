# Advisory flags shown to moderators, derived from enrichment results. Never decide anything.
module ModerationFlags
  def self.for(asset)
    flags = []
    flags << "processing_failed" if asset.processing_failed? || asset.enrichments.any?(&:failed?)
    asset.enrichments.each do |enrichment|
      result = enrichment.result || {}
      Array(result["flags"]).each { |flag| flags << flag.to_s }
    end
    flags.uniq
  end
end
