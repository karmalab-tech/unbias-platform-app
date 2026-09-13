class ConsentSerializer
  include Alba::Resource

  attributes :training_allowed, :public_display_allowed, :consent_version, :accepted_at
end
