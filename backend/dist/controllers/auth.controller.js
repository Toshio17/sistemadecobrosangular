"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.register = register;
const db_1 = require("../services/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
async function login(req, res) {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ error: 'invalid_input' });
    const [rows] = await (0, db_1.getPool)().query('SELECT id, username, password_hash, role FROM users WHERE username=? AND active=1 LIMIT 1', [username]);
    const user = rows[0];
    if (!user)
        return res.status(401).json({ error: 'invalid_credentials' });
    const ok = await bcryptjs_1.default.compare(password, user.password_hash);
    if (!ok)
        return res.status(401).json({ error: 'invalid_credentials' });
    const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, role: user.role }, String(process.env.JWT_SECRET), { expiresIn: '8h' });
    res.json({ token, role: user.role, username: user.username });
}
async function register(req, res) {
    const { username, password, role } = req.body;
    if (!username || !password || !role)
        return res.status(400).json({ error: 'invalid_input' });
    const validRoles = ['admin', 'cobrador', 'supervisor'];
    if (!validRoles.includes(role))
        return res.status(400).json({ error: 'invalid_role' });
    try {
        const salt = await bcryptjs_1.default.genSalt(10);
        const hash = await bcryptjs_1.default.hash(password, salt);
        await (0, db_1.getPool)().query('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', [username, hash, role]);
        res.json({ success: true });
    }
    catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'username_exists' });
        }
        console.error(err);
        res.status(500).json({ error: 'server_error' });
    }
}
