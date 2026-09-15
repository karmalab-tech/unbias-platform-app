module AssetProcessing
  # Thin wrapper around the Anthropic SDK: one image, one system prompt, one JSON schema.
  class VlmClient
    Result = Struct.new(:data, :raw, :refused, keyword_init: true)

    class NotConfigured < StandardError; end

    def self.configured?
      ENV["ANTHROPIC_API_KEY"].present?
    end

    def initialize(model: Rails.configuration.x.unbias.vlm_model)
      raise NotConfigured, "ANTHROPIC_API_KEY is not set" unless self.class.configured?

      @client = Anthropic::Client.new
      @model = model
    end

    attr_reader :model

    def analyze(image_bytes:, media_type: "image/jpeg", system:, instruction:, schema:, max_tokens: 1024)
      message = @client.messages.create(
        model: @model,
        max_tokens: max_tokens,
        system_: system,
        output_config: { effort: :low, format: { type: :json_schema, schema: schema } },
        messages: [ {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: media_type, data: Base64.strict_encode64(image_bytes) } },
            { type: "text", text: instruction }
          ]
        } ]
      )

      raw = message.to_h
      return Result.new(data: nil, raw: raw, refused: true) if message.stop_reason == :refusal

      text = message.content.find { |block| block.type == :text }&.text.to_s
      Result.new(data: JSON.parse(text), raw: raw, refused: false)
    end
  end
end
