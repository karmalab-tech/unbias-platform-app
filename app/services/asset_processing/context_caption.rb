module AssetProcessing
  class ContextCaption
    KIND = "vlm_context_caption".freeze
    PROMPT_VERSION = "context-caption/2026-09-13.1".freeze

    SYSTEM = <<~PROMPT.freeze
      You describe photographs for a research dataset about representation in generative AI.
      Describe only non-sensitive visual content: clothing, pose, visible action, setting, framing,
      objects and lighting. Refer to people only as "a person" or "people". Never infer or mention
      gender, age, skin tone, ethnicity, race, religion, nationality, relationships, profession,
      wealth, class, health, personality or any other identity attribute, even when it seems obvious.
      Choose setting and context labels only from the allowed lists. Keep the description under
      60 words and the caption under 20 words. Write in English.
    PROMPT

    SCHEMA = {
      type: "object",
      additionalProperties: false,
      required: %w[setting context description caption],
      properties: {
        setting: { type: "array", minItems: 1, maxItems: 2, items: { type: "string", enum: Vocabulary::SETTING } },
        context: { type: "array", minItems: 1, maxItems: 2, items: { type: "string", enum: Vocabulary::CONTEXT } },
        description: { type: "string", maxLength: 500 },
        caption: { type: "string", maxLength: 200 }
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
        instruction: "Classify the setting and context, then describe the scene neutrally and write a caption.",
        schema: SCHEMA
      )
      data = result.refused ? { "refused" => true } : result.data
      { data: data, raw: result.raw, model: @client.model, prompt_version: PROMPT_VERSION }
    end
  end
end
