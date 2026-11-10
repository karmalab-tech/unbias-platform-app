module ImageGeneration
  class Error < StandardError; end
  # Rate limits, server errors and timeouts: the job retries these with backoff.
  class Transient < Error; end

  Result = Struct.new(:bytes, :format, :model, keyword_init: true)
end
