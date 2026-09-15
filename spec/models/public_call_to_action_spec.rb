require "rails_helper"

# == Schema Information
#
# Table name: public_call_to_actions
#
#  id            :bigint           not null, primary key
#  active        :boolean          default(TRUE), not null
#  caption_en    :string           not null
#  caption_fr    :string
#  display_order :integer          default(0), not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
RSpec.describe PublicCallToAction, type: :model do
  it "allows at most three active calls to action" do
    3.times { |i| PublicCallToAction.create!(caption_en: "Need #{i}", display_order: i) }
    fourth = PublicCallToAction.new(caption_en: "One too many")

    expect(fourth).not_to be_valid
    expect(PublicCallToAction.new(caption_en: "Inactive is fine", active: false)).to be_valid
  end

  it "falls back to English when no French caption exists" do
    cta = PublicCallToAction.new(caption_en: "More people aged 75+", caption_fr: nil)

    expect(cta.caption(:fr)).to eq("More people aged 75+")
    cta.caption_fr = "Plus de personnes de 75 ans et plus"
    expect(cta.caption(:fr)).to eq("Plus de personnes de 75 ans et plus")
  end
end
