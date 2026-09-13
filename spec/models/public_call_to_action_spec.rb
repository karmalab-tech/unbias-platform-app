require "rails_helper"

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
