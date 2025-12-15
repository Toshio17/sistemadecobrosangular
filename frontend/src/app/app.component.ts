import { Component } from '@angular/core'
import { RouterOutlet, RouterLink, Router } from '@angular/router'
import { CommonModule } from '@angular/common'
import { AuthService } from './core/auth.service'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatButtonModule } from '@angular/material/button'

@Component({
  selector: 'app-root',
  template: `
    <mat-toolbar color="primary">
      <span style="font-weight:600">Sistema de Cobros</span>
      <span style="flex:1 1 auto"></span>
      <ng-container *ngIf="auth.isAuthenticated(); else loggedOut">
        <a mat-button routerLink="/dashboard">Dashboard</a>
        <a mat-button routerLink="/clientes">Clientes</a>
        <a mat-button routerLink="/mensualidades">Mensualidades</a>
        <a mat-button routerLink="/planes">Planes</a>
        <a mat-button routerLink="/notificaciones" *ngIf="auth.hasRole(['admin','supervisor'])">Notificaciones</a>
        <button mat-raised-button color="accent" (click)="logout()" style="margin-left:8px">Salir</button>
      </ng-container>
      <ng-template #loggedOut>
        <a mat-button routerLink="/login">Login</a>
      </ng-template>
    </mat-toolbar>
    <router-outlet></router-outlet>
  `,
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule]
})
export class AppComponent {
  constructor(public auth: AuthService, private router: Router) {}
  logout() { this.auth.token = null; this.auth.role = null; this.router.navigate(['/login']) }
}
