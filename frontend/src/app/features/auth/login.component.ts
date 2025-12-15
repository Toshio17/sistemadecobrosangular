import { Component } from '@angular/core'
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { AuthService } from '../../core/auth.service'
import { CommonModule } from '@angular/common'

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div style="max-width:360px;margin:64px auto;padding:24px;border:1px solid #ddd;border-radius:12px">
      <h2>Ingresar</h2>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <label>Usuario</label>
        <input formControlName="username" type="text" style="width:100%;padding:8px;margin-bottom:12px" />
        <label>Contraseña</label>
        <input formControlName="password" type="password" style="width:100%;padding:8px;margin-bottom:12px" />
        <button type="submit" [disabled]="form.invalid" style="width:100%;padding:10px">Entrar</button>
        <div *ngIf="error" style="color:#c00;margin-top:8px">{{error}}</div>
      </form>
    </div>
  `
})
export class LoginComponent {
  error = ''
  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  })
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}
  submit() {
    const { username, password } = this.form.value as any
    this.auth.login(username, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => this.error = 'Credenciales inválidas'
    })
  }
}
