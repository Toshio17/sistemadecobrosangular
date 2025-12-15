import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'
import { MatSelectModule } from '@angular/material/select'
import { AuthService } from '../../core/auth.service'
import { MatTableModule, MatTableDataSource } from '@angular/material/table'
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator'
import { MatSort, MatSortModule } from '@angular/material/sort'
import { ViewChild } from '@angular/core'
import { ActivatedRoute } from '@angular/router'

@Component({
  standalone: true,
  selector: 'app-payments',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatTableModule, MatPaginatorModule, MatSortModule],
  template: `
    <div style="padding:24px">
      <h2>Mensualidades</h2>
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
        <mat-form-field appearance="outline">
          <mat-label>Cliente ID</mat-label>
          <input matInput [(ngModel)]="clienteId" (ngModelChange)="load()" type="number" />
        </mat-form-field>
        <span style="flex:1 1 auto"></span>
        <div style="display:flex;gap:8px;align-items:center">
          <button mat-raised-button color="primary" (click)="openNuevoPago()" [disabled]="!canCobrar()">Nuevo pago</button>
          <button mat-stroked-button (click)="exportCsv()" [disabled]="!canSuper()">Exportar CSV</button>
          <button mat-stroked-button (click)="markVencidos()" [disabled]="!canSuper()">Marcar vencidos</button>
        </div>
      </div>
      <table mat-table [dataSource]="dataSource" matSort class="mat-elevation-z2" style="margin-top:12px;width:100%">
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
          <td mat-cell *matCellDef="let m">{{m.id}}</td>
        </ng-container>
        <ng-container matColumnDef="cliente">
          <th mat-header-cell *matHeaderCellDef>Cliente</th>
          <td mat-cell *matCellDef="let m">{{m.cliente_id}} - {{ m.tipo_doc === 'DNI' ? (m.nombres + ' ' + m.apellidos) : (m.razon_social || '') }}</td>
        </ng-container>
        <ng-container matColumnDef="monto">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Monto</th>
          <td mat-cell *matCellDef="let m">{{m.monto}}</td>
        </ng-container>
        <ng-container matColumnDef="recargo">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Recargo</th>
          <td mat-cell *matCellDef="let m">{{m.recargo}}</td>
        </ng-container>
        <ng-container matColumnDef="descuento">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Descuento</th>
          <td mat-cell *matCellDef="let m">{{m.descuento}}</td>
        </ng-container>
        <ng-container matColumnDef="vencimiento">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Vencimiento</th>
          <td mat-cell *matCellDef="let m">{{m.fecha_vencimiento}}</td>
        </ng-container>
        <ng-container matColumnDef="estado">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Estado</th>
          <td mat-cell *matCellDef="let m">{{m.estado}}</td>
        </ng-container>
        <ng-container matColumnDef="fecha_pago">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Fecha Pago</th>
          <td mat-cell *matCellDef="let m">{{m.fecha_pago || '-'}}</td>
        </ng-container>
        <ng-container matColumnDef="monto_pagado">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Monto Pagado</th>
          <td mat-cell *matCellDef="let m">{{m.monto_pagado || '-'}}</td>
        </ng-container>
        <ng-container matColumnDef="metodo">
          <th mat-header-cell *matHeaderCellDef>Método</th>
          <td mat-cell *matCellDef="let m">{{m.metodo_pago || '-'}}</td>
        </ng-container>
        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef>Acciones</th>
          <td mat-cell *matCellDef="let m">
            <ng-container *ngIf="canCobrar()">
              <button mat-button color="primary" (click)="openPago(m)">Marcar pago</button>
            </ng-container>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
      <mat-paginator [pageSizeOptions]="[10,20,50]" showFirstLastButtons></mat-paginator>
      <div *ngIf="pagoModal" style="position:fixed;inset:0;background:rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;z-index:1000">
        <div style="background:#fff;padding:16px;border-radius:6px;min-width:360px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <h3 style="margin:0">Marcar pago</h3>
            <button (click)="closePago()">✕</button>
          </div>
          <form [formGroup]="pagoForm" (ngSubmit)="marcarPago()">
            <mat-form-field>
              <mat-label>Fecha pago</mat-label>
              <input matInput formControlName="fecha_pago" type="date" />
            </mat-form-field>
            <mat-form-field>
              <mat-label>Monto pagado</mat-label>
              <input matInput formControlName="monto_pagado" type="number" step="0.01" />
            </mat-form-field>
            <mat-form-field>
              <mat-label>Método</mat-label>
              <mat-select formControlName="metodo_pago">
                <mat-option value="efectivo">Efectivo</mat-option>
                <mat-option value="yape">Yape</mat-option>
                <mat-option value="plin">Plin</mat-option>
                <mat-option value="tarjeta">Tarjeta</mat-option>
                <mat-option value="transferencia">Transferencia</mat-option>
              </mat-select>
            </mat-form-field>
            <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px">
              <button mat-button type="button" (click)="closePago()">Cancelar</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="pagoForm.invalid">Guardar</button>
            </div>
          </form>
        </div>
      </div>
      <div *ngIf="nuevoPagoModal" style="position:fixed;inset:0;background:rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;z-index:1000">
        <div style="background:#fff;padding:16px;border-radius:6px;min-width:360px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <h3 style="margin:0">Registrar pago</h3>
            <button (click)="closeNuevoPago()">✕</button>
          </div>
          <form [formGroup]="nuevoPagoForm" (ngSubmit)="crearPagoDirecto()">
            <mat-form-field>
              <mat-label>Cliente</mat-label>
              <mat-select formControlName="cliente_id">
                <mat-option *ngFor="let c of clientes" [value]="c.id">{{c.id}} - {{c.nombres}} {{c.apellidos}}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field>
              <mat-label>Fecha pago</mat-label>
              <input matInput formControlName="fecha_pago" type="date" />
            </mat-form-field>
            <mat-form-field>
              <mat-label>Monto pagado</mat-label>
              <input matInput formControlName="monto_pagado" type="number" step="0.01" />
            </mat-form-field>
            <mat-form-field>
              <mat-label>Método</mat-label>
              <mat-select formControlName="metodo_pago">
                <mat-option value="efectivo">Efectivo</mat-option>
                <mat-option value="yape">Yape</mat-option>
                <mat-option value="plin">Plin</mat-option>
                <mat-option value="tarjeta">Tarjeta</mat-option>
                <mat-option value="transferencia">Transferencia</mat-option>
              </mat-select>
            </mat-form-field>
            <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px">
              <button mat-button type="button" (click)="closeNuevoPago()">Cancelar</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="nuevoPagoForm.invalid">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class PaymentsComponent {
  items: any[] = []
  clienteId: number | null = null
  pagoModal = false
  currentId = 0
  nuevoPagoModal = false
  clientes: any[] = []
  displayedColumns = ['id','cliente','monto','recargo','descuento','vencimiento','estado','fecha_pago','monto_pagado','metodo','acciones']
  dataSource = new MatTableDataSource<any>([])
  pagoForm = this.fb.group({ fecha_pago: ['', Validators.required], monto_pagado: [0, Validators.required], metodo_pago: ['efectivo', Validators.required] })
  nuevoPagoForm = this.fb.group({ cliente_id: [null, Validators.required], fecha_pago: ['', Validators.required], monto_pagado: [0, Validators.required], metodo_pago: ['efectivo', Validators.required] })
  constructor(private http: HttpClient, private fb: FormBuilder, private auth: AuthService, private route: ActivatedRoute) {}
  ngOnInit() {
    this.load();
    this.loadClientes();
    this.route.queryParamMap.subscribe(p => { if (p.get('new') === '1') this.openNuevoPago() })
  }
  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort
  ngAfterViewInit() { this.dataSource.paginator = this.paginator; this.dataSource.sort = this.sort }
  load() {
    const params = new URLSearchParams()
    if (this.clienteId) params.set('cliente_id', String(this.clienteId))
    this.http.get<any[]>(`/payments?${params.toString()}`).subscribe(r => { this.items = r; this.dataSource.data = r })
  }
  loadClientes() { this.http.get<any[]>(`/clients?activo=1&size=200`).subscribe(r => this.clientes = r) }
  canCobrar() { return this.auth.role === 'admin' || this.auth.role === 'cobrador' }
  canSuper() { return this.auth.role === 'admin' || this.auth.role === 'supervisor' }
  openPago(m: any) {
    this.currentId = m.id
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    this.pagoForm.patchValue({ fecha_pago: `${yyyy}-${mm}-${dd}`, monto_pagado: m.monto, metodo_pago: 'efectivo' })
    this.pagoModal = true
  }
  closePago() { this.pagoModal = false }
  marcarPago() {
    const v = this.pagoForm.value as any
    this.http.post(`/payments/${this.currentId}/pagar`, v).subscribe({ next: () => { this.closePago(); this.load() } })
  }
  openNuevoPago() {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    this.nuevoPagoForm.patchValue({ cliente_id: null, fecha_pago: `${yyyy}-${mm}-${dd}`, monto_pagado: 0, metodo_pago: 'efectivo' })
    this.nuevoPagoModal = true
  }
  closeNuevoPago() { this.nuevoPagoModal = false }
  crearPagoDirecto() {
    const v = this.nuevoPagoForm.value as any
    this.http.post(`/payments/pago-directo`, v).subscribe({ next: () => { this.closeNuevoPago(); this.load() } })
  }
  exportCsv() {
    this.http.get('/payments/export.csv', { responseType: 'text' }).subscribe(txt => {
      const blob = new Blob([txt], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'mensualidades.csv'
      a.click()
      URL.revokeObjectURL(url)
    })
  }
  markVencidos() {
    this.http.post('/payments/mark-vencidos', {}).subscribe({ next: () => this.load() })
  }
}
