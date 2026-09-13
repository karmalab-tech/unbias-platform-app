class ProcessAssetJob < ApplicationJob
  queue_as :default

  # Enrichment steps arrive in a later phase; for now every submitted asset goes straight to moderation.
  def perform(asset)
    return unless asset.processing?

    asset.update!(status: :pending_moderation, processing_state: :done)
    CoverageStats.bump!
  end
end
