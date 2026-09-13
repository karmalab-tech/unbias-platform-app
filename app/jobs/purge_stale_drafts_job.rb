# Drafts never submitted are personal data we have no consent to keep.
class PurgeStaleDraftsJob < ApplicationJob
  queue_as :default

  def perform
    Submission.stale_drafts.find_each(&:destroy!)
  end
end
