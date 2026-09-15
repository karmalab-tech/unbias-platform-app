module Api
  class SubmissionsController < ContributorController
    skip_before_action :load_submission, only: :create
    before_action :require_draft, only: [ :update, :consent, :submit ]

    rate_limit to: 30, within: 1.hour, only: :create, with: -> { too_many_requests }

    def create
      submission = Submission.start!(locale: params[:locale].to_s.presence_in(%w[en fr]) || "en")
      render json: SubmissionSerializer.new(submission).serializable_hash.merge(session_token: submission.session_token),
             status: :created
    end

    def show
      render_submission
    end

    def update
      @submission.confirm_permission! if params[:permission_confirmed]
      @submission.update!(locale: params[:locale]) if params[:locale].present?
      render_submission
    end

    def consent
      consent = @submission.consent || @submission.build_consent
      consent.assign_attributes(
        training_allowed: params[:training_allowed] == true,
        public_display_allowed: params[:public_display_allowed] == true,
        consent_version: limits.consent_version,
        accepted_at: Time.current
      )
      consent.save!
      render_submission
    end

    def submit
      unless @submission.ready_to_submit?
        return render json: { error: I18n.t("api.not_ready") }, status: :unprocessable_content
      end

      @submission.submit!
      render_submission
    end

    def email_code
      return render json: { error: I18n.t("api.no_code_yet") }, status: :conflict unless @submission.submitted?

      @submission.update!(email: params.require(:email), updates_opt_in: params[:updates_opt_in] == true)
      ContributionMailer.with(submission: @submission).code.deliver_later
      head :accepted
    end
  end
end
