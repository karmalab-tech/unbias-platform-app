require "vips"

module AssetProcessing
  # Downloads the original once and exposes what every check needs from it.
  class ImageFile
    LAPLACIAN = [ [ 0, 1, 0 ], [ 1, -4, 1 ], [ 0, 1, 0 ] ].freeze

    attr_reader :path

    def self.open(blob)
      blob.open do |file|
        yield new(file.path, blob.content_type)
      end
    end

    def initialize(path, content_type)
      @path = path
      @content_type = content_type
    end

    def image
      @image ||= Vips::Image.new_from_file(path).autorot
    end

    def width = image.width
    def height = image.height
    def byte_size = File.size(path)

    def sha256
      @sha256 ||= Digest::SHA256.file(path).hexdigest
    end

    # 64-bit difference hash: gradient direction between neighbouring pixels of a 9x8 greyscale.
    def phash
      @phash ||= begin
        small = grey.thumbnail_image(9, height: 8, size: :force)
        rows = small.to_a.map { |row| row.map { |px| px.is_a?(Array) ? px.first : px } }
        bits = rows.flat_map { |row| row.each_cons(2).map { |a, b| a < b ? 1 : 0 } }
        bits.join.to_i(2).to_s(16).rjust(16, "0")
      end
    end

    # Variance of the Laplacian on a 512px greyscale: low values mean blur or flat images.
    def sharpness
      @sharpness ||= begin
        scale = [ 512.0 / [ width, height ].max, 1.0 ].min
        lap = grey.resize(scale).conv(Vips::Image.new_from_array(LAPLACIAN))
        (lap.deviate**2).round(2)
      end
    end

    def jpeg_bytes(max_side)
      Vips::Image.thumbnail(path, max_side, height: max_side, size: :down).jpegsave_buffer(Q: 85, strip: true)
    end

    def self.hamming(a, b)
      (a.to_i(16) ^ b.to_i(16)).to_s(2).count("1")
    end

    private

    def grey
      @grey ||= image.colourspace(:b_w)
    end
  end
end
