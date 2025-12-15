import { Component } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { CommonModule } from '@angular/common'
import { MatCardModule } from '@angular/material/card'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatTableModule } from '@angular/material/table'
import { Router } from '@angular/router'

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule],
  template: `
    <div style="padding:24px">
      <div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap">
        <mat-card style="flex:1 1 480px">
          <mat-card-title style="display:flex;align-items:center;justify-content:space-between">
            <span>Estado del sistema</span>
          </mat-card-title>
          <mat-card-content>
            <div style="display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap">
              <div style="flex:1 1 320px">
                <div style="display:flex;align-items:center;gap:8px;margin:6px 0">
                  <mat-icon color="primary">check_circle</mat-icon>
                  <a (click)="go('/clientes')" style="text-decoration:none;cursor:pointer">Clientes</a>
                </div>
                <div style="display:flex;align-items:center;gap:8px;margin:6px 0">
                  <mat-icon color="primary">check_circle</mat-icon>
                  <a (click)="go('/mensualidades')" style="text-decoration:none;cursor:pointer">Facturación</a>
                </div>
                <div style="display:flex;align-items:center;gap:8px;margin:6px 0">
                  <mat-icon color="primary">check_circle</mat-icon>
                  <a (click)="go('/mensualidades')" style="text-decoration:none;cursor:pointer">Pagos</a>
                </div>
              </div>
              <div style="flex:1 1 320px;display:flex;gap:8px;flex-direction:column">
                <div style="display:flex;gap:8px;flex-wrap:wrap">
                  <button mat-stroked-button color="primary" (click)="go('/clientes', { new: '1' })"><mat-icon>person_add</mat-icon>&nbsp;Nuevo cliente</button>
                  <button mat-stroked-button color="accent" (click)="go('/mensualidades', { new: '1' })"><mat-icon>payments</mat-icon>&nbsp;Registrar pago</button>
                </div>
                <div>
                  <button mat-stroked-button (click)="go('/planes')"><mat-icon>category</mat-icon>&nbsp;Planes</button>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:16px">
        <mat-card>
          <mat-card-title>Deudas pendientes</mat-card-title>
          <mat-card-content><h3 style="margin:8px 0">{{metrics?.deudas_vencidas || 0}}</h3></mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-title>Pagos del mes</mat-card-title>
          <mat-card-content><h3 style="margin:8px 0">{{metrics?.total_mes || 0 | currency:'PEN'}}</h3></mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-title>Pagos recientes</mat-card-title>
          <mat-card-content><h3 style="margin:8px 0">{{metrics?.pagos_recientes?.length || 0}}</h3></mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-title>Morosos 30/60/90</mat-card-title>
          <mat-card-content><h3 style="margin:8px 0">{{metrics?.morosos?.join(' / ')}}</h3></mat-card-content>
        </mat-card>
      </div>

      <div style="margin-top:16px;display:grid;grid-template-columns:1fr;gap:12px">
        <mat-card>
          <mat-card-title>Pagos recientes</mat-card-title>
          <mat-card-content>
            <table mat-table [dataSource]="metrics?.pagos_recientes || []" style="width:100%">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let it">{{it.id}}</td>
              </ng-container>
              <ng-container matColumnDef="cliente_id">
                <th mat-header-cell *matHeaderCellDef>Cliente</th>
                <td mat-cell *matCellDef="let it">{{it.cliente_id}}</td>
              </ng-container>
              <ng-container matColumnDef="fecha_pago">
                <th mat-header-cell *matHeaderCellDef>Fecha</th>
                <td mat-cell *matCellDef="let it">{{it.fecha_pago}}</td>
              </ng-container>
              <ng-container matColumnDef="monto_pagado">
                <th mat-header-cell *matHeaderCellDef>Monto</th>
                <td mat-cell *matCellDef="let it">{{it.monto_pagado | currency:'PEN'}}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="['id','cliente_id','fecha_pago','monto_pagado']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['id','cliente_id','fecha_pago','monto_pagado'];"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `
})
export class DashboardComponent {
  metrics: any
  constructor(private http: HttpClient, private router: Router) {}
  ngOnInit() { this.http.get('/payments/metrics').subscribe(r => this.metrics = r) }
  go(path: string, query?: Record<string,string>) {
    this.router.navigate([path], { queryParams: query || {} })
  }
}
