require "rails_helper"

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
RSpec.describe PersonAnnotation, type: :model do
  let(:asset) { add_asset(start_submission, upload: false) }

  it "validates taxonomy values" do
    annotation = asset.person_annotations.build(person_index: 0, age_bucket: "teen", gender: "woman", body: "medium",
                                                skin_tone_confirmed: 11, disability_tags: [ "glasses", "cape" ])

    expect(annotation).not_to be_valid
    expect(annotation.errors.attribute_names).to contain_exactly(:age_bucket, :skin_tone_confirmed, :disability_tags)
  end

  it "stamps completed_at only once all four required fields are present" do
    annotation = asset.person_annotations.create!(person_index: 0, age_bucket: "75_plus", gender: "man", body: "thin")
    expect(annotation.completed_at).to be_nil
    expect(annotation).not_to be_complete

    annotation.update!(skin_tone_confirmed: 3)
    expect(annotation.completed_at).to be_present
    expect(annotation).to be_complete
  end

  it "keeps the automatic skin tone separate from the confirmed one" do
    annotation = asset.person_annotations.create!(person_index: 0, skin_tone_auto: 7, skin_tone_confirmed: 8)

    expect(annotation.skin_tone_auto).to eq(7)
    expect(annotation.skin_tone_confirmed).to eq(8)
  end
end
