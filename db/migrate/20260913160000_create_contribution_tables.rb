class CreateContributionTables < ActiveRecord::Migration[8.0]
  def change
    create_table :submissions do |t|
      t.string :public_code
      t.string :session_token_digest, null: false
      t.string :status, null: false, default: "draft"
      t.string :locale, null: false, default: "en"
      t.datetime :permission_confirmed_at
      t.string :email
      t.boolean :updates_opt_in, null: false, default: false
      t.datetime :submitted_at
      t.datetime :withdrawn_at
      t.timestamps
    end
    add_index :submissions, :public_code, unique: true
    add_index :submissions, :session_token_digest, unique: true
    add_index :submissions, [ :status, :updated_at ]

    create_table :consents do |t|
      t.references :submission, null: false, foreign_key: true, index: { unique: true }
      t.boolean :training_allowed, null: false, default: false
      t.boolean :public_display_allowed, null: false, default: false
      t.string :consent_version, null: false
      t.datetime :accepted_at, null: false
      t.datetime :withdrawn_at
      t.timestamps
    end

    create_table :assets do |t|
      t.references :submission, null: false, foreign_key: true
      t.integer :position, null: false, default: 0
      t.string :status, null: false, default: "draft"
      t.string :processing_state, null: false, default: "pending"
      t.integer :width
      t.integer :height
      t.string :content_type
      t.bigint :byte_size
      t.string :sha256
      t.string :phash
      t.boolean :people_confirmed, null: false, default: false
      t.datetime :submitted_at
      t.datetime :moderated_at
      t.timestamps
    end
    add_index :assets, [ :status, :submitted_at ]
    add_index :assets, :sha256
    add_index :assets, :phash

    create_table :person_annotations do |t|
      t.references :asset, null: false, foreign_key: true
      t.integer :person_index, null: false
      t.jsonb :detection_region, null: false, default: {}
      t.string :detection_source, null: false, default: "manual"
      t.string :age_bucket
      t.integer :skin_tone_auto
      t.integer :skin_tone_confirmed
      t.string :gender
      t.string :body
      t.string :disability_tags, array: true, null: false, default: []
      t.datetime :completed_at
      t.timestamps
    end
    add_index :person_annotations, [ :asset_id, :person_index ], unique: true

    create_table :asset_enrichments do |t|
      t.references :asset, null: false, foreign_key: true
      t.string :kind, null: false
      t.string :status, null: false, default: "pending"
      t.jsonb :result, null: false, default: {}
      t.float :confidence
      t.string :provider
      t.string :model
      t.string :model_version
      t.string :prompt_version
      t.jsonb :raw_response
      t.text :error
      t.timestamps
    end
    add_index :asset_enrichments, [ :asset_id, :kind ], unique: true

    create_table :moderation_decisions do |t|
      t.references :asset, null: false, foreign_key: true
      t.references :moderator, null: false, foreign_key: { to_table: :users }
      t.string :decision, null: false
      t.string :reason
      t.timestamps
    end

    create_table :representation_buckets do |t|
      t.string :dimension, null: false
      t.string :value, null: false
      t.integer :display_order, null: false, default: 0
      t.integer :target_count, null: false, default: 0
      t.string :swatch
      t.timestamps
    end
    add_index :representation_buckets, [ :dimension, :value ], unique: true

    create_table :public_call_to_actions do |t|
      t.string :caption_en, null: false
      t.string :caption_fr
      t.boolean :active, null: false, default: true
      t.integer :display_order, null: false, default: 0
      t.timestamps
    end
  end
end
