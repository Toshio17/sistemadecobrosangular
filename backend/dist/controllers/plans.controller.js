"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPlans = listPlans;
exports.getPlan = getPlan;
exports.createOrUpdatePlan = createOrUpdatePlan;
exports.togglePlan = togglePlan;
exports.deletePlan = deletePlan;
const db_1 = require("../services/db");
async function listPlans(req, res) {
    const { q, page = '1', size = '10', sort = 'id', dir = 'desc', activo = 'all' } = req.query;
    const p = Number(page);
    const s = Number(size);
    const offset = (p - 1) * s;
    const like = q ? `%${q}%` : '%';
    const allowedSort = { id: 'id', nombre: 'nombre', precio: 'precio', periodo: 'periodo', activo: 'activo' };
    const sortCol = allowedSort[String(sort)] || 'id';
    const direction = String(dir).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const whereActivo = activo === '1' || activo === '0' ? 'activo = ?' : 'activo IN (0,1)';
    const params = [];
    if (whereActivo === 'activo = ?')
        params.push(Number(activo));
    params.push(like, like, s, offset);
    const sql = `SELECT id, nombre, precio, periodo, descripcion, activo FROM planes
               WHERE ${whereActivo} AND (nombre LIKE ? OR descripcion LIKE ?)
               ORDER BY ${sortCol} ${direction} LIMIT ? OFFSET ?`;
    const [rows] = await (0, db_1.getPool)().query(sql, params);
    res.json(rows);
}
async function getPlan(req, res) {
    const id = Number(req.params.id);
    const [rows] = await (0, db_1.getPool)().query('SELECT * FROM planes WHERE id=? LIMIT 1', [id]);
    const it = rows[0];
    if (!it)
        return res.status(404).json({ error: 'not_found' });
    res.json(it);
}
async function createOrUpdatePlan(req, res) {
    const id = req.params.id ? Number(req.params.id) : 0;
    const { nombre, precio, periodo, descripcion } = req.body;
    if (!nombre || !precio || !periodo)
        return res.status(400).json({ error: 'invalid_input' });
    if (id) {
        await (0, db_1.getPool)().query('UPDATE planes SET nombre=?, precio=?, periodo=?, descripcion=? WHERE id=?', [nombre, precio, periodo, descripcion || null, id]);
        res.json({ id });
    }
    else {
        const [r] = await (0, db_1.getPool)().query('INSERT INTO planes(nombre, precio, periodo, descripcion, activo) VALUES (?,?,?,?,1)', [nombre, precio, periodo, descripcion || null]);
        const insertId = r.insertId;
        res.status(201).json({ id: insertId });
    }
}
async function togglePlan(req, res) {
    const id = Number(req.params.id);
    const [rows] = await (0, db_1.getPool)().query('SELECT activo FROM planes WHERE id=?', [id]);
    const it = rows[0];
    if (!it)
        return res.status(404).json({ error: 'not_found' });
    const next = it.activo ? 0 : 1;
    await (0, db_1.getPool)().query('UPDATE planes SET activo=? WHERE id=?', [next, id]);
    res.json({ id, activo: next });
}
async function deletePlan(req, res) {
    const id = Number(req.params.id);
    const [rows] = await (0, db_1.getPool)().query('SELECT id FROM planes WHERE id=? LIMIT 1', [id]);
    const it = rows[0];
    if (!it)
        return res.status(404).json({ error: 'not_found' });
    await (0, db_1.getPool)().query('DELETE FROM planes WHERE id=?', [id]);
    res.status(204).end();
}
