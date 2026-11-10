namespace :experience do
  desc "Create the bias experience prompts missing from the database, without touching edited wording"
  task seed: :environment do
    ExperiencePrompt.seed!
    puts "#{ExperiencePrompt.in_tree.count} prompts in the tree"
  end

  desc "Overwrite the wording of every prompt with the defaults from ExperienceTree (discards admin edits)"
  task reset_wording: :environment do
    ExperiencePrompt.seed!
    ExperienceTree.selections.each do |selection|
      ExperiencePrompt.find_by!(path: ExperienceTree.path(selection))
                      .update!(prompt: ExperienceTree.prompt(selection), prompt_fr: ExperienceTree.prompt(selection, :fr))
    end
    puts "#{ExperiencePrompt.in_tree.count} prompts reset to the default wording"
  end

  desc "Print every prompt of the bias experience as CSV (path, depth, images, English, French)"
  task prompts: :environment do
    require "csv"
    puts CSV.generate_line(%w[path depth images prompt prompt_fr])
    ExperiencePrompt.in_tree.each do |prompt|
      puts CSV.generate_line([ prompt.path, prompt.depth, ExperiencePrompt.images_per_prompt, prompt.prompt, prompt.prompt_fr ])
    end
  end
end
