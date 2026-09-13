module AssetProcessing
  # Strict vocabulary for automatic context; prose never decides a category.
  module Vocabulary
    SETTING = %w[indoors outdoors home workplace school public_space nature urban transport event studio unknown].freeze
    CONTEXT = %w[everyday social work leisure sport celebration portrait travel unknown].freeze
  end
end
