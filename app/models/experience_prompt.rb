# One node of ExperienceTree, generated `experience_images_per_prompt` times.
class ExperiencePrompt < ApplicationRecord
  has_many :images, -> { order(:position) }, class_name: "ExperienceImage", dependent: :destroy

  scope :in_tree, -> { where(in_tree: true).order(:position) }

  # Mirrors the tree: creates new nodes, updates wording, and leaves removed nodes (and their images) out of the tree.
  def self.sync!
    paths = ExperienceTree.selections.each_with_index.map do |selection, index|
      path = ExperienceTree.path(selection)
      record = find_or_initialize_by(path: path)
      record.update!(prompt: ExperienceTree.prompt(selection), depth: selection.length, position: index, in_tree: true)
      path
    end
    where.not(path: paths).update_all(in_tree: false)
  end

  # The tree the public page plays: every node with its wording and the display URL of each finished image.
  def self.public_tree
    records = includes(images: { file_attachment: { blob: { variant_records: { image_attachment: :blob } } } })
                .where(path: ExperienceTree.selections.map { |selection| ExperienceTree.path(selection) })
                .index_by(&:path)
    {
      images_per_prompt: images_per_prompt,
      steps: ExperienceTree::STEPS.pluck(:key),
      prompts: ExperienceTree.selections.map do |selection|
        path = ExperienceTree.path(selection)
        {
          path: path,
          parent: selection.empty? ? nil : ExperienceTree.path(selection[0...-1]),
          step: ExperienceTree.step_key(selection),
          segments: { en: ExperienceTree.segments(selection, :en), fr: ExperienceTree.segments(selection, :fr) },
          images: records[path]&.display_paths || Array.new(images_per_prompt)
        }
      end
    }
  end

  def self.public_tree_version
    [ ExperienceImage.succeeded.count, ExperienceImage.maximum(:updated_at)&.to_f, images_per_prompt ].join("-")
  end

  def display_paths
    by_position = images.select(&:succeeded?).index_by(&:position)
    (1..self.class.images_per_prompt).map { |position| by_position[position]&.display_path }
  end

  def self.images_per_prompt
    Rails.configuration.x.unbias.experience_images_per_prompt
  end

  # Queues one job per image that is missing or failed; finished and running ones are left alone.
  def generate!
    transaction do
      (1..self.class.images_per_prompt).each { |position| images.find_or_create_by!(position: position) }
    end
    images.where(status: %w[pending failed]).find_each do |image|
      image.update!(status: :queued, error: nil)
      GenerateExperienceImageJob.perform_later(image)
    end
  end
end
