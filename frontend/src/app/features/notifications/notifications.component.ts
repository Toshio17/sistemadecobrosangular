import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'
import { AuthService } from '../../core/auth.service'

@Component({
  standalone: true,
  selector: 'app-notifications',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div style="padding:24px">
      <h2>Notificaciones</h2>
      <div style="display:flex;gap:12px;align-items:end;flex-wrap:wrap">
        <mat-form-field>
          <mat-label>Días morosos</mat-label>
          <input matInput [(ngModel)]="dias" type="number" />
        </mat-form-field>
        <div>
          <button mat-raised-button color="primary" (click)="enviarMasivo()" [disabled]="!canSuper()">Enviar masivo</button>
        </div>
        <div style="margin-left:auto">
          <button mat-button (click)="loadLogs()" [disabled]="!canSuper()">Actualizar Logs</button>
        </div>
      </div>
      <table border="1" cellpadding="6" style="margin-top:12px;width:100%">
        <tr>
          <th>ID</th>
          <th>Tipo</th>
          <th>Destinatario</th>
          <th>Payload</th>
          <th>Estado</th>
          <th>Fecha</th>
        </tr>
        <tr *ngFor="let n of logs">
          <td>{{n.id}}</td>
          <td>{{n.type}}</td>
          <td>{{n.destinatario}}</td>
          <td>{{n.payload}}</td>
          <td>{{n.status}}</td>
          <td>{{n.created_at}}</td>
        </tr>
      </table>
    </div>
  `
})
export class NotificationsComponent {
  dias = 30
  logs: any[] = []
  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.loadLogs() }
  canSuper() { return this.auth.role === 'admin' || this.auth.role === 'supervisor' }
  enviarMasivo() {
    this.http.post('/notifications/morosos/mass', { dias: this.dias }).subscribe({ next: () => this.loadLogs() })
  }
  loadLogs() {
    this.http.get<any[]>('/notifications/logs').subscribe(r => this.logs = r)
  }
}
