# Prompt tree of the bias experience: each step adds one detail to "Create a photo of a person."
# Images are generated from the English prompt; the French wording is only what French visitors read.
module ExperienceTree
  ROOT = "person".freeze

  STEPS = [
    { key: "gender", dimension: "gender", options: %w[woman man non_binary] },
    { key: "age", dimension: "age", options: %w[young middle_aged old] },
    { key: "origin", dimension: "skin_tone", options: %w[black east_asian south_asian white] },
    { key: "body", dimension: "body", options: %w[thin plus_size] }
  ].freeze

  EN = {
    "gender" => { "woman" => "woman", "man" => "man", "non_binary" => "non-binary person" },
    "age" => { "young" => "young", "middle_aged" => "middle-aged", "old" => "old" },
    "origin" => { "black" => "Black", "east_asian" => "East Asian", "south_asian" => "South Asian", "white" => "white" },
    "body" => { "thin" => "who is thin", "plus_size" => "who is plus-size" }
  }.freeze

  FR_FEMININE = { "woman" => true, "man" => false, "non_binary" => true }.freeze

  FR = {
    "gender" => { "woman" => "femme", "man" => "homme", "non_binary" => "personne non binaire" },
    "origin" => { "black" => %w[noire noir], "east_asian" => %w[est-asiatique est-asiatique],
                  "south_asian" => %w[sud-asiatique sud-asiatique], "white" => %w[blanche blanc] },
    "old" => %w[âgée âgé],
    "body" => { "thin" => %w[mince mince], "plus_size" => [ "de forte corpulence", "de forte corpulence" ] }
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

  def step_key(selection)
    selection.empty? ? nil : STEPS[selection.length - 1][:key]
  end

  def prompt(selection)
    segments(selection, "en").pluck(:text).join
  end

  # The prompt in pieces; `step` marks the words a step added so the page can highlight them.
  def segments(selection, locale)
    pick = selection.each_with_index.to_h { |option, index| [ STEPS[index][:key], option ] }
    locale.to_s == "fr" ? french(pick) : english(pick)
  end

  def english(pick)
    words = []
    words << { text: EN["age"][pick["age"]], step: "age" } if pick["age"]
    words << { text: EN["origin"][pick["origin"]], step: "origin" } if pick["origin"]
    words << (pick["gender"] ? { text: EN["gender"][pick["gender"]], step: "gender" } : { text: "person" })
    article = words.first[:text].match?(/\A[aeiou]/i) ? "an" : "a"
    segments = [ { text: "Create a photo of #{article}" } ]
    words.each { |word| segments.push({ text: " " }, word) }
    segments.push({ text: " " }, { text: EN["body"][pick["body"]], step: "body" }) if pick["body"]
    segments << { text: "." }
  end

  def french(pick)
    feminine = pick["gender"] ? FR_FEMININE[pick["gender"]] : true
    form = feminine ? 0 : 1
    segments = [ { text: "Crée une photo d’#{feminine ? "une" : "un"} " } ]
    segments.push({ text: "jeune", step: "age" }, { text: " " }) if pick["age"] == "young"
    segments << (pick["gender"] ? { text: FR["gender"][pick["gender"]], step: "gender" } : { text: "personne" })
    segments.push({ text: " " }, { text: FR["origin"][pick["origin"]][form], step: "origin" }) if pick["origin"]
    segments.push({ text: " " }, { text: "d’âge mûr", step: "age" }) if pick["age"] == "middle_aged"
    segments.push({ text: " " }, { text: FR["old"][form], step: "age" }) if pick["age"] == "old"
    segments.push({ text: " " }, { text: FR["body"][pick["body"]][form], step: "body" }) if pick["body"]
    segments << { text: "." }
  end
end
