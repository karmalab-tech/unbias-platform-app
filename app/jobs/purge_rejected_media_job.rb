# Rejected photos never count and are never exported; their files go after the retention window.
class PurgeRejectedMediaJob < ApplicationJob
  queue_as :default

  def perform
    cutoff = Rails.configuration.x.unbias.rejected_media_retention_days.days.ago
    Asset.rejected.where(moderated_at: ...cutoff).joins(:original_attachment).find_each do |asset|
      asset.original.purge_later
    end
  end
end
