import { v7 as uuidv7 } from 'uuid'
import { UsersRepository } from '../../src/repositories/users-repository'
import { faker } from '@faker-js/faker'

export function makeUser(params: {
  name?: string
  lastName?: string
  email?: string
  avatar?: string
  createdAt?: Date
  emailVerified?: boolean
  hashedPassword?: string
  id?: string
}) {
  return {
    name: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    avatar: null,
    createdAt: new Date(),
    emailVerified: false,
    hashedPassword: faker.internet.password(),
    id: uuidv7(),
    ...params,
  }
}

export async function makePrismaUser(params: {
  name?: string
  lastName?: string
  email?: string
  avatar?: string
  createdAt?: Date
  emailVerified?: boolean
  hashedPassword?: string
  id?: string
}) {
  const usersRepository = new UsersRepository()

  const user = makeUser(params)

  await usersRepository.create({
    email: user.email,
    name: user.name,
    lastName: user.lastName,
    avatar: user.avatar,
    createdAt: user.createdAt,
    emailVerified: user.emailVerified,
    hashedPassword: user.hashedPassword,
    id: user.id,
  })

  return user
}
