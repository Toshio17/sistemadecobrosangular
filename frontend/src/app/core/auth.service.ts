import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { tap } from 'rxjs/operators'

type LoginResponse = { token: string; role: 'admin'|'cobrador'|'supervisor'; username: string }

@Injectable({ providedIn: 'root' })
export class AuthService {
  token: string | null = null
  role: LoginResponse['role'] | null = null
  constructor(private http: HttpClient) {}
  login(username: string, password: string) {
    return this.http.post<LoginResponse>('/auth/login', { username, password }).pipe(
      tap(r => { this.token = r.token; this.role = r.role })
    )
  }
  register(data: any) {
    return this.http.post('/auth/register', data)
  }
  requestPasswordReset(username: string) {
    return this.http.post('/auth/forgot-password', { username })
  }
  isAuthenticated() { return !!this.token }
  hasRole(roles: string[]) { return this.role ? roles.includes(this.role) : false }
}
