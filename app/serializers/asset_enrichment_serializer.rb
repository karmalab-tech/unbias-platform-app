class AssetEnrichmentSerializer
  include Alba::Resource

  attributes :kind, :status, :result, :confidence, :provider, :model, :model_version, :prompt_version, :error, :updated_at
end
