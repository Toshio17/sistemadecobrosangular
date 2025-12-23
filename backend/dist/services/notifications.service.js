"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPaymentNotification = sendPaymentNotification;
const axios_1 = __importDefault(require("axios"));
const db_1 = require("./db");
async function postWasapi(path, body) {
    if (!process.env.WASAPI_URL || !process.env.WASAPI_TOKEN) {
        console.warn('WASAPI credentials not found, skipping notification');
        return null;
    }
    const url = `${process.env.WASAPI_URL}${path}`;
    const r = await axios_1.default.post(url, body, { headers: { Authorization: `Bearer ${process.env.WASAPI_TOKEN}` } });
    return r.data;
}
async function sendPaymentNotification(p) {
    const payload = { type: 'payment', clienteId: p.clienteId, mensualidadId: p.mensualidadId, monto: p.monto, nombre: p.clienteNombre, nroDoc: p.nroDoc };
    let attempt = 0;
    let lastErr = null;
    while (attempt < 3) {
        try {
            await postWasapi('/whatsapp/send', payload);
            await (0, db_1.getPool)().query('INSERT INTO notification_logs(type, destinatario, payload, status) VALUES (?,?,?,?)', ['payment', p.clienteNombre, JSON.stringify(payload), 'sent']);
            return true;
        }
        catch (err) {
            lastErr = err;
            await (0, db_1.getPool)().query('INSERT INTO notification_logs(type, destinatario, payload, status) VALUES (?,?,?,?)', ['payment', p.clienteNombre, JSON.stringify(payload), 'failed']);
            await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
            attempt++;
        }
    }
    throw lastErr;
}
