# Prompt tree of the bias experience: each step adds one detail to "Create a photo of a person."
# No gender step: the model picks one per image, so each prompt's split of men and women shows its own bias.
# Holds the default wording that ExperiencePrompt.seed! writes once; admins edit the stored wording afterwards.
module ExperienceTree
  ROOT = "person".freeze

  STEPS = [
    { key: "age", dimension: "age", options: %w[young middle_aged old] },
    { key: "origin", dimension: "skin_tone", options: %w[black asian arab white] }
  ].freeze

  EN = {
    "age" => { "young" => "young", "middle_aged" => "middle-aged", "old" => "old" },
    "origin" => { "black" => "Black", "asian" => "Asian", "arab" => "Arab", "white" => "white" }
  }.freeze

  # Agrees with "personne", which is feminine.
  FR = {
    "origin" => { "black" => "noire", "asian" => "asiatique", "arab" => "arabe", "white" => "blanche" },
    "old" => "âgée"
  }.freeze

  module_function

  # Every selection (list of chosen options, one per step) depth first, root first.
  def selections(selection = [])
    [ selection ] + children(selection).flat_map { |child| selections(child) }
  end

  def children(selection)
    step = STEPS[selection.length]
    step ? step[:options].map { |option| selection + [ option ] } : []
  end

  def path(selection)
    [ ROOT, *selection ].join("/")
  end

  def prompt(selection, locale = :en)
    pick = selection.each_with_index.to_h { |option, index| [ STEPS[index][:key], option ] }
    (locale.to_s == "fr" ? french(pick) : english(pick)).pluck(:text).join
  end

  TOKEN = /\s+|[\p{L}\p{N}\-]+|[^\s\p{L}\p{N}\-]/

  # Splits `text` into plain and `added: true` segments: the words that are not in the parent prompt.
  def highlight(text, parent_text)
    tokens = text.scan(TOKEN)
    return [ { text: text } ] if parent_text.nil?

    added = added_flags(tokens, parent_text.scan(TOKEN))
    tokens.each_index do |index|
      next unless tokens[index].match?(/\A\s+\z/)
      added[index] = index.positive? && added[index - 1] && added[index + 1]
    end
    tokens.zip(added).chunk_while { |a, b| a[1] == b[1] }.map do |run|
      run.first[1] ? { text: run.map(&:first).join, added: true } : { text: run.map(&:first).join }
    end
  end

  # Articles that only change form with the next word ("a old" → "an old") don't count as added.
  SAME_WORD = { "an" => "a", "une" => "un" }.freeze

  # Longest common subsequence over tokens; whatever the child does not share with the parent is added.
  def added_flags(tokens, parent)
    tokens = tokens.map { |token| SAME_WORD.fetch(token.downcase, token) }
    parent = parent.map { |token| SAME_WORD.fetch(token.downcase, token) }
    table = Array.new(tokens.size + 1) { Array.new(parent.size + 1, 0) }
    tokens.each_index.reverse_each do |i|
      parent.each_index.reverse_each do |j|
        table[i][j] = tokens[i] == parent[j] ? table[i + 1][j + 1] + 1 : [ table[i + 1][j], table[i][j + 1] ].max
      end
    end
    flags = Array.new(tokens.size, true)
    i = j = 0
    while i < tokens.size && j < parent.size
      if tokens[i] == parent[j]
        flags[i] = false
        i += 1
        j += 1
      elsif table[i + 1][j] >= table[i][j + 1]
        i += 1
      else
        j += 1
      end
    end
    flags
  end

  def english(pick)
    words = []
    words << { text: EN["age"][pick["age"]] } if pick["age"]
    words << { text: EN["origin"][pick["origin"]] } if pick["origin"]
    words << { text: "person" }
    article = words.first[:text].match?(/\A[aeiou]/i) ? "an" : "a"
    segments = [ { text: "Create a photo of #{article}" } ]
    words.each { |word| segments.push({ text: " " }, word) }
    segments << { text: "." }
  end

  def french(pick)
    segments = [ { text: "Crée une photo d’une " } ]
    segments.push({ text: "jeune" }, { text: " " }) if pick["age"] == "young"
    segments << { text: "personne" }
    segments.push({ text: " " }, { text: FR["origin"][pick["origin"]] }) if pick["origin"]
    segments.push({ text: " " }, { text: "d’âge moyen" }) if pick["age"] == "middle_aged"
    segments.push({ text: " " }, { text: FR["old"] }) if pick["age"] == "old"
    segments << { text: "." }
  end
end
