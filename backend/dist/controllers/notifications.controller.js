"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMassToMorosos = sendMassToMorosos;
exports.listLogs = listLogs;
const db_1 = require("../services/db");
const notifications_service_1 = require("../services/notifications.service");
async function sendMassToMorosos(req, res) {
    const { dias } = req.body;
    const d = Number(dias || 30);
    const [rows] = await (0, db_1.getPool)().query(`SELECT m.id as mensualidadId, m.cliente_id as clienteId, c.nombres, c.apellidos, c.nro_doc, m.monto
     FROM mensualidades m JOIN clientes c ON c.id=m.cliente_id
     WHERE m.estado='vencido' AND DATEDIFF(CURDATE(), m.fecha_vencimiento) >= ?`, [d]);
    const items = rows;
    const results = [];
    for (const it of items) {
        try {
            await (0, notifications_service_1.sendPaymentNotification)({ clienteId: it.clienteId, clienteNombre: `${it.nombres} ${it.apellidos}`, nroDoc: it.nro_doc, mensualidadId: it.mensualidadId, monto: it.monto });
            results.push({ mensualidadId: it.mensualidadId, status: 'sent' });
        }
        catch {
            results.push({ mensualidadId: it.mensualidadId, status: 'failed' });
        }
    }
    res.json({ count: results.length, results });
}
async function listLogs(_req, res) {
    const [rows] = await (0, db_1.getPool)().query('SELECT id, type, destinatario, payload, status, created_at FROM notification_logs ORDER BY id DESC LIMIT 200');
    res.json(rows);
}
