class ProcessAssetJob < ApplicationJob
  queue_as :default

  # Transient VLM errors re-enqueue the job; the pipeline skips steps that already succeeded.
  retry_on AssetProcessing::Pipeline::Retry, wait: :polynomially_longer, attempts: 6 do |job, error|
    asset = job.arguments.first
    asset.update!(processing_state: :failed)
    Rails.logger.warn("ProcessAssetJob gave up on asset #{asset.id}: #{error.message}")
  end

  def perform(asset)
    AssetProcessing::Pipeline.new(asset).call
  end
end
