# @python-editor/schemas

Shared Zod validation schemas and inferred TypeScript types used across the monorepo (server and web).

## Architecture

Flat package with no build step — sources are TypeScript files exported directly via package.json path exports. Each file corresponds to one domain schema.

```
src/
  jwt-payload.ts              # JWT token payload schema
  register-user.ts            # User registration form schema
  sign-in.ts                  # Sign-in form schema
  verify-email.ts             # Email verification token schema
  resend-email-verification.ts # Resend verification email schema
  new-file.ts                 # New file creation schema
```

Exports are mapped as `./*` → `./src/*.ts`, so consumers import like:
```ts
import { registerUserSchema } from '@python-editor/schemas/register-user'
```

## Key Files

| File | Schema name | DTO type |
|------|-------------|----------|
| `src/jwt-payload.ts` | `jwtPayloadSchema` | `JWTPayloadDTO` |
| `src/register-user.ts` | `registerUserSchema` | `RegisterUserDTO` |
| `src/sign-in.ts` | `signInSchema` | `SignInDTO` |
| `src/verify-email.ts` | `verifyEmailSchema` | `VerifyEmailDTO` |
| `src/resend-email-verification.ts` | `resendemailverificationSchema` | `ResendEmailVerificationDTO` |
| `src/new-file.ts` | `newFile` | `newFileDTO` |

## Coding Conventions

- **One schema per file.** Each file exports exactly one Zod schema and one inferred DTO type.
- **Naming pattern:** `<camelCaseName>Schema` for the Zod object, `<PascalCaseName>DTO` for the inferred type via `z.infer<typeof ...>`.
- **Validation messages are in Portuguese (pt-BR).** All user-facing `message` strings use pt-BR.
- **String fields use `.trim()`** before length/regex validation.
- **Password rules** (used in both `register-user` and `sign-in`): min 8 chars, at least one uppercase letter, one digit, one special character — validated with chained `.regex()` calls.
- **No barrel `index.ts`.** Consumers must import from individual sub-paths.
- **No build artifacts.** TypeScript is consumed directly; `"type": "module"` in package.json.
- **Inconsistency to note:** `resendemailverificationSchema` breaks the `camelCaseName + Schema` convention (should be `resendEmailVerificationSchema`). `newFile` and `newFileDTO` also deviate from the `PascalCaseName` DTO convention.