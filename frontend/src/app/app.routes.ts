import { Routes } from '@angular/router'
import { AuthGuard } from './core/auth.guard'
import { RoleGuard } from './core/role.guard'
import { LoginComponent } from './features/auth/login.component'
import { DashboardComponent } from './features/dashboard/dashboard.component'
import { ClientsComponent } from './features/clients/clients.component'
import { PlansComponent } from './features/plans/plans.component'
import { PaymentsComponent } from './features/payments/payments.component'
import { NotificationsComponent } from './features/notifications/notifications.component'

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'clientes', component: ClientsComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin','cobrador','supervisor'] } },
  { path: 'mensualidades', component: PaymentsComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin','cobrador','supervisor'] } },
  { path: 'planes', component: PlansComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin','supervisor'] } },
  { path: 'notificaciones', component: NotificationsComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin','supervisor'] } }
]
