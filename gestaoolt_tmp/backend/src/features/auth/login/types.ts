export type LoginInput = {
  email: string
  password: string
}

export type LoginOutput = {
  user_id: number
  role_id: number
  role_code: string
  role_name: string
}

export type UserRow = {
  id: number
  email: string
  is_active: boolean
  role_id: number
  roles: {
    name: string
    code: string
  }
}
