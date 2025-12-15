"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchDni = fetchDni;
exports.fetchRuc = fetchRuc;
const axios_1 = __importDefault(require("axios"));
const base = 'https://apiperu.dev/api';
function headers() {
    return { Authorization: `Bearer ${process.env.APIPERU_TOKEN}` };
}
async function fetchDni(dni) {
    const url = `${base}/dni/${dni}`;
    try {
        const r = await axios_1.default.get(url, { headers: headers() });
        return r.data?.data || null;
    }
    catch {
        return null;
    }
}
async function fetchRuc(ruc) {
    const url = `${base}/ruc/${ruc}`;
    try {
        const r = await axios_1.default.get(url, { headers: headers() });
        return r.data?.data || null;
    }
    catch {
        return null;
    }
}
