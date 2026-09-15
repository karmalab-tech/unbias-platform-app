# == Schema Information
#
# Table name: assets
#
#  id               :bigint           not null, primary key
#  byte_size        :bigint
#  content_type     :string
#  height           :integer
#  moderated_at     :datetime
#  people_confirmed :boolean          default(FALSE), not null
#  phash            :string
#  position         :integer          default(0), not null
#  processing_state :string           default("pending"), not null
#  sha256           :string
#  status           :string           default("draft"), not null
#  submitted_at     :datetime
#  width            :integer
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  submission_id    :bigint           not null
#
# Indexes
#
#  index_assets_on_phash                    (phash)
#  index_assets_on_sha256                   (sha256)
#  index_assets_on_status_and_submitted_at  (status,submitted_at)
#  index_assets_on_submission_id            (submission_id)
#
# Foreign Keys
#
#  fk_rails_...  (submission_id => submissions.id)
#
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
