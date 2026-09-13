class AssetSerializer
  include Alba::Resource

  attributes :id, :position, :status, :width, :height, :content_type, :byte_size, :people_confirmed

  attribute :filename do |asset|
    asset.original.attached? ? asset.original.filename.to_s : nil
  end

  attribute :image_url do |asset|
    asset.original.attached? ? "/api/submissions/current/assets/#{asset.id}/image" : nil
  end

  attribute :complete, &:annotation_complete?

  many :person_annotations, key: :people, resource: PersonAnnotationSerializer
end
