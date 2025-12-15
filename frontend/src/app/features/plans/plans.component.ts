import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatButtonModule } from '@angular/material/button'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator'
import { MatSortModule, Sort } from '@angular/material/sort'
import { MatIconModule } from '@angular/material/icon'

@Component({
  standalone: true,
  selector: 'app-plans',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatSnackBarModule, MatTableModule, MatPaginatorModule, MatSortModule, MatIconModule],
  template: `
    <div style="padding:24px">
      <h2>Planes</h2>
      <div *ngIf="showModal" style="position:fixed;inset:0;background:rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;z-index:1000">
        <div style="background:#fff;padding:16px;border-radius:6px;min-width:640px;max-width:90vw">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <h3 style="margin:0">{{form.value.id ? 'Editar Plan' : 'Nuevo Plan'}}</h3>
            <button mat-icon-button (click)="closeModal()"><mat-icon>close</mat-icon></button>
          </div>
          <form [formGroup]="form" (ngSubmit)="save()" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;align-items:end">
            <input type="hidden" formControlName="id" />
            <mat-form-field>
              <mat-label>Nombre</mat-label>
              <input matInput formControlName="nombre" />
            </mat-form-field>
            <mat-form-field>
              <mat-label>Precio</mat-label>
              <input matInput formControlName="precio" type="number" step="0.01" />
            </mat-form-field>
            <mat-form-field>
              <mat-label>Periodo</mat-label>
              <mat-select formControlName="periodo">
                <mat-option value="mensual">Mensual</mat-option>
                <mat-option value="anual">Anual</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field style="grid-column:1/-1">
              <mat-label>Descripción</mat-label>
              <input matInput formControlName="descripcion" />
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
          <td mat-cell *matCellDef="let it">{{it.id}}</td>
        </ng-container>
        <ng-container matColumnDef="nombre">
          <th mat-header-cell *matHeaderCellDef mat-sort-header="nombre">Nombre</th>
          <td mat-cell *matCellDef="let it">{{it.nombre}}</td>
        </ng-container>
        <ng-container matColumnDef="precio">
          <th mat-header-cell *matHeaderCellDef mat-sort-header="precio">Precio</th>
          <td mat-cell *matCellDef="let it">{{it.precio}}</td>
        </ng-container>
        <ng-container matColumnDef="periodo">
          <th mat-header-cell *matHeaderCellDef mat-sort-header="periodo">Periodo</th>
          <td mat-cell *matCellDef="let it">{{it.periodo}}</td>
        </ng-container>
        <ng-container matColumnDef="descripcion">
          <th mat-header-cell *matHeaderCellDef>Descripción</th>
          <td mat-cell *matCellDef="let it">{{it.descripcion}}</td>
        </ng-container>
        <ng-container matColumnDef="activo">
          <th mat-header-cell *matHeaderCellDef mat-sort-header="activo">Activo</th>
          <td mat-cell *matCellDef="let it">{{it.activo? 'Sí':'No'}}</td>
        </ng-container>
        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef>Acciones</th>
          <td mat-cell *matCellDef="let it">
            <button mat-button color="primary" (click)="editar(it)">Editar</button>
            <button mat-button (click)="toggle(it)">{{it.activo? 'Deshabilitar':'Activar'}}</button>
            <button mat-button color="warn" (click)="eliminar(it)">Eliminar</button>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
      <mat-paginator [pageIndex]="page-1" [pageSize]="size" [pageSizeOptions]="[10,20,50]" (page)="onPage($event)" showFirstLastButtons></mat-paginator>
    </div>
  `
})
export class PlansComponent {
  form = this.fb.group({ id: [0], nombre: ['', Validators.required], precio: [0, Validators.required], periodo: ['mensual', Validators.required], descripcion: [''] })
  message = ''
  q = ''
  items: any[] = []
  page = 1
  size = 10
  sort = 'id'
  dir: 'asc' | 'desc' = 'desc'
  activoFilter: 'all' | '1' | '0' = 'all'
  displayedColumns = ['id','nombre','precio','periodo','descripcion','activo','acciones']
  showModal = false
  constructor(private fb: FormBuilder, private http: HttpClient, private snack: MatSnackBar) {}
  ngOnInit() { this.load() }
  load() {
    const params = new URLSearchParams()
    params.set('q', this.q || '')
    params.set('page', String(this.page))
    params.set('size', String(this.size))
    params.set('sort', this.sort)
    params.set('dir', this.dir)
    params.set('activo', this.activoFilter)
    this.http.get<any[]>(`/plans?${params.toString()}`).subscribe(r => this.items = r)
  }
  firstPageAndLoad() { this.page = 1; this.load() }
  changeSize() { this.page = 1; this.load() }
  prev() { if (this.page>1) { this.page--; this.load() } }
  next() { if (this.items.length >= this.size) { this.page++; this.load() } }
  onPage(e: PageEvent) { this.page = e.pageIndex + 1; this.size = e.pageSize; this.load() }
  onSort(e: Sort) { this.sort = e.active; this.dir = e.direction === 'asc' ? 'asc' : 'desc'; this.firstPageAndLoad() }
  openModal() {
    this.form.reset({ id: 0, nombre: '', precio: 0, periodo: 'mensual', descripcion: '' })
    this.message = ''
    this.showModal = true
  }
  closeModal() { this.showModal = false }
  save() {
    const v = this.form.value as any
    const id = Number(v.id || 0)
    const req = id ? this.http.put(`/plans/${id}`, v) : this.http.post('/plans', v)
    req.subscribe({
      next: (_r: any) => {
        this.message = ''
        this.closeModal()
        this.load()
        this.snack.open('Plan guardado', 'OK', { duration: 2000 })
      },
      error: () => { this.message = 'Error'; this.snack.open('Error al guardar', 'Cerrar', { duration: 2500 }) }
    })
  }
  editar(it: any) { this.form.patchValue({ id: it.id, nombre: it.nombre, precio: it.precio, periodo: it.periodo, descripcion: it.descripcion }); this.showModal = true }
  toggle(it: any) { this.http.patch(`/plans/${it.id}/toggle`, {}).subscribe({ next: () => { this.load(); this.snack.open('Estado actualizado', 'OK', { duration: 2000 }) } }) }
  eliminar(it: any) { if (!confirm(`Eliminar plan ${it.nombre}?`)) return; this.http.delete(`/plans/${it.id}`).subscribe({ next: () => { this.load(); this.snack.open('Plan eliminado', 'OK', { duration: 2000 }) }, error: () => this.snack.open('No se pudo eliminar', 'Cerrar', { duration: 2500 }) }) }
}
