# == Schema Information
#
# Table name: person_annotations
#
#  id                  :bigint           not null, primary key
#  age_bucket          :string
#  body                :string
#  completed_at        :datetime
#  detection_region    :jsonb            not null
#  detection_source    :string           default("manual"), not null
#  disability_tags     :string           default([]), not null, is an Array
#  gender              :string
#  person_index        :integer          not null
#  skin_tone_auto      :integer
#  skin_tone_confirmed :integer
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  asset_id            :bigint           not null
#
# Indexes
#
#  index_person_annotations_on_asset_id                   (asset_id)
#  index_person_annotations_on_asset_id_and_person_index  (asset_id,person_index) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (asset_id => assets.id)
#
class PersonAnnotationSerializer
  include Alba::Resource

  attributes :id, :person_index, :detection_region, :detection_source, :age_bucket, :skin_tone_auto,
             :skin_tone_confirmed, :gender, :body, :disability_tags

  attribute :complete, &:complete?
end
