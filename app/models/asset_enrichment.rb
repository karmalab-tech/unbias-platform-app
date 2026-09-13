class AssetEnrichment < ApplicationRecord
  belongs_to :asset

  KINDS = %w[technical duplicate vlm_context_caption vlm_safety].freeze

  enum :status, { pending: "pending", done: "done", failed: "failed" }, default: :pending

  validates :kind, inclusion: { in: KINDS }, uniqueness: { scope: :asset_id }
end
