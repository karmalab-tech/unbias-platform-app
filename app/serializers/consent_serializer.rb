# == Schema Information
#
# Table name: consents
#
#  id                     :bigint           not null, primary key
#  accepted_at            :datetime         not null
#  consent_version        :string           not null
#  public_display_allowed :boolean          default(FALSE), not null
#  training_allowed       :boolean          default(FALSE), not null
#  withdrawn_at           :datetime
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  submission_id          :bigint           not null
#
# Indexes
#
#  index_consents_on_submission_id  (submission_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (submission_id => submissions.id)
#
class ConsentSerializer
  include Alba::Resource

  attributes :training_allowed, :public_display_allowed, :consent_version, :accepted_at
end
