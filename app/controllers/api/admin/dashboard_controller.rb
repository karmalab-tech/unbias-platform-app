module Api
  module Admin
    class DashboardController < BaseController
      def show
        render json: {
          coverage: CoverageStats.compute,
          assets_by_status: Asset.where.not(status: :draft).group(:status).count,
          submissions: { submitted: Submission.submitted.count, drafts: Submission.draft.count, withdrawn: Submission.withdrawn.count },
          moderation: ModerationSummary.call
        }
      end
    end
  end
end
