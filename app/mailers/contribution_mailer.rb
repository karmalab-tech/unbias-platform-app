class ContributionMailer < ApplicationMailer
  def code
    @submission = params[:submission]
    I18n.with_locale(@submission.locale) do
      mail(to: @submission.email, subject: t("contribution_mailer.code.subject", code: @submission.public_code))
    end
  end
end
