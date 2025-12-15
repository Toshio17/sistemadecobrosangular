import { Request, Response } from 'express'
import { getPool } from '../services/db'

export async function metrics(_req: Request, res: Response) {
  const [vencidasRows] = await getPool().query("SELECT COUNT(*) as c FROM mensualidades WHERE estado='vencido'")
  const [totalMesRows] = await getPool().query("SELECT COALESCE(SUM(monto_pagado),0) as s FROM mensualidades WHERE estado='pagado' AND MONTH(fecha_pago)=MONTH(CURDATE()) AND YEAR(fecha_pago)=YEAR(CURDATE())")
  const [recientesRows] = await getPool().query("SELECT id, cliente_id, monto_pagado, fecha_pago FROM mensualidades WHERE estado='pagado' ORDER BY fecha_pago DESC LIMIT 10")
  const [m30] = await getPool().query("SELECT COUNT(*) as c FROM mensualidades WHERE estado='vencido' AND DATEDIFF(CURDATE(), fecha_vencimiento) BETWEEN 30 AND 59")
  const [m60] = await getPool().query("SELECT COUNT(*) as c FROM mensualidades WHERE estado='vencido' AND DATEDIFF(CURDATE(), fecha_vencimiento) BETWEEN 60 AND 89")
  const [m90] = await getPool().query("SELECT COUNT(*) as c FROM mensualidades WHERE estado='vencido' AND DATEDIFF(CURDATE(), fecha_vencimiento) >= 90")
  res.json({
    deudas_vencidas: (vencidasRows as any[])[0]?.c || 0,
    total_mes: (totalMesRows as any[])[0]?.s || 0,
    pagos_recientes: recientesRows,
    morosos: [ (m30 as any[])[0]?.c || 0, (m60 as any[])[0]?.c || 0, (m90 as any[])[0]?.c || 0 ]
  })
}
