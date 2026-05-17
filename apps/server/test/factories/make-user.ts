import { PasswordHashGenerator } from '@python-editor/api/cryptography/hash-generator'
import { UsersRepository } from '@python-editor/api/repositories/users-repository'
import db from '@python-editor/db'
import { faker } from '@faker-js/faker'

export async function makeUser(params: {
  name?: string
  lastName?: string
  email?: string
  avatar?: string
  createdAt?: Date
  emailVerified?: boolean
  password?: string
  id?: string
}) {
  const usersRepository = new UsersRepository(db.prisma)
  const passwordHashGenerator = new PasswordHashGenerator()

  const hashedPassword = await passwordHashGenerator.hash(
    params.password || faker.internet.password(),
  )

  return await usersRepository.create({
    name: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    avatar: null,
    createdAt: new Date(),
    emailVerified: false,
    hashedPassword,
    ...params,
  })
}
