# Aggregate approved / pending people counts per bucket. Cached until bump!.
module CoverageStats
  VERSION_KEY = "coverage:version".freeze

  def self.bump!
    Rails.cache.write(VERSION_KEY, SecureRandom.hex(8))
  end

  def self.version
    Rails.cache.fetch(VERSION_KEY) { SecureRandom.hex(8) }
  end

  def self.snapshot
    Rails.cache.fetch("coverage:#{version}", expires_in: 1.hour) { compute }
  end

  def self.compute
    approved = counts_for(Asset.approved)
    pending = counts_for(Asset.counted_as_pending)
    people_approved = PersonAnnotation.joins(:asset).merge(Asset.approved).count
    people_pending = PersonAnnotation.joins(:asset).merge(Asset.counted_as_pending).count

    {
      total: { approved: people_approved, pending: people_pending, target: Rails.configuration.x.unbias.people_milestone },
      images: Asset.counted.count,
      contributions_last_24h: Asset.counted.where(submitted_at: 24.hours.ago..).count,
      buckets: RepresentationBucket.ordered.map do |bucket|
        key = [ bucket.dimension, bucket.value ]
        {
          dimension: bucket.dimension, value: bucket.value, swatch: bucket.swatch,
          approved: approved.fetch(key, 0), pending: pending.fetch(key, 0), target: bucket.target_count
        }
      end,
      updated_at: Time.current.iso8601
    }
  end

  def self.counts_for(assets)
    people = PersonAnnotation.joins(:asset).merge(assets)
    counts = {}
    %w[age skin_tone gender body].each do |dimension|
      column = Representation.column_for(dimension)
      people.where.not(column => nil).group(column).count.each { |value, n| counts[[ dimension, value.to_s ]] = n }
    end
    people.where.not(disability_tags: []).pluck(:disability_tags).flatten.tally.each do |tag, n|
      counts[[ "disability", tag ]] = n
    end
    counts
  end
end
