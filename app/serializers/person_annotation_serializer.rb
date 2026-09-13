class PersonAnnotationSerializer
  include Alba::Resource

  attributes :id, :person_index, :detection_region, :detection_source, :age_bucket, :skin_tone_auto,
             :skin_tone_confirmed, :gender, :body, :disability_tags

  attribute :complete, &:complete?
end
