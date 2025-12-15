import { HttpInterceptorFn } from '@angular/common/http'
import { inject } from '@angular/core'
import { AuthService } from './auth.service'

const API = 'http://localhost:4000'

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService)
  const url = req.url.startsWith('http') ? req.url : `${API}${req.url}`
  const headers = auth.token ? req.headers.set('Authorization', `Bearer ${auth.token}`) : req.headers
  return next(req.clone({ url, headers }))
}
