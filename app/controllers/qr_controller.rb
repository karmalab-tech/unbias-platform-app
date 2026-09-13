class QrController < ApplicationController
  # SVG QR code pointing at the contribute flow, for the banner and the installation.
  def show
    url = "#{request.base_url}/contribute"
    svg = RQRCode::QRCode.new(url).as_svg(module_size: 6, color: "17150f", fill: "faf6ef", standalone: true, use_path: true)
    expires_in 1.day, public: true
    render plain: svg, content_type: "image/svg+xml"
  end
end
