export interface SignInInput {
  email: string
  password: string
}

export interface SignUpInput {
  email: string
  password: string
  fullName: string
}

export interface ResetPasswordInput {
  email: string
}

export interface UpdatePasswordInput {
  password: string
}
