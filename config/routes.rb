Rails.application.routes.draw do
  # Staff only: no public registration. Accounts are created by admins.
  devise_for :users, skip: [ :registrations ], controllers: {
    sessions: "users/sessions",
    passwords: "users/passwords"
  }

  # Server-side password gate (see SitePasswordProtection). No-op unless the
  # PASSWORD env var is set.
  get "unlock", to: "gate#new"
  post "unlock", to: "gate#create"

  # Returns the authenticated user (or { user: nil }) for the React frontend.
  get "current_user", to: "current_user#show"

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :public do
      resource :settings, only: :show
      resource :stats, only: :show
    end

    resources :submissions, only: :create
    resource :submission, path: "submissions/current", only: [ :show, :update ] do
      post :consent
      post :submit
      post :email_code
      resources :assets, only: [ :create, :destroy ] do
        member do
          put :people
          get :image
        end
      end
    end
    resources :direct_uploads, only: :create

    namespace :admin do
      resource :dashboard, only: :show, controller: :dashboard
      resources :calls_to_action, only: [ :index, :create, :update, :destroy ]
      resources :buckets, only: [ :index, :update ]
      resources :moderators, only: [ :index, :create, :update, :destroy ]
      get "submissions/lookup", to: "submissions#lookup"
      post "submissions/:id/withdraw", to: "submissions#withdraw"
      post "assets/:id/withdraw", to: "submissions#withdraw_asset"
    end

    namespace :moderation do
      resource :queue, only: :show, controller: :queue
      resources :assets, only: :show do
        member do
          post :approve
          post :reject
          get :image
        end
      end
    end
  end

  get "qr.svg", to: "qr#show"

  root "app#index"

  # Any other HTML GET request is handed to the React SPA so client-side
  # routing can take over.
  get "*path", to: "app#index", constraints: ->(request) {
    request.format.html? &&
      !request.path.start_with?("/rails", "/users")
  }
end
