module Api
  class BaseController < ApplicationController
    before_action :force_json

    rescue_from ActiveRecord::RecordNotFound do
      render json: { error: I18n.t("api.not_found") }, status: :not_found
    end

    rescue_from ActiveRecord::RecordInvalid do |error|
      render json: { errors: error.record.errors.full_messages }, status: :unprocessable_content
    end

    rescue_from ActionController::ParameterMissing do |error|
      render json: { error: error.message }, status: :bad_request
    end

    private

    def force_json
      request.format = :json
    end

    def too_many_requests
      render json: { error: I18n.t("api.too_many_requests") }, status: :too_many_requests
    end

    def limits
      Rails.configuration.x.unbias
    end
  end
end
