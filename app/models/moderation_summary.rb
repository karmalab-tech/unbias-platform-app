module ModerationSummary
  def self.call(now: Time.current)
    since = now.beginning_of_day
    {
      pending: Asset.pending_moderation.count,
      approved_today: Asset.approved.where(moderated_at: since..).count,
      rejected_today: Asset.rejected.where(moderated_at: since..).count
    }
  end
end
