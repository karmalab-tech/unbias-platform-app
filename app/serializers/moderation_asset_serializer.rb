class ModerationAssetSerializer
  include Alba::Resource

  attributes :id, :status, :processing_state, :width, :height, :content_type, :byte_size, :submitted_at, :moderated_at

  attribute :image_url do |asset|
    "/api/moderation/assets/#{asset.id}/image"
  end

  attribute :submission do |asset|
    submission = asset.submission
    {
      public_code: submission.public_code,
      submitted_at: submission.submitted_at,
      locale: submission.locale,
      public_display_allowed: submission.consent&.public_display_allowed || false,
      asset_position: submission.assets.index { |a| a.id == asset.id }.to_i + 1,
      asset_count: submission.assets.size
    }
  end

  attribute :flags do |asset|
    ModerationFlags.for(asset)
  end

  attribute :decision do |asset|
    decision = asset.moderation_decisions.last
    decision && { decision: decision.decision, reason: decision.reason, moderator: decision.moderator.email, at: decision.created_at }
  end

  many :person_annotations, key: :people, resource: PersonAnnotationSerializer
  many :enrichments, resource: AssetEnrichmentSerializer
end
