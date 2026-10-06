export enum ImageFit {
  CONTAIN = 'contain',
  COVER = 'cover',
  FILL = 'fill',
  INSIDE = 'inside',
  OUTSIDE = 'outside'
}

export enum ImageFormat {
  JPEG = 'jpeg',
  PNG = 'png',
  WEBP = 'webp',
  TIFF = 'tiff',
  GIF = 'gif'
}

export interface ImageVariantRequest {
  uploadUrl: string
  width?: number
  height?: number
  withoutEnlargement?: boolean
  withoutReduction?: boolean
  fit: ImageFit
  format: ImageFormat
}

export interface ImageResizeRequest {
  downloadUrl: string
  variants: ImageVariantRequest[]
}
