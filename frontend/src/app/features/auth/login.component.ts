import { Component } from '@angular/core'
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms'
import { Router } from '@angular/router'
import { AuthService } from '../../core/auth.service'
import { CommonModule } from '@angular/common'
import { MatCardModule } from '@angular/material/card'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatSelectModule } from '@angular/material/select'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatCardModule, 
    MatInputModule, 
    MatButtonModule, 
    MatIconModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
      padding: 20px;
    }
    .glass-card {
      width: 100%;
      max-width: 450px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 15px 35px rgba(0,0,0,0.3);
      border: 1px solid rgba(255,255,255,0.2);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #1a237e;
      margin-bottom: 10px;
      letter-spacing: 1px;
    }
    .header p {
      color: #666;
    }
    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }
    .actions {
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-top: 20px;
    }
    .links {
      display: flex;
      justify-content: space-between;
      margin-top: 15px;
      font-size: 0.9rem;
    }
    a {
      cursor: pointer;
      color: #3f51b5;
      text-decoration: none;
      transition: color 0.3s;
    }
    a:hover {
      color: #1a237e;
      text-decoration: underline;
    }
    .futuristic-btn {
      padding: 22px !important;
      font-size: 1.1rem !important;
      letter-spacing: 1px;
      border-radius: 50px !important;
    }
  `],
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
