# CLAUDE.md — `@python-editor/core`

Technical reference document for LLM sessions. Prioritizes precision and concrete examples extracted from real code.

---

## Architecture Overview

The package implements **Clean Architecture** in three layers with strict dependency rules:

```
┌─────────────────────────────────────────────────────────┐
│  domain/                                                │
│    errors/       — Error subclasses                     │
│    interfaces/   — contracts (I*)                       │
│    types/        — pure data types                      │
│    use-cases/    — business logic + .spec.ts            │
│                                                         │
│  Rule: domain/ NEVER imports from outside domain/       │
│  (no infra/, no @python-editor/*, no external libs)     │
└────────────────────┬────────────────────────────────────┘
                     │ implements contracts from
┌────────────────────▼────────────────────────────────────┐
│  infra/                                                 │
│    gateways/     — concrete implementations             │
│      cryptography/  mail/  repositories/                │
│      storages/      valkey/                             │
│    factories/    — make* functions (DI wiring)          │
│                                                         │
│  May import: domain/, external packages, libs           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  test/                                                  │
│    cryptography/  emails/  key-value-stores/            │
│    repositories/  storage/                              │
│                                                         │
│  Fakes implementing domain/ interfaces                  │
│  Used exclusively in use-case .spec.ts files            │
└─────────────────────────────────────────────────────────┘
```

### Dependency flow (one-way)

```
infra/gateways  →  implements  →  domain/interfaces
infra/factories →  instantiates →  infra/gateways + domain/use-cases
test/fakes      →  implements  →  domain/interfaces
domain/use-cases→  depends on  →  domain/interfaces (via constructor)
```

---

## Patterns and Conventions

### Naming

| Artifact | Convention | Example |
|---|---|---|
| Domain interface | `I` + PascalCase | `IHashGenerator`, `IUsersRepository` |
| Test fake | `Fake` + PascalCase | `FakeHashGenerator`, `FakeUsersRepository` |
| Factory | `make` + PascalCase | `makeRegisterUserUseCase` |
| Error class | PascalCase + `Error` | `UserAlreadyExistsError` |
| File | kebab-case | `register-user.ts`, `hash-generator.ts` |
| Co-located spec | same name + `.spec.ts` | `register-user.spec.ts` |

### Imports

**Always use `import type` for type-only imports** (`verbatimModuleSyntax` + `strict`):

```typescript
// CORRECT
import type { IHashGenerator } from '../interfaces/cryptography/hash-generator'
import type { UserCreateParams } from '../types/user'
import { UserAlreadyExistsError } from '../errors/user-already-exists-error'

// WRONG — causes compilation error
import { IHashGenerator } from '../interfaces/cryptography/hash-generator'
```

Rule of thumb: interfaces and types → `import type`. Classes (errors, use cases) → regular `import`.

### Exports

**No barrels.** Each file exports only what it defines. The `package.json` exposes `"./*"` → `"./src/*.ts"`, allowing direct imports:

```typescript
// External consumer
import { RegisterUserUseCase } from '@python-editor/core/domain/use-cases/register-user'
import { makeRegisterUserUseCase } from '@python-editor/core/infra/factories/make-register-user'
```

Never create `index.ts` — it breaks the export system.

### Use Cases

Required structure:

```typescript
// 1. Local params (never import DTO directly in the constructor)
interface UseCaseNameParams {
  dto: SomeDTO  
}

export class UseCaseName {
  // 2. Constructor receives ONLY interfaces or relevant information (e.g. env variable)
  constructor(
    private dep1: IDep1,
    private dep2: IDep2,
  ) {}

  // 3. execute() is the only public method
  async execute({ dto }: UseCaseNameParams) {
    // logic...
  }

  // 4. Helpers are private
  private async helperMethod(params: { ... }) {
    // ...
  }
}
```

Canonical example: [`src/domain/use-cases/register-user.ts`](src/domain/use-cases/register-user.ts)

### Domain Errors

```typescript
// One file per error, in src/domain/errors/
export class SomeNameError extends Error {
  constructor() {
    super('English message describing the problem')
  }
}
```

Errors are thrown (`throw`) by the use case. Never use Result types. The use case caller is responsible for catching.

Canonical example: [`src/domain/errors/user-already-exists-error.ts`](src/domain/errors/user-already-exists-error.ts)

### Domain Interfaces

```typescript
// In src/domain/interfaces/<category>/name.ts
export interface IContractName {
  method(params: { ... }): Promise<ReturnType>
}
```

The interface defines the contract. No implementation details.

Canonical example: [`src/domain/interfaces/repositories/users-repository.ts`](src/domain/interfaces/repositories/users-repository.ts)

### Factories

```typescript
// In src/infra/factories/make-use-case-name.ts
export function makeUseCaseName() {
  // 1. Instantiate concrete dependencies
  const dep1 = new Dep1Impl()
  const dep2 = new Dep2Impl(db.prisma)

  // 2. Return configured use case
  return new UseCaseName(dep1, dep2)
}
```

