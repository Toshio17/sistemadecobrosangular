"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listClients = listClients;
exports.getClient = getClient;
exports.createOrUpdateClient = createOrUpdateClient;
exports.toggleClient = toggleClient;
exports.deleteClient = deleteClient;
exports.resolveClient = resolveClient;
const db_1 = require("../services/db");
const apiperu_service_1 = require("../services/apiperu.service");
function formatDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}
async function ensureMensualidadForPlan(clienteId, planId) {
    if (!planId)
        return;
    const [pr] = await (0, db_1.getPool)().query('SELECT precio, periodo FROM planes WHERE id=?', [planId]);
    const plan = pr[0];
    if (!plan)
        return;
    const now = new Date();
    let due = new Date();
    if (plan.periodo === 'mensual') {
        const firstNext = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        due = new Date(firstNext.getTime() - 86400000);
    }
    else {
        due = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    }
    const fecha = formatDate(due);
    const [existRows] = await (0, db_1.getPool)().query('SELECT id FROM mensualidades WHERE cliente_id=? AND estado=? AND fecha_vencimiento>=CURDATE() LIMIT 1', [clienteId, 'pendiente']);
    const exist = existRows[0];
    if (!exist) {
        await (0, db_1.getPool)().query('INSERT INTO mensualidades(cliente_id, monto, fecha_vencimiento, estado) VALUES (?,?,?,?)', [clienteId, plan.precio, fecha, 'pendiente']);
    }
}
async function listClients(req, res) {
    const { q, page = '1', size = '10', sort = 'id', dir = 'desc', activo = 'all' } = req.query;
    const p = Number(page);
    const s = Number(size);
    const offset = (p - 1) * s;
    const like = q ? `%${q}%` : '%';
    const allowedSort = {
        id: 'c.id',
        nro_doc: 'c.nro_doc',
        nombres: 'c.nombres',
        apellidos: 'c.apellidos',
        razon_social: 'c.razon_social',
        estado: 'c.estado',
        condicion: 'c.condicion',
        activo: 'c.activo',
        plan_nombre: 'p.nombre'
    };
    const sortCol = allowedSort[String(sort)] || 'id';
    const direction = String(dir).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const params = [];
    const whereActivo = activo === '1' || activo === '0' ? 'c.activo = ?' : 'c.activo IN (0,1)';
    if (whereActivo === 'c.activo = ?')
        params.push(Number(activo));
    params.push(like, like, like, like, s, offset);
    const sql = `SELECT c.id, c.tipo_doc, c.nro_doc, c.nombres, c.apellidos, c.razon_social, c.direccion, c.estado, c.condicion, c.activo, c.plan_id, p.nombre as plan_nombre
               FROM clientes c
               LEFT JOIN planes p ON p.id=c.plan_id
               WHERE ${whereActivo} AND (c.nombres LIKE ? OR c.apellidos LIKE ? OR c.razon_social LIKE ? OR c.nro_doc LIKE ?)
               ORDER BY ${sortCol} ${direction}
               LIMIT ? OFFSET ?`;
    const [rows] = await (0, db_1.getPool)().query(sql, params);
    res.json(rows);
}
async function getClient(req, res) {
    const id = Number(req.params.id);
    const [rows] = await (0, db_1.getPool)().query('SELECT * FROM clientes WHERE id=? LIMIT 1', [id]);
    const c = rows[0];
    if (!c)
        return res.status(404).json({ error: 'not_found' });
    res.json(c);
}
async function createOrUpdateClient(req, res) {
    const id = req.params.id ? Number(req.params.id) : 0;
    const { tipo_doc, nro_doc, plan_id } = req.body;
    if (!tipo_doc || !nro_doc)
        return res.status(400).json({ error: 'invalid_input' });
    let data = null;
    if (tipo_doc === 'DNI')
        data = await (0, apiperu_service_1.fetchDni)(nro_doc);
    if (tipo_doc === 'RUC')
        data = await (0, apiperu_service_1.fetchRuc)(nro_doc);
    if (!data)
        return res.status(422).json({ error: 'not_resolved' });
    const nombres = data.nombres || '';
    const apellidos = data.apellido_paterno && data.apellido_materno ? `${data.apellido_paterno} ${data.apellido_materno}` : '';
    const razon = data.razon_social || data.nombre_o_razon_social || data.nombre || data.razonSocial || data.nombreRazonSocial || data.nombre_razon_social || '';
    const direccion = data.direccion || '';
    const estado = data.estado || '';
    const condicion = data.condicion || '';
    if (id) {
        const [prevRows] = await (0, db_1.getPool)().query('SELECT plan_id FROM clientes WHERE id=?', [id]);
        const prev = prevRows[0];
        await (0, db_1.getPool)().query('UPDATE clientes SET tipo_doc=?, nro_doc=?, nombres=?, apellidos=?, razon_social=?, direccion=?, estado=?, condicion=?, plan_id=? WHERE id=?', [tipo_doc, nro_doc, nombres, apellidos, razon, direccion, estado, condicion, plan_id || null, id]);
        if (plan_id && (!prev || prev.plan_id !== plan_id)) {
            await ensureMensualidadForPlan(id, plan_id);
        }
        res.json({ id });
    }
    else {
        const [r] = await (0, db_1.getPool)().query('INSERT INTO clientes(tipo_doc, nro_doc, nombres, apellidos, razon_social, direccion, estado, condicion, plan_id, activo) VALUES (?,?,?,?,?,?,?,?,?,1)', [tipo_doc, nro_doc, nombres, apellidos, razon, direccion, estado, condicion, plan_id || null]);
        const insertId = r.insertId;
        if (plan_id) {
            await ensureMensualidadForPlan(insertId, plan_id);
        }
        res.status(201).json({ id: insertId });
    }
}
async function toggleClient(req, res) {
    const id = Number(req.params.id);
    const [rows] = await (0, db_1.getPool)().query('SELECT activo FROM clientes WHERE id=?', [id]);
    const c = rows[0];
    if (!c)
        return res.status(404).json({ error: 'not_found' });
    const next = c.activo ? 0 : 1;
    await (0, db_1.getPool)().query('UPDATE clientes SET activo=? WHERE id=?', [next, id]);
    res.json({ id, activo: next });
}
async function deleteClient(req, res) {
    const id = Number(req.params.id);
    const [rows] = await (0, db_1.getPool)().query('SELECT id FROM clientes WHERE id=? LIMIT 1', [id]);
    const c = rows[0];
    if (!c)
        return res.status(404).json({ error: 'not_found' });
    await (0, db_1.getPool)().query('DELETE FROM clientes WHERE id=?', [id]);
    res.status(204).end();
}
async function resolveClient(req, res) {
    const { tipo_doc, nro_doc } = req.body;
    if (!tipo_doc || !nro_doc)
        return res.status(400).json({ error: 'invalid_input' });
    let data = null;
    if (tipo_doc === 'DNI')
        data = await (0, apiperu_service_1.fetchDni)(nro_doc);
    if (tipo_doc === 'RUC')
        data = await (0, apiperu_service_1.fetchRuc)(nro_doc);
    if (!data)
        return res.status(422).json({ error: 'not_resolved' });
    const payload = {
        tipo_doc,
        nro_doc,
        nombres: data.nombres || '',
        apellidos: data.apellido_paterno && data.apellido_materno ? `${data.apellido_paterno} ${data.apellido_materno}` : '',
        razon_social: data.razon_social || data.nombre_o_razon_social || data.nombre || data.razonSocial || data.nombreRazonSocial || data.nombre_razon_social || '',
        direccion: data.domicilio_fiscal || data.direccion || '',
        estado: data.estado || '',
        condicion: data.condicion || ''
    };
    res.json(payload);
}
