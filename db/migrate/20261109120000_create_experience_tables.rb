class CreateExperienceTables < ActiveRecord::Migration[8.0]
  def change
    create_table :experience_prompts do |t|
      t.string :path, null: false
      t.string :prompt, null: false
      t.string :prompt_fr, null: false
      t.integer :depth, null: false
      t.integer :position, null: false
      t.boolean :in_tree, null: false, default: true
      t.timestamps
    end
    add_index :experience_prompts, :path, unique: true

    create_table :experience_images do |t|
      t.references :experience_prompt, null: false, foreign_key: true
      t.integer :position, null: false
      t.string :status, null: false, default: "pending"
      t.string :prompt
      t.string :model
      t.integer :attempts, null: false, default: 0
      t.text :error
      t.datetime :generated_at
      t.timestamps
    end
    add_index :experience_images, [ :experience_prompt_id, :position ], unique: true
    add_index :experience_images, :status
  end
end
