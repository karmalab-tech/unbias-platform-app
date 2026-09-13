class User < ApplicationRecord
  devise :database_authenticatable, :recoverable, :rememberable, :validatable

  enum :role, { moderator: "moderator", admin: "admin" }, default: :moderator

  def invite!
    send_reset_password_instructions
  end
end
