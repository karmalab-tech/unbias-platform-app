module AssetProcessing
  # Per-asset pipeline. Local checks first, then the asset reaches moderation, then VLM enrichment.
  # Every step is recorded as an AssetEnrichment; a failure never hides the contribution.
  class Pipeline
    RETRYABLE = [ Anthropic::Errors::APIConnectionError, Anthropic::Errors::RateLimitError,
                  Anthropic::Errors::InternalServerError ].freeze

    class Retry < StandardError; end

    def initialize(asset)
      @asset = asset
    end

    def call
      return unless @asset.processing? || @asset.pending_moderation?

      @asset.processing_running! if @asset.processing_pending?
      ImageFile.open(@asset.original.blob) do |file|
        local_checks(file)
        release_to_moderation
        vlm_checks(file)
      end
      @asset.update!(processing_state: @asset.enrichments.reload.any?(&:failed?) ? :failed : :done)
    end

    private

    def local_checks(file)
      run(TechnicalCheck::KIND, provider: "vips") { TechnicalCheck.new(@asset, file).call }
      run(DuplicateCheck::KIND, provider: "local") { DuplicateCheck.new(@asset).call }
    end

    def release_to_moderation
      return unless @asset.processing?

      @asset.update!(status: :pending_moderation)
      CoverageStats.bump!
    end

    def vlm_checks(file)
      unless VlmClient.configured?
        [ ContextCaption::KIND, SafetyCheck::KIND ].each { |kind| fail_step(kind, "ANTHROPIC_API_KEY is not set") }
        return
      end

      client = VlmClient.new
      run_vlm(ContextCaption::KIND) { ContextCaption.new(file, client: client).call }
      run_vlm(SafetyCheck::KIND) { SafetyCheck.new(file, client: client).call }
    end

    def run_vlm(kind)
      run(kind, provider: "anthropic") do
        outcome = yield
        { result: outcome[:data], raw_response: outcome[:raw], model: outcome[:model], prompt_version: outcome[:prompt_version] }
      end
    rescue *RETRYABLE => error
      raise Retry, "#{kind}: #{error.class}"
    end

    def run(kind, provider:)
      enrichment = @asset.enrichments.find_or_initialize_by(kind: kind)
      return if enrichment.done?

      outcome = yield
      outcome = { result: outcome } unless outcome.key?(:raw_response) || outcome.key?(:result)
      enrichment.update!(
        status: :done, error: nil, provider: provider,
        result: outcome[:result], raw_response: outcome[:raw_response],
        model: outcome[:model], prompt_version: outcome[:prompt_version]
      )
    rescue *RETRYABLE
      raise
    rescue StandardError => error
      enrichment.update!(status: :failed, provider: provider, error: "#{error.class}: #{error.message}".truncate(500))
    end

    def fail_step(kind, message)
      enrichment = @asset.enrichments.find_or_initialize_by(kind: kind)
      enrichment.update!(status: :failed, provider: "anthropic", error: message) unless enrichment.done?
    end
  end
end
