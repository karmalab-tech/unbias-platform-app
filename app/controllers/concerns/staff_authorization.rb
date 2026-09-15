module StaffAuthorization
  extend ActiveSupport::Concern

  private

  def require_staff!
    return if user_signed_in?

    render json: { error: I18n.t("staff.sign_in_required") }, status: :unauthorized
  end

  def require_admin!
    require_staff! and return if performed?
    return if current_user&.admin?

    render json: { error: I18n.t("staff.admin_required") }, status: :forbidden
  end
end
