class UserSerializer
  include Alba::Resource

  attributes :id, :email, :role, :created_at
end
