# Prompt tree of the bias experience: each step adds one detail to "Create a photo of a person."
# Gender comes last, after the profession, to see whether naming it pulls the model away from its default split.
# Holds the default wording that ExperiencePrompt.seed! writes once; admins edit the stored wording afterwards.
module ExperienceTree
  ROOT = "person".freeze

  STEPS = [
    { key: "age", dimension: "age", options: %w[young middle_aged old] },
    { key: "origin", dimension: "skin_tone", options: %w[black asian arab white] },
    { key: "profession", dimension: nil, options: %w[doctor teacher parent] },
    { key: "gender", dimension: "gender", options: %w[female male] }
  ].freeze

  EN = {
    "age" => { "young" => "young", "middle_aged" => "middle-aged", "old" => "old" },
    "origin" => { "black" => "Black", "asian" => "Asian", "arab" => "Arab", "white" => "white" },
    "profession" => { "doctor" => "doctor", "teacher" => "teacher", "parent" => "parent" },
    "gendered" => {
      "female" => { "doctor" => "female doctor", "teacher" => "female teacher", "parent" => "mother" },
      "male" => { "doctor" => "male doctor", "teacher" => "male teacher", "parent" => "father" }
    }
  }.freeze

  # French forms by grammatical gender: "personne" is feminine, a bare profession uses inclusive spelling (un·e médecin
  # noir·e), and the gender step writes the gendered noun.
  FR = {
    "article" => { person: "une", inclusive: "un·e", female: "une", male: "un" },
    "origin" => {
      "black" => { person: "noire", inclusive: "noir·e", female: "noire", male: "noir" },
      "asian" => { person: "asiatique", inclusive: "asiatique", female: "asiatique", male: "asiatique" },
      "arab" => { person: "arabe", inclusive: "arabe", female: "arabe", male: "arabe" },
      "white" => { person: "blanche", inclusive: "blanc·he", female: "blanche", male: "blanc" }
    },
    "old" => { person: "âgée", inclusive: "âgé·e", female: "âgée", male: "âgé" },
    "noun" => {
      person: Hash.new("personne"),
      inclusive: { "doctor" => "médecin", "teacher" => "enseignant·e", "parent" => "parent" },
      female: { "doctor" => "femme médecin", "teacher" => "femme enseignante", "parent" => "mère" },
      male: { "doctor" => "homme médecin", "teacher" => "homme enseignant", "parent" => "père" }
    }
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

  TOKEN = /\s+|[\p{L}\p{N}\-·]+|[^\s\p{L}\p{N}\-·]/

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

  # Compares French words regardless of agreement (noire, noir·e, noir), so only the new words are highlighted.
  def comparable(token)
    word = token.downcase.delete("·")
    word = SAME_WORD.fetch(word, word)
    word.length > 3 ? word.sub(/che\z/, "c").sub(/e\z/, "") : word
  end

  # Longest common subsequence over tokens; whatever the child does not share with the parent is added.
  def added_flags(tokens, parent)
    tokens = tokens.map { |token| comparable(token) }
    parent = parent.map { |token| comparable(token) }
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
    noun =
      if pick["gender"]
        EN["gendered"][pick["gender"]][pick["profession"]]
      elsif pick["profession"]
        EN["profession"][pick["profession"]]
      else
        "person"
      end
    words = [ EN["age"][pick["age"]], EN["origin"][pick["origin"]], noun ].compact
    article = words.first.match?(/\A[aeiou]/i) ? "an" : "a"
    [ { text: "Create a photo of #{article} #{words.join(" ")}." } ]
  end

  def french(pick)
    form = pick["gender"]&.to_sym || (pick["profession"] ? :inclusive : :person)
    words = [ "Crée une photo d’#{FR["article"][form]}" ]
    words << "jeune" if pick["age"] == "young"
    words << FR["noun"][form][pick["profession"]]
    words << FR["origin"][pick["origin"]][form] if pick["origin"]
    words << "d’âge moyen" if pick["age"] == "middle_aged"
    words << FR["old"][form] if pick["age"] == "old"
    [ { text: "#{words.join(" ")}." } ]
  end
end
