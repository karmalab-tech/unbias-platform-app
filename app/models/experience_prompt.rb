# One node of the experience tree: its English prompt (sent to the image model), its French wording, and its images.
class ExperiencePrompt < ApplicationRecord
  has_many :images, -> { order(:position) }, class_name: "ExperienceImage", dependent: :destroy

  validates :prompt, :prompt_fr, presence: true

  scope :in_tree, -> { where(in_tree: true).order(:position) }

  # Creates the nodes missing from the tree with the default wording and never touches wording already stored,
  # so admin edits survive. Nodes no longer in ExperienceTree stay in the table, out of the tree.
  def self.seed!
    paths = ExperienceTree.selections.each_with_index.map do |selection, index|
      record = find_or_initialize_by(path: ExperienceTree.path(selection))
      record.prompt ||= ExperienceTree.prompt(selection)
      record.prompt_fr ||= ExperienceTree.prompt(selection, :fr)
      record.update!(depth: selection.length, position: index, in_tree: true)
      record.path
    end
    where.not(path: paths).update_all(in_tree: false)
  end

  def self.images_per_prompt
    Rails.configuration.x.unbias.experience_images_per_prompt
  end

  # The tree the public page plays: wording split into plain and added words, and each finished image.
  def self.public_tree
    prompts = in_tree.includes(images: { file_attachment: { blob: { variant_records: { image_attachment: :blob } } } }).to_a
    by_path = prompts.index_by(&:path)
    {
      images_per_prompt: images_per_prompt,
      prompts: prompts.map do |record|
        parent = by_path[record.parent_path]
        {
          path: record.path,
          parent: parent&.path,
          segments: {
            en: ExperienceTree.highlight(record.prompt, parent&.prompt),
            fr: ExperienceTree.highlight(record.prompt_fr, parent&.prompt_fr)
          },
          images: record.display_paths
        }
      end
    }
  end

  def self.public_tree_version
    [ in_tree.count, maximum(:updated_at)&.to_f, ExperienceImage.maximum(:updated_at)&.to_f, images_per_prompt ].join("-")
  end

  def parent_path
    path.include?("/") ? path.rpartition("/").first : nil
  end

  def display_paths
    current = images.select { |image| image.succeeded? && image.prompt == prompt }.index_by(&:position)
    (1..self.class.images_per_prompt).map { |position| current[position]&.display_path }
  end

  # Queues one job per image that is missing, failed or made from an older English prompt.
  def generate!
    transaction do
      (1..self.class.images_per_prompt).each { |position| images.find_or_create_by!(position: position) }
    end
    images.where(status: %w[pending failed]).or(images.succeeded.where.not(prompt: prompt)).find_each do |image|
      image.update!(status: :queued, error: nil)
      GenerateExperienceImageJob.perform_later(image)
    end
  end
end
