import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator'
import { MatSortModule, Sort } from '@angular/material/sort'
import { ActivatedRoute } from '@angular/router'

@Component({
  standalone: true,
  selector: 'app-clients',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatTableModule, MatPaginatorModule, MatSortModule],
  template: `
    <div style="padding:24px">
      <h2>Clientes</h2>
      <div *ngIf="showModal" style="position:fixed;inset:0;background:rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;z-index:1000">
        <div style="background:#fff;padding:16px;border-radius:6px;min-width:720px;max-width:90vw">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <h3 style="margin:0">Nuevo Cliente</h3>
            <button mat-icon-button (click)="closeModal()"><mat-icon>close</mat-icon></button>
          </div>
          <form [formGroup]="form" (ngSubmit)="save()" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;align-items:end">
            <mat-form-field>
              <mat-label>Tipo Doc</mat-label>
              <mat-select formControlName="tipo_doc">
                <mat-option value="DNI">DNI</mat-option>
                <mat-option value="RUC">RUC</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field>
              <mat-label>Nro Doc</mat-label>
              <input matInput formControlName="nro_doc" />
            </mat-form-field>
            <div>
              <button mat-raised-button color="primary" type="button" (click)="validar()" [disabled]="form.controls.tipo_doc.invalid || form.controls.nro_doc.invalid">Validar</button>
            </div>
            <div style="grid-column:1/-1" *ngIf="validationMessage">
              <span [style.color]="validationOk ? '#060' : '#a00'">{{validationMessage}}</span>
            </div>
            <mat-form-field *ngIf="form.value.tipo_doc==='DNI'">
              <mat-label>Nombres</mat-label>
              <input matInput formControlName="nombres" />
            </mat-form-field>
            <mat-form-field *ngIf="form.value.tipo_doc==='DNI'">
              <mat-label>Apellidos</mat-label>
              <input matInput formControlName="apellidos" />
            </mat-form-field>
            <mat-form-field *ngIf="form.value.tipo_doc==='RUC'">
              <mat-label>Razón Social</mat-label>
              <input matInput formControlName="razon_social" />
            </mat-form-field>
            <mat-form-field>
              <mat-label>Dirección</mat-label>
              <input matInput formControlName="direccion" />
            </mat-form-field>
            <mat-form-field *ngIf="form.value.tipo_doc==='RUC'">
              <mat-label>Estado</mat-label>
              <input matInput formControlName="estado" />
            </mat-form-field>
            <mat-form-field *ngIf="form.value.tipo_doc==='RUC'">
              <mat-label>Condición</mat-label>
              <input matInput formControlName="condicion" />
            </mat-form-field>
            <mat-form-field>
              <mat-label>Plan</mat-label>
              <mat-select formControlName="plan_id">
                <mat-option [value]="null">(Sin plan)</mat-option>
                <mat-option *ngFor="let p of plans" [value]="p.id">{{p.nombre}}</mat-option>
              </mat-select>
            </mat-form-field>
            <div style="grid-column:1/-1;display:flex;gap:8px;justify-content:flex-end">
              <button mat-button type="button" (click)="closeModal()">Cancelar</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Guardar</button>
            </div>
          </form>
        </div>
      </div>
      <hr/>
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
        <mat-form-field appearance="outline">
          <mat-label>Buscar</mat-label>
          <input matInput [(ngModel)]="q" (ngModelChange)="firstPageAndLoad()" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Estado</mat-label>
          <mat-select [(ngModel)]="activoFilter" (ngModelChange)="firstPageAndLoad()">
            <mat-option value="all">Todos</mat-option>
            <mat-option value="1">Activos</mat-option>
            <mat-option value="0">Inactivos</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Tamaño</mat-label>
          <mat-select [(ngModel)]="size" (ngModelChange)="changeSize()">
            <mat-option [value]="10">10</mat-option>
            <mat-option [value]="20">20</mat-option>
            <mat-option [value]="50">50</mat-option>
          </mat-select>
        </mat-form-field>
        <span style="flex:1 1 auto"></span>
        <button mat-raised-button color="primary" (click)="openModal()">Nuevo</button>
      </div>
      <table mat-table [dataSource]="items" matSort (matSortChange)="onSort($event)" class="mat-elevation-z2" style="margin-top:12px;width:100%">
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef mat-sort-header="id">ID</th>
          <td mat-cell *matCellDef="let c">{{c.id}}</td>
        </ng-container>
        <ng-container matColumnDef="nro_doc">
          <th mat-header-cell *matHeaderCellDef mat-sort-header="nro_doc">Doc</th>
          <td mat-cell *matCellDef="let c">{{c.tipo_doc}} {{c.nro_doc}}</td>
        </ng-container>
        <ng-container matColumnDef="nombre_razon">
          <th mat-header-cell *matHeaderCellDef mat-sort-header="nombres">Nombre/Razón</th>
          <td mat-cell *matCellDef="let c">{{c.tipo_doc==='DNI' ? (c.nombres+' '+c.apellidos) : c.razon_social}}</td>
        </ng-container>
        <ng-container matColumnDef="estado">
          <th mat-header-cell *matHeaderCellDef mat-sort-header="estado">Estado</th>
          <td mat-cell *matCellDef="let c">{{c.estado}}</td>
        </ng-container>
        <ng-container matColumnDef="condicion">
          <th mat-header-cell *matHeaderCellDef mat-sort-header="condicion">Condición</th>
          <td mat-cell *matCellDef="let c">{{c.condicion}}</td>
        </ng-container>
        <ng-container matColumnDef="activo">
          <th mat-header-cell *matHeaderCellDef mat-sort-header="activo">Activo</th>
          <td mat-cell *matCellDef="let c">{{c.activo? 'Sí':'No'}}</td>
        </ng-container>
        <ng-container matColumnDef="plan_nombre">
          <th mat-header-cell *matHeaderCellDef mat-sort-header="plan_nombre">Plan</th>
          <td mat-cell *matCellDef="let c">{{c.plan_nombre || '-'}}</td>
        </ng-container>
        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef>Acciones</th>
          <td mat-cell *matCellDef="let c">
            <button mat-button color="primary" (click)="editar(c)">Editar</button>
            <button mat-button (click)="toggle(c)">{{c.activo? 'Deshabilitar':'Activar'}}</button>
            <button mat-button color="warn" (click)="eliminar(c)">Eliminar</button>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
      <mat-paginator [pageIndex]="page-1" [pageSize]="size" [pageSizeOptions]="[10,20,50]" (page)="onPage($event)" showFirstLastButtons></mat-paginator>
    </div>
  `
})
export class ClientsComponent {
  form = this.fb.group({
    id: [0],
    tipo_doc: ['DNI', Validators.required],
    nro_doc: ['', Validators.required],
    nombres: [''],
    apellidos: [''],
    razon_social: [''],
    direccion: [''],
    estado: [''],
    condicion: [''],
    plan_id: [null]
  })
  message = ''
  q = ''
  items: any[] = []
  validationOk = false
  validationMessage = ''
  page = 1
  size = 10
  sort = 'id'
  dir: 'asc' | 'desc' = 'desc'
  activoFilter: 'all' | '1' | '0' = 'all'
  plans: any[] = []
  showModal = false
  displayedColumns = ['id','nro_doc','nombre_razon','estado','condicion','activo','plan_nombre','acciones']
  constructor(private fb: FormBuilder, private http: HttpClient, private snack: MatSnackBar, private route: ActivatedRoute) {}
  ngOnInit() {
    this.load();
    this.loadPlans();
    this.route.queryParamMap.subscribe(p => { if (p.get('new') === '1') this.openModal() })
  }
  load() {
    const params = new URLSearchParams()
    params.set('q', this.q || '')
    params.set('page', String(this.page))
    params.set('size', String(this.size))
    params.set('sort', this.sort)
    params.set('dir', this.dir)
    params.set('activo', this.activoFilter)
    this.http.get<any[]>(`/clients?${params.toString()}`).subscribe(r => this.items = r)
  }
  loadPlans() { this.http.get<any[]>(`/plans?activo=1&size=100`).subscribe(r => this.plans = r) }
  firstPageAndLoad() { this.page = 1; this.load() }
  changeSize() { this.page = 1; this.load() }
  prev() { if (this.page>1) { this.page--; this.load() } }
  next() { if (this.items.length >= this.size) { this.page++; this.load() } }
  onPage(e: PageEvent) { this.page = e.pageIndex + 1; this.size = e.pageSize; this.load() }
  onSort(e: Sort) { this.sort = e.active; this.dir = e.direction === 'asc' ? 'asc' : 'desc'; this.firstPageAndLoad() }
  validar() {
    const { tipo_doc, nro_doc } = this.form.value as any
    this.validationMessage = ''
    this.validationOk = false
    this.http.post('/clients/resolve', { tipo_doc, nro_doc }).subscribe({
      next: (data: any) => { this.form.patchValue(data); this.validationOk = true; this.validationMessage = 'Datos autocompletados desde API Perú' },
      error: () => { this.validationOk = false; this.validationMessage = 'No se pudo validar' }
    })
  }
  openModal() {
    this.form.reset({ id: 0, tipo_doc: 'DNI', nro_doc: '', nombres: '', apellidos: '', razon_social: '', direccion: '', estado: '', condicion: '', plan_id: null })
    this.validationMessage = ''
    this.validationOk = false
    this.message = ''
    this.showModal = true
  }
  closeModal() {
    this.showModal = false
  }
  ngAfterViewInit() {
    this.form.controls.tipo_doc.valueChanges.subscribe(v => {
      if (v === 'DNI') {
        this.form.patchValue({ estado: '', condicion: '' })
      }
    })
  }
  save() {
    const v = this.form.value as any
    const id = Number(v.id || 0)
    const req = id ? this.http.put(`/clients/${id}`, v) : this.http.post('/clients', v)
    req.subscribe({
      next: (r: any) => {
        this.validationMessage = ''
        this.validationOk = false
        if (!id) this.form.patchValue({ id: r.id })
        this.load()
        this.closeModal()
        this.snack.open('Cliente guardado', 'OK', { duration: 2000 })
      },
      error: () => { this.message = 'Error'; this.snack.open('Error al guardar', 'Cerrar', { duration: 2500 }) }
    })
  }
  editar(c: any) {
    this.form.patchValue({ id: c.id, tipo_doc: c.tipo_doc, nro_doc: c.nro_doc, nombres: c.nombres, apellidos: c.apellidos, razon_social: c.razon_social, direccion: c.direccion, estado: c.estado, condicion: c.condicion, plan_id: c.plan_id || null })
    this.showModal = true
  }
  toggle(c: any) {
    this.http.patch(`/clients/${c.id}/toggle`, {}).subscribe({ next: () => { this.load(); this.snack.open('Estado actualizado', 'OK', { duration: 2000 }) } })
  }
  eliminar(c: any) {
    if (!confirm(`Eliminar cliente ${c.tipo_doc} ${c.nro_doc}?`)) return
    this.http.delete(`/clients/${c.id}`).subscribe({ next: () => { this.load(); this.snack.open('Cliente eliminado', 'OK', { duration: 2000 }) }, error: () => this.snack.open('No se pudo eliminar', 'Cerrar', { duration: 2500 }) })
  }
}
