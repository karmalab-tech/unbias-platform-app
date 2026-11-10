class AddSourceToExperienceImages < ActiveRecord::Migration[8.0]
  def change
    add_column :experience_images, :source, :string, null: false, default: "generated"
  end
end
