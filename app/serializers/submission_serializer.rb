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