Factories have no logic — just wiring. One factory per use case.

Canonical example: [`src/infra/factories/make-register-user.ts`](src/infra/factories/make-register-user.ts)

### Gateways with Abstract Classes

When multiple gateways share the same base algorithm, use abstract class:

```typescript
// Abstract base with common logic
abstract class Argon2HashGenerator implements IHashGenerator {
  public async hash(text: string) { ... }
}

// Concrete subclasses are just "semantic labels"
export class PasswordHashGenerator extends Argon2HashGenerator {}
export class EmailVerificationTokenHashGenerator extends SHA256HashGenerator {}
```

Canonical example: [`src/infra/gateways/cryptography/hash-generator.ts`](src/infra/gateways/cryptography/hash-generator.ts)

---

## How to Implement Something New

### New Use Case

**Checklist in order:**

- [ ] **1. Types** (`src/domain/types/`) — define input/output types if they don't exist yet
- [ ] **2. Interface(s)** (`src/domain/interfaces/<category>/`) — define the contract for each new dependency
- [ ] **3. Error(s)** (`src/domain/errors/`) — create one file per new domain error
- [ ] **4. Use Case** (`src/domain/use-cases/name.ts`) — implement the class following the pattern above
- [ ] **5. Spec** (`src/domain/use-cases/name.spec.ts`) — co-located, using fakes
- [ ] **6. Fake(s)** (`test/<category>/fake-name.ts`) — implement fakes for new interfaces
- [ ] **7. Gateway(s)** (`src/infra/gateways/<category>/name.ts`) — concrete implementation
- [ ] **8. Factory** (`src/infra/factories/make-name.ts`) — dependency wiring

**Example spec structure:**

```typescript
// src/domain/use-cases/my-use-case.spec.ts
import { MyUseCase } from './my-use-case'
import { MyError } from '../errors/my-error'
import { Data } from '../../../test/repositories/data'
import { FakeUsersRepository } from '../../../test/repositories/fake-users-repository'
import { FakeSomeDependency } from '../../../test/category/fake-some-dependency'

let sut: MyUseCase
let data: Data
let usersRepository: FakeUsersRepository
let someDependency: FakeSomeDependency

describe('My Use Case', () => {
  beforeEach(() => {
    data = new Data()
    usersRepository = new FakeUsersRepository(data)
    someDependency = new FakeSomeDependency()
    sut = new MyUseCase(usersRepository, someDependency)
  })

  it('should ...', async () => {
    await sut.execute({ dto: { ... } })
    expect(someDependency.calls).toHaveLength(1)
  })

  it('should throw MyError when ...', async () => {
    await expect(() =>
      sut.execute({ dto: { ... } })
    ).rejects.toBeInstanceOf(MyError)
  })
})
```

### New Interface + Gateway + Fake

**Interface** (domain):
```typescript
// src/domain/interfaces/category/my-interface.ts
export interface IMyInterface {
  operation(params: { id: string }): Promise<Result | null>
}
```

**Gateway** (infra):
```typescript
// src/infra/gateways/category/my-implementation.ts
import type { IMyInterface } from '../../../domain/interfaces/category/my-interface'

export class MyImplementation implements IMyInterface {
  constructor(private dep: SomeExternalClient) {}

  async operation(params: { id: string }) {
    // real implementation
  }
}
```

**Fake** (test):
```typescript
// test/category/fake-my-interface.ts
import type { IMyInterface } from '../../src/domain/interfaces/category/my-interface'

export class FakeMyInterface implements IMyInterface {
  // exposes internal state for assertions in tests
  public store = new Map<string, Result>()

  async operation(params: { id: string }) {
    return this.store.get(params.id) ?? null
  }
}
```

---

## How to Modify Something Existing

### Modify a Use Case

1. **Before**: identify all fakes used in the co-located `.spec.ts`
2. **During**: if changing the `execute()` signature, update the spec
3. **After**: run `npm run test src/domain/use-cases/name.spec.ts`

### Modify a Domain Interface

1. Update the interface in `domain/interfaces/`
2. Update the real implementation in `infra/gateways/`
3. Update the corresponding fake in `test/`
4. Update any use case that calls the changed method
5. Run the affected specs

### Modify a Factory

1. If you added a dependency to the use case, instantiate the new gateway in the factory and pass it to the constructor
2. The argument order in the use case constructor must match the order in the factory
3. Check the use case spec — it instantiates dependencies manually in `beforeEach`, not through the factory

### Modify a Domain Type

Types in `domain/types/` are used by interfaces, use cases, and fakes. A change cascades to:
- The interface that uses the type
- The gateway implementing the interface
- The fake implementing the interface
- The use case that calls the method

Search for `YourType` before changing to map the impact.

---

## Pitfalls and Anti-patterns

### 1. Import outside domain within domain

