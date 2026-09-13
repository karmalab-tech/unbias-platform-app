module AssetProcessing
  # Advisory booleans only: no age, no description, nothing else is stored.
  class SafetyCheck
    KIND = "vlm_safety".freeze
    PROMPT_VERSION = "safety/2026-09-13.1".freeze

    SYSTEM = <<~PROMPT.freeze
      You screen photographs for a public research dataset restricted to consenting adults.
      Answer with three booleans only. possible_minor: any person in the image might be under 18.
      unsafe_content: nudity, sexual content, violence, hate symbols or anything else unsuitable for a
      public research dataset. possible_synthetic: the image looks AI-generated or heavily manipulated.
      When unsure, answer true. Do not describe the image or the people.
    PROMPT

    SCHEMA = {
      type: "object",
      additionalProperties: false,
      required: %w[possible_minor unsafe_content possible_synthetic],
      properties: {
        possible_minor: { type: "boolean" },
        unsafe_content: { type: "boolean" },
        possible_synthetic: { type: "boolean" }
      }
    }.freeze

    def initialize(file, client: VlmClient.new)
      @file = file
      @client = client
    end

    def call
      result = @client.analyze(
        image_bytes: @file.jpeg_bytes(Rails.configuration.x.unbias.vlm_max_side_px),
        system: SYSTEM,
        instruction: "Screen this photograph.",
        schema: SCHEMA,
        max_tokens: 256
      )
      data = result.refused ? { "refused" => true, "unsafe_content" => true } : result.data
      flags = %w[possible_minor unsafe_content possible_synthetic].select { |key| data[key] }
      { data: data.merge("flags" => flags), raw: result.raw, model: @client.model, prompt_version: PROMPT_VERSION }
    end
  end
end
