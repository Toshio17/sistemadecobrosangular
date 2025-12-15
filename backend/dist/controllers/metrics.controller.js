"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metrics = metrics;
const db_1 = require("../services/db");
async function metrics(_req, res) {
    const [vencidasRows] = await (0, db_1.getPool)().query("SELECT COUNT(*) as c FROM mensualidades WHERE estado='vencido'");
    const [totalMesRows] = await (0, db_1.getPool)().query("SELECT COALESCE(SUM(monto_pagado),0) as s FROM mensualidades WHERE estado='pagado' AND MONTH(fecha_pago)=MONTH(CURDATE()) AND YEAR(fecha_pago)=YEAR(CURDATE())");
    const [recientesRows] = await (0, db_1.getPool)().query("SELECT id, cliente_id, monto_pagado, fecha_pago FROM mensualidades WHERE estado='pagado' ORDER BY fecha_pago DESC LIMIT 10");
    const [m30] = await (0, db_1.getPool)().query("SELECT COUNT(*) as c FROM mensualidades WHERE estado='vencido' AND DATEDIFF(CURDATE(), fecha_vencimiento) BETWEEN 30 AND 59");
    const [m60] = await (0, db_1.getPool)().query("SELECT COUNT(*) as c FROM mensualidades WHERE estado='vencido' AND DATEDIFF(CURDATE(), fecha_vencimiento) BETWEEN 60 AND 89");
    const [m90] = await (0, db_1.getPool)().query("SELECT COUNT(*) as c FROM mensualidades WHERE estado='vencido' AND DATEDIFF(CURDATE(), fecha_vencimiento) >= 90");
    res.json({
        deudas_vencidas: vencidasRows[0]?.c || 0,
        total_mes: totalMesRows[0]?.s || 0,
        pagos_recientes: recientesRows,
        morosos: [m30[0]?.c || 0, m60[0]?.c || 0, m90[0]?.c || 0]
    });
}