```typescript
// WRONG — use case importing external lib
import { v7 as uuidv7 } from 'uuid'  // ← violates Clean Architecture

// WRONG — use case importing concrete gateway
import { UsersRepository } from '../../infra/gateways/repositories/users-repository'

// WRONG — use case importing monorepo package
import db from '@python-editor/db'
import { env } from '@python-editor/env/server'

// CORRECT — use case imports only from domain/
import type { IUsersRepository } from '../interfaces/repositories/users-repository'
import type { UserWithoutPassword } from '../types/user'
import { UserAlreadyExistsError } from '../errors/user-already-exists-error'
```

If you need UUID, config, or Prisma — that goes in the gateway (infra), not in the use case (domain).

### 2. Concrete class in use case constructor

```typescript
// WRONG — breaks testability, can't inject fake
constructor(private repo: UsersRepository) {}

// CORRECT — any IUsersRepository implementation works (real + fake)
constructor(private repo: IUsersRepository) {}
```

### 3. Omitting `import type`

```typescript
// WRONG — fails with verbatimModuleSyntax
import { IHashGenerator } from '../interfaces/cryptography/hash-generator'

// CORRECT
import type { IHashGenerator } from '../interfaces/cryptography/hash-generator'
```

### 4. Creating a barrel `index.ts`

```typescript
// WRONG — creates ambiguity with the "./*" system in package.json
// src/domain/use-cases/index.ts  ← do not create
export * from './register-user'
export * from './sign-in'

// CORRECT — each file is imported directly
import { RegisterUserUseCase } from '@python-editor/core/domain/use-cases/register-user'
```

### 5. Array access without guard

```typescript
// WRONG — noUncheckedIndexedAccess makes sessionIds[index] be string | undefined
const sessionId = sessionIds[index]
redis.srem(key, sessionId)  // ← TypeScript rejects: string | undefined

// CORRECT
const sessionId = sessionIds[index] as string
// or
const sessionId = sessionIds[index]
if (sessionId) redis.srem(key, sessionId)
```

### 6. Putting logic in the factory

```typescript
// WRONG — factory with conditional
export function makeSignInUseCase() {
  const repo = process.env.TEST ? new FakeUsersRepository() : new UsersRepository(db.prisma)
  return new SignInUseCase(repo, ...)
}

// CORRECT — factory is pure wiring; tests instantiate fakes directly in beforeEach
export function makeSignInUseCase() {
  return new SignInUseCase(
    new UsersRepository(db.prisma),
    new AccessTokenSign(),
    new RefreshTokenSign(),
    new PasswordHashCompare(),
    new UserSessionsKeyValueStore(),
  )
}
```

---

## Internal References

| What to implement | Reference file |
|---|---|
| Simple use case | [`src/domain/use-cases/register-user.ts`](src/domain/use-cases/register-user.ts) |
| Use case with permission check | [`src/domain/use-cases/download-project.ts`](src/domain/use-cases/download-project.ts) |
| Use case spec | [`src/domain/use-cases/register-user.spec.ts`](src/domain/use-cases/register-user.spec.ts) |
| Simple domain interface | [`src/domain/interfaces/cryptography/hash-generator.ts`](src/domain/interfaces/cryptography/hash-generator.ts) |
| Repository interface | [`src/domain/interfaces/repositories/users-repository.ts`](src/domain/interfaces/repositories/users-repository.ts) |
| Key-value store interface | [`src/domain/interfaces/valkey/user-sessions-key-value-store.ts`](src/domain/interfaces/valkey/user-sessions-key-value-store.ts) |
| Domain error | [`src/domain/errors/user-already-exists-error.ts`](src/domain/errors/user-already-exists-error.ts) |
| Domain type with variants | [`src/domain/types/user.ts`](src/domain/types/user.ts) |
| Gateway with abstract class | [`src/infra/gateways/cryptography/hash-generator.ts`](src/infra/gateways/cryptography/hash-generator.ts) |
| Repository gateway (Prisma) | [`src/infra/gateways/repositories/users-repository.ts`](src/infra/gateways/repositories/users-repository.ts) |
| Key-value store gateway | [`src/infra/gateways/valkey/user-sessions-key-value-store.ts`](src/infra/gateways/valkey/user-sessions-key-value-store.ts) |
| Storage gateway (S3) | [`src/infra/gateways/storages/storage.ts`](src/infra/gateways/storages/storage.ts) |
| Factory | [`src/infra/factories/make-register-user.ts`](src/infra/factories/make-register-user.ts) |
| Repository fake | [`test/repositories/fake-users-repository.ts`](test/repositories/fake-users-repository.ts) |
| Simple interface fake | [`test/cryptography/fake-hash-generator.ts`](test/cryptography/fake-hash-generator.ts) |
| Fake with observable state | [`test/emails/fake-send-email-verification.ts`](test/emails/fake-send-email-verification.ts) |
| Shared test state | [`test/repositories/data.ts`](test/repositories/data.ts) |
