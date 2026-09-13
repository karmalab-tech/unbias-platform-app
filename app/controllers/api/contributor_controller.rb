module Api
  # Contributors have no account: the submission is identified by the token handed out at creation.
  class ContributorController < BaseController
    TOKEN_HEADER = "X-Submission-Token".freeze

    before_action :load_submission

    private

    def load_submission
      # Image tags cannot send headers, so the image endpoint also accepts the token as a query param.
      token = request.headers[TOKEN_HEADER].presence || (action_name == "image" ? params[:token] : nil)
      @submission = Submission.find_by_session_token(token)
      raise ActiveRecord::RecordNotFound if @submission.nil? || @submission.withdrawn?
    end

    def require_draft
      return if @submission.draft?

      render json: { error: I18n.t("api.already_submitted") }, status: :conflict
    end

    def render_submission(status: :ok)
      render json: SubmissionSerializer.new(@submission.reload).serializable_hash, status: status
    end
  end
end
