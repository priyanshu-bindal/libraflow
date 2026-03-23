import type { DefaultSession } from 'next-auth'
import type { Role } from '@prisma/client'
import type { DefaultJWT } from '@auth/core/jwt'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string
      role: Role
      name: string
    }
  }

  interface User {
    id: string
    role: Role
    name: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id?: string
    role?: Role
  }
}

export {}
