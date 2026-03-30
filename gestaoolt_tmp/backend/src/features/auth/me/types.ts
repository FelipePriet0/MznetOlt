export type MeInput = {
  user_id: number
}

export type MeOutput = {
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

export type UserWithRoleRow = {
  id: number
  name: string
  email: string
  is_active: boolean
  role_id: number
  created_at: string
  updated_at: string
  roles: {
    name: string
    code: string
  }
}
