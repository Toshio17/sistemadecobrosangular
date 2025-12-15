"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMensualidades = listMensualidades;
exports.createMensualidad = createMensualidad;
exports.markPago = markPago;
exports.createPagoDirecto = createPagoDirecto;
exports.exportCsv = exportCsv;
exports.markVencidos = markVencidos;
const db_1 = require("../services/db");
const notifications_service_1 = require("../services/notifications.service");
async function listMensualidades(req, res) {
    const { cliente_id } = req.query;
    const where = cliente_id ? 'WHERE m.cliente_id=?' : '';
    const params = cliente_id ? [Number(cliente_id)] : [];
    const [rows] = await (0, db_1.getPool)().query(`SELECT m.id, m.cliente_id, c.tipo_doc, c.nombres, c.apellidos, c.razon_social, m.monto, m.recargo, m.descuento, m.fecha_vencimiento, m.estado, m.fecha_pago, m.monto_pagado, m.metodo_pago
     FROM mensualidades m JOIN clientes c ON c.id=m.cliente_id ${where} ORDER BY m.id DESC`, params);
    res.json(rows);
}
async function createMensualidad(req, res) {
    const { cliente_id, monto, fecha_vencimiento, recargo = 0, descuento = 0 } = req.body;
    if (!cliente_id || !monto || !fecha_vencimiento)
        return res.status(400).json({ error: 'invalid_input' });
    const [r] = await (0, db_1.getPool)().query('INSERT INTO mensualidades(cliente_id, monto, recargo, descuento, fecha_vencimiento, estado) VALUES (?,?,?,?,?,?)', [cliente_id, monto, recargo, descuento, fecha_vencimiento, 'pendiente']);
    const id = r.insertId;
    res.status(201).json({ id });
}
async function markPago(req, res) {
    const id = Number(req.params.id);
    const { monto_pagado, fecha_pago, metodo_pago } = req.body;
    const [rows] = await (0, db_1.getPool)().query('SELECT m.*, c.nro_doc, c.nombres, c.apellidos FROM mensualidades m JOIN clientes c ON c.id=m.cliente_id WHERE m.id=?', [id]);
    const m = rows[0];
    if (!m)
        return res.status(404).json({ error: 'not_found' });
    await (0, db_1.getPool)().query('UPDATE mensualidades SET estado=?, fecha_pago=?, monto_pagado=?, metodo_pago=? WHERE id=?', ['pagado', fecha_pago, monto_pagado, metodo_pago || null, id]);
    const nombre = (m.nombres && m.apellidos) ? `${m.nombres} ${m.apellidos}` : (m.razon_social || '');
    await (0, notifications_service_1.sendPaymentNotification)({ clienteId: m.cliente_id, clienteNombre: nombre, nroDoc: m.nro_doc, mensualidadId: id, monto: monto_pagado });
    res.json({ id });
}
async function createPagoDirecto(req, res) {
    const { cliente_id, monto_pagado, fecha_pago, metodo_pago } = req.body;
    if (!cliente_id || !monto_pagado || !fecha_pago || !metodo_pago)
        return res.status(400).json({ error: 'invalid_input' });
    const [r] = await (0, db_1.getPool)().query('INSERT INTO mensualidades(cliente_id, monto, recargo, descuento, fecha_vencimiento, estado, fecha_pago, monto_pagado, metodo_pago) VALUES (?,?,?,?,?,?,?,?,?)', [cliente_id, monto_pagado, 0, 0, fecha_pago, 'pagado', fecha_pago, monto_pagado, metodo_pago]);
    const id = r.insertId;
    const [rows] = await (0, db_1.getPool)().query('SELECT c.nro_doc, c.nombres, c.apellidos, c.razon_social FROM clientes c WHERE c.id=?', [cliente_id]);
    const c = rows[0];
    if (c) {
        const nombre = (c.nombres && c.apellidos) ? `${c.nombres} ${c.apellidos}` : (c.razon_social || '');
        await (0, notifications_service_1.sendPaymentNotification)({ clienteId: cliente_id, clienteNombre: nombre, nroDoc: c.nro_doc, mensualidadId: id, monto: monto_pagado });
    }
    res.status(201).json({ id });
}
async function exportCsv(_req, res) {
    const [rows] = await (0, db_1.getPool)().query(`SELECT m.id, m.cliente_id, c.tipo_doc, c.nro_doc, c.nombres, c.apellidos, c.razon_social, m.monto, m.recargo, m.descuento, m.fecha_vencimiento, m.estado, m.fecha_pago, m.monto_pagado, m.metodo_pago
     FROM mensualidades m JOIN clientes c ON c.id=m.cliente_id ORDER BY m.id DESC`);
    const items = rows;
    function fmtDate(d) {
        if (!d)
            return '';
        const date = d instanceof Date ? d : new Date(d);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }
    function esc(v) {
        const s = String(v ?? '');
        return `"${s.replace(/"/g, '""')}"`;
    }
    const sep = ';';
    const header = ['ID', 'Cliente ID', 'Tipo Doc', 'Nro Doc', 'Nombre/Razón', 'Monto', 'Recargo', 'Descuento', 'Vencimiento', 'Estado', 'Fecha Pago', 'Monto Pagado', 'Método'];
    const lines = [header.join(sep)];
    for (const it of items) {
        const nombre = it.tipo_doc === 'DNI'
            ? `${it.nombres || ''} ${it.apellidos || ''}`.trim()
            : (it.razon_social || '');
        const line = [
            it.id, it.cliente_id, it.tipo_doc || '', esc(it.nro_doc),
            esc(nombre),
            it.monto, it.recargo, it.descuento,
            fmtDate(it.fecha_vencimiento),
            it.estado,
            fmtDate(it.fecha_pago),
            it.monto_pagado ?? '',
            it.metodo_pago || ''
        ].join(sep);
        lines.push(line);
    }
    const csv = '\uFEFF' + lines.join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="mensualidades.csv"');
    res.send(csv);
}
async function markVencidos(_req, res) {
    const [r] = await (0, db_1.getPool)().query("UPDATE mensualidades SET estado='vencido' WHERE estado='pendiente' AND fecha_vencimiento < CURDATE()");
    res.json({ affected: r.affectedRows || 0 });
}
