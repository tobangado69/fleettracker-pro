export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: PaginationMeta
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  message: string
  user: import('./models').User
  tokens: TokenResponse
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

export interface ErrorResponse {
  error: string
  message: string
}
