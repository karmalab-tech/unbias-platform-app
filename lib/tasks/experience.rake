namespace :experience do
  desc "Print every prompt of the bias experience as CSV (path, depth, images, English, French)"
  task prompts: :environment do
    require "csv"
    puts CSV.generate_line(%w[path depth images prompt prompt_fr])
    ExperienceTree.selections.each do |selection|
      puts CSV.generate_line([ ExperienceTree.path(selection), selection.length, ExperiencePrompt.images_per_prompt,
                               ExperienceTree.prompt(selection), ExperienceTree.segments(selection, :fr).pluck(:text).join ])
    end
  end
end
