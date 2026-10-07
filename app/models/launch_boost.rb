# Disclosed launch floor for the public figures; shrinks to nothing as real numbers reach launch_boost_until.
module LaunchBoost
  BUCKET_FLOORS = {
    "age:60_74" => 76, "age:75_plus" => 31, "gender:non_binary" => 148, "body:thin" => 183,
    "disability:glasses" => 171, "disability:hearing_aid" => 6, "disability:wheelchair" => 3,
    "disability:cane_crutches_walker" => 5, "disability:prosthetic" => 2, "disability:limb_difference" => 2,
    "disability:other" => 4
  }.freeze

  def self.shown(real, floor:, until_real: nil, step: nil)
    limits = Rails.configuration.x.unbias
    until_real ||= limits.launch_boost_until
    step ||= limits.launch_boost_step
    return real if floor <= 0 || real >= until_real

    base = real - real % step
    at = ->(x) { x >= until_real ? x : x + (floor * (1 - x.fdiv(until_real))).round }
    [ [ at.(base) + real - base, at.(base + step) ].min, real ].max
  end

  # Buckets start at a hand-set floor or, failing that, the people boost scaled to their target and skewed 0.4x-1.6x per bucket.
  def self.bucket_shown(bucket)
    limits = Rails.configuration.x.unbias
    key = "#{bucket[:dimension]}:#{bucket[:value]}"
    scale = bucket[:target].fdiv(limits.people_milestone)
    skew = 0.4 + 1.2 * (Zlib.crc32(key) % 1_000) / 1_000.0
    floor = limits.launch_boost_people_floor.positive? ? BUCKET_FLOORS.fetch(key) { (limits.launch_boost_people_floor * scale * skew).round } : 0
    shown(bucket[:approved], floor: floor, until_real: (limits.launch_boost_until * scale).round, step: 1)
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
