# == Schema Information
#
# Table name: submissions
#
#  id                      :bigint           not null, primary key
#  email                   :string
#  locale                  :string           default("en"), not null
#  permission_confirmed_at :datetime
#  public_code             :string
#  session_token_digest    :string           not null
#  status                  :string           default("draft"), not null
#  submitted_at            :datetime
#  updates_opt_in          :boolean          default(FALSE), not null
#  withdrawn_at            :datetime
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#
# Indexes
#
#  index_submissions_on_public_code            (public_code) UNIQUE
#  index_submissions_on_session_token_digest   (session_token_digest) UNIQUE
#  index_submissions_on_status_and_updated_at  (status,updated_at)
#
class SubmissionSerializer
  include Alba::Resource

  attributes :id, :status, :locale, :public_code, :permission_confirmed_at, :submitted_at, :updates_opt_in

  attribute :email_sent do |submission|
    submission.email.present?
  end

  attribute :people_count, &:people_count
  attribute :ready_to_submit, &:ready_to_submit?

  one :consent, resource: ConsentSerializer
  many :assets, resource: AssetSerializer
end
