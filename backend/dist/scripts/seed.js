"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const db_1 = require("../services/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function run() {
    const username = process.env.SEED_ADMIN_USER || 'admin';
    const password = process.env.SEED_ADMIN_PASS || 'admin123';
    const hash = await bcryptjs_1.default.hash(password, 10);
    await (0, db_1.getPool)().query('INSERT IGNORE INTO users(username, password_hash, role, active) VALUES (?,?,?,1)', [username, hash, 'admin']);
    process.exit(0);
}
run();
