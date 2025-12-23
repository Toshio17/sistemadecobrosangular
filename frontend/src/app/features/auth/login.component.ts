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
      <h2>{{ isRegistering ? 'Registrar Usuario' : 'Ingresar' }}</h2>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <label>Usuario</label>
        <input formControlName="username" type="text" style="width:100%;padding:8px;margin-bottom:12px" />
        
        <label>Contraseña</label>
        <input formControlName="password" type="password" style="width:100%;padding:8px;margin-bottom:12px" />
        
        <div *ngIf="isRegistering">
          <label>Rol</label>
          <select formControlName="role" style="width:100%;padding:8px;margin-bottom:12px">
            <option value="cobrador">Cobrador</option>
            <option value="supervisor">Supervisor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button type="submit" [disabled]="form.invalid" style="width:100%;padding:10px;margin-bottom:10px">
          {{ isRegistering ? 'Registrar' : 'Entrar' }}
        </button>
        
        <button type="button" (click)="toggleMode()" style="width:100%;padding:10px;background:#f0f0f0;border:none">
          {{ isRegistering ? 'Volver a Login' : 'Crear cuenta' }}
        </button>

        <div *ngIf="error" style="color:#c00;margin-top:8px">{{error}}</div>
        <div *ngIf="success" style="color:green;margin-top:8px">{{success}}</div>
      </form>
    </div>
  `
})
export class LoginComponent {
  error = ''
  success = ''
  isRegistering = false
  
  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    role: ['cobrador']
  })

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  toggleMode() {
    this.isRegistering = !this.isRegistering
    this.error = ''
    this.success = ''
    this.form.reset({ role: 'cobrador' })
  }

  submit() {
    const { username, password, role } = this.form.value as any
    this.error = ''
    this.success = ''

    if (this.isRegistering) {
      this.auth.register(username, password, role).subscribe({
        next: () => {
          this.success = 'Usuario registrado correctamente. Ahora puedes ingresar.'
          this.isRegistering = false
          this.form.reset({ role: 'cobrador' })
        },
        error: (err) => {
          if (err.error?.error === 'username_exists') {
            this.error = 'El nombre de usuario ya existe'
          } else {
            this.error = 'Error al registrar usuario'
          }
        }
      })
    } else {
      this.auth.login(username, password).subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: () => this.error = 'Credenciales inválidas'
      })
    }
  }
}
