export type UserWithRole = {
  id: number
  name: string
  email: string
  is_active: boolean
  role_id: number
  role_name: string
  role_code: string
  created_at: string
  updated_at: string
}

export type ListUsersInput = {
  role_id?: number
  is_active?: boolean
  search?: string
  page?: number
  page_size?: number
}

export type ListUsersOutput = {
  items: UserWithRole[]
  total: number
  page: number
  page_size: number
}
