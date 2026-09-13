module Api
  module Admin
    class ModeratorsController < BaseController
      def index
        render json: User.order(:created_at).map { |user| UserSerializer.new(user).serializable_hash }
      end

      # Creates the account and sends a set-your-password email.
      def create
        user = User.new(email: params.require(:email), role: params.fetch(:role, "moderator"),
                        password: SecureRandom.base58(24))
        user.save!
        user.invite!
        render json: UserSerializer.new(user).serializable_hash, status: :created
      end

      def update
        user = User.find(params[:id])
        return render json: { error: I18n.t("api.own_role") }, status: :unprocessable_content if user == current_user

        user.update!(role: params.require(:role))
        render json: UserSerializer.new(user).serializable_hash
      end

      def destroy
        user = User.find(params[:id])
        return render json: { error: I18n.t("api.own_account") }, status: :unprocessable_content if user == current_user

        user.destroy!
        head :no_content
      end
    end
  end
end
