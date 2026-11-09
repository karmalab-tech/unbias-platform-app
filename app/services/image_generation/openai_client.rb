require "net/http"

module ImageGeneration
  # OpenAI Images API, one image per call. Model and output settings come from config/unbias.yml.
  class OpenaiClient
    ENDPOINT = URI("https://api.openai.com/v1/images/generations")

    def self.configured?
      ENV["OPENAI_API_KEY"].present?
    end

    def initialize(config: Rails.configuration.x.unbias)
      @model = ENV["OPENAI_IMAGE_MODEL"].presence || config.image_generation_model
      @size = config.image_generation_size
      @quality = config.image_generation_quality
      @format = config.image_generation_format
    end

    attr_reader :model

    def generate(prompt:)
      raise Error, "OPENAI_API_KEY is not set" unless self.class.configured?

      response = post(model: @model, prompt: prompt, n: 1, size: @size, quality: @quality, output_format: @format)
      body = JSON.parse(response.body) rescue {}
      unless response.is_a?(Net::HTTPSuccess)
        message = "OpenAI #{response.code}: #{body.dig("error", "message") || response.body.to_s.truncate(300)}"
        raise Transient, message if response.code.to_i == 429 || response.code.to_i >= 500
        raise Error, message
      end

      data = body.dig("data", 0, "b64_json") or raise Error, "OpenAI returned no image"
      Result.new(bytes: Base64.decode64(data), format: @format, model: @model)
    rescue Net::OpenTimeout, Net::ReadTimeout, Errno::ECONNRESET, Errno::ECONNREFUSED, SocketError, OpenSSL::SSL::SSLError => error
      raise Transient, "#{error.class}: #{error.message}"
    end

    private

    def post(payload)
      request = Net::HTTP::Post.new(ENDPOINT, "Content-Type" => "application/json",
                                              "Authorization" => "Bearer #{ENV.fetch("OPENAI_API_KEY")}")
      request.body = payload.to_json
      Net::HTTP.start(ENDPOINT.host, ENDPOINT.port, use_ssl: true, open_timeout: 15, read_timeout: 300) do |http|
        http.request(request)
      end
    end
  end
end
