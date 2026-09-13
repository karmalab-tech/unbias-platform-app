# == Schema Information
#
# Table name: asset_enrichments
#
#  id             :bigint           not null, primary key
#  confidence     :float
#  error          :text
#  kind           :string           not null
#  model          :string
#  model_version  :string
#  prompt_version :string
#  provider       :string
#  raw_response   :jsonb
#  result         :jsonb            not null
#  status         :string           default("pending"), not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  asset_id       :bigint           not null
#
# Indexes
#
#  index_asset_enrichments_on_asset_id           (asset_id)
#  index_asset_enrichments_on_asset_id_and_kind  (asset_id,kind) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (asset_id => assets.id)
#
class AssetEnrichment < ApplicationRecord
  belongs_to :asset

  KINDS = %w[technical duplicate vlm_context_caption vlm_safety].freeze

  enum :status, { pending: "pending", done: "done", failed: "failed" }, default: :pending

  validates :kind, inclusion: { in: KINDS }, uniqueness: { scope: :asset_id }
end
