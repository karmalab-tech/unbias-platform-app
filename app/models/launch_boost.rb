# Disclosed launch floor for the public figures; shrinks to nothing as real numbers reach launch_boost_until.
module LaunchBoost
  def self.shown(real, floor:, until_real: nil, step: nil)
    limits = Rails.configuration.x.unbias
    until_real ||= limits.launch_boost_until
    step ||= limits.launch_boost_step
    return real if floor <= 0 || real >= until_real

    base = real - real % step
    at = ->(x) { x >= until_real ? x : x + (floor * (1 - x.fdiv(until_real))).round }
    [ [ at.(base) + real - base, at.(base + step) ].min, real ].max
  end

  # Buckets get the headline people boost scaled to their own target, so every bar ramps like the total.
  def self.bucket_shown(bucket)
    limits = Rails.configuration.x.unbias
    scale = bucket[:target].fdiv(limits.people_milestone)
    shown(bucket[:approved], floor: (limits.launch_boost_people_floor * scale).round,
          until_real: (limits.launch_boost_until * scale).round, step: 1)
  end

  def self.apply(stats)
    limits = Rails.configuration.x.unbias
    photos = shown(stats[:images], floor: limits.launch_boost_photos_floor)
    people = shown(stats[:total][:approved], floor: limits.launch_boost_people_floor)
    added_photos = photos - stats[:images]
    added_people = people - stats[:total][:approved]
    buckets = stats[:buckets].map { |bucket| bucket.merge(approved: bucket_shown(bucket)) }

    stats.merge(
      images: photos,
      total: stats[:total].merge(approved: people),
      buckets: buckets,
      launch_boost: {
        active: added_photos.positive? || added_people.positive?,
        until: limits.launch_boost_until,
        photos: { real: stats[:images], added: added_photos, shown: photos },
        people_approved: { real: stats[:total][:approved], added: added_people, shown: people }
      }
    )
  end
end
