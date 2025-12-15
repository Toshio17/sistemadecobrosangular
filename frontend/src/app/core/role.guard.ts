import { CanActivateFn } from '@angular/router'
import { inject } from '@angular/core'
import { AuthService } from './auth.service'

export const RoleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService)
  const roles = (route.data as any)?.roles as string[]
  return auth.hasRole(roles || [])
}
