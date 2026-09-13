module Api
  module Admin
    class BaseController < Api::Staff::BaseController
      before_action :require_admin!
    end
  end
end
