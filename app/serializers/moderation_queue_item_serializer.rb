class ModerationQueueItemSerializer
  include Alba::Resource

  attributes :id, :status, :submitted_at

  attribute :public_code do |asset|
    asset.submission.public_code
  end

  attribute :people_count do |asset|
    asset.person_annotations.size
  end
end
