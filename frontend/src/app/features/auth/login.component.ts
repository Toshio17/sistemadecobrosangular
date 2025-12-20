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
    <div class="login-container">
      <div class="glass-card animate__animated animate__fadeIn">
        
        <!-- LOGIN VIEW -->
        <ng-container *ngIf="view === 'login'">
          <div class="header">
            <h1>SISTEMA DE COBROS</h1>
            <p>Bienvenido de nuevo</p>
          </div>
          <form [formGroup]="loginForm" (ngSubmit)="submitLogin()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Usuario</mat-label>
              <mat-icon matPrefix>person</mat-icon>
              <input matInput formControlName="username" placeholder="Ingresa tu usuario">
              <mat-error *ngIf="loginForm.get('username')?.hasError('required')">El usuario es requerido</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <mat-icon matPrefix>lock</mat-icon>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" placeholder="********">
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">La contraseña es requerida</mat-error>
            </mat-form-field>

            <div class="actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="loginForm.invalid || loading" class="futuristic-btn">
                <mat-icon style="margin-right:8px">login</mat-icon> INGRESAR
              </button>
              <button mat-stroked-button color="accent" type="button" (click)="switchView('register')" class="futuristic-btn">
                REGISTRARSE
              </button>
            </div>

            <div class="links">
              <a (click)="switchView('forgot')">¿Olvidaste tu contraseña?</a>
            </div>
          </form>
        </ng-container>

        <!-- REGISTER VIEW -->
        <ng-container *ngIf="view === 'register'">
          <div class="header">
            <h1>REGISTRO</h1>
            <p>Únete al sistema</p>
          </div>
          <form [formGroup]="registerForm" (ngSubmit)="submitRegister()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Usuario</mat-label>
              <mat-icon matPrefix>person_add</mat-icon>
              <input matInput formControlName="username">
              <mat-error *ngIf="registerForm.get('username')?.hasError('required')">Requerido</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <mat-icon matPrefix>key</mat-icon>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="registerForm.get('password')?.hasError('required')">Requerido</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Rol</mat-label>
              <mat-select formControlName="role">
                <mat-option value="cobrador">Cobrador</mat-option>
                <mat-option value="supervisor">Supervisor</mat-option>
                <mat-option value="admin">Administrador</mat-option>
              </mat-select>
              <mat-error *ngIf="registerForm.get('role')?.hasError('required')">Seleccione un rol</mat-error>
            </mat-form-field>

            <div class="actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="registerForm.invalid || loading" class="futuristic-btn">
                CREAR CUENTA
              </button>
              <button mat-button type="button" (click)="switchView('login')">
                Volver al login
              </button>
            </div>
          </form>
        </ng-container>

        <!-- FORGOT PASSWORD VIEW -->
        <ng-container *ngIf="view === 'forgot'">
          <div class="header">
            <h1>RECUPERAR</h1>
            <p>Ingresa tu usuario para restablecer</p>
          </div>
          <form [formGroup]="forgotForm" (ngSubmit)="submitForgot()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Usuario</mat-label>
              <mat-icon matPrefix>badge</mat-icon>
              <input matInput formControlName="username">
              <mat-error *ngIf="forgotForm.get('username')?.hasError('required')">Requerido</mat-error>
            </mat-form-field>

            <div class="actions">
              <button mat-raised-button color="warn" type="submit" [disabled]="forgotForm.invalid || loading" class="futuristic-btn">
                ENVIAR SOLICITUD
              </button>
              <button mat-button type="button" (click)="switchView('login')">
                Volver
              </button>
            </div>
          </form>
        </ng-container>

      </div>
    </div>
  `
})
export class LoginComponent {
  view: 'login' | 'register' | 'forgot' = 'login'
  hidePassword = true
  loading = false

  loginForm: FormGroup
  registerForm: FormGroup
  forgotForm: FormGroup

  constructor(
    private fb: FormBuilder, 
    private auth: AuthService, 
    private router: Router,
    private snack: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    })
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      role: ['cobrador', Validators.required]
    })
    this.forgotForm = this.fb.group({
      username: ['', Validators.required]
    })
  }

  switchView(v: 'login' | 'register' | 'forgot') {
    this.view = v
    this.loginForm.reset()
    this.registerForm.reset({role: 'cobrador'})
    this.forgotForm.reset()
  }

  submitLogin() {
    if (this.loginForm.invalid) return
    this.loading = true
    const { username, password } = this.loginForm.value
    this.auth.login(username, password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard'])
      },
      error: () => {
        this.loading = false
        this.snack.open('Credenciales inválidas', 'Error', { duration: 3000 })
      }
    })
  }

  submitRegister() {
    if (this.registerForm.invalid) return
    this.loading = true
    this.auth.register(this.registerForm.value).subscribe({
      next: () => {
        this.loading = false
        this.snack.open('Usuario registrado exitosamente', 'OK', { duration: 3000 })
        this.switchView('login')
      },
      error: (err) => {
        this.loading = false
        const msg = err.error?.error === 'username_taken' ? 'El usuario ya existe' : 'Error al registrar'
        this.snack.open(msg, 'Cerrar', { duration: 3000 })
      }
    })
  }

  submitForgot() {
    if (this.forgotForm.invalid) return
    this.loading = true
    const { username } = this.forgotForm.value
    this.auth.requestPasswordReset(username).subscribe({
      next: () => {
        this.loading = false
        this.snack.open('Se ha enviado la solicitud de recuperación (Simulado)', 'OK', { duration: 4000 })
        this.switchView('login')
      },
      error: () => {
        this.loading = false
        this.snack.open('Usuario no encontrado', 'Error', { duration: 3000 })
      }
    })
  }
}