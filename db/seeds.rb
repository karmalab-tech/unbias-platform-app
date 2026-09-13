# The first admin. Change the password right after the first sign-in.
admin_email = ENV.fetch("ADMIN_EMAIL", "pierre.de.milly@gmail.com")
admin_password = ENV.fetch("ADMIN_PASSWORD", "unbias-admin")

User.find_or_create_by!(email: admin_email) do |user|
  user.password = admin_password
  user.role = :admin
end
