module Api
  module Public
    class StatsController < BaseController
      def show
        return unless stale?(etag: CoverageStats.version, public: true)

        stats = CoverageStats.snapshot
        render json: stats.merge(
          needs: PublicCallToAction.active.map { |cta| { id: cta.id, caption: { en: cta.caption(:en), fr: cta.caption(:fr) } } }
        )
      end
    end
  end
end
