export type UserCreateParams = {
  id?: string
  name: string
  lastName: string
  email: string
  hashedPassword: string
  emailVerified?: boolean | undefined
  createdAt?: string | Date | undefined
  avatar?: string | null | undefined
}

export type User = {
  id: string
  name: string
  createdAt: Date
  lastName: string
  email: string
  hashedPassword: string
  emailVerified: boolean
  avatar: string | null
}

export type UserWithoutPassword = Omit<User, 'hashedPassword'>
