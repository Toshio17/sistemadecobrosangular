"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorize = authorize;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authenticate(req, res, next) {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token)
        return res.status(401).json({ error: 'unauthorized' });
    try {
        const payload = jsonwebtoken_1.default.verify(token, String(process.env.JWT_SECRET));
        req.user = payload;
        next();
    }
    catch {
        res.status(401).json({ error: 'invalid_token' });
    }
}
function authorize(roles) {
    return (req, res, next) => {
        const user = req.user;
        if (!user)
            return res.status(401).json({ error: 'unauthorized' });
        if (!roles.includes(user.role))
            return res.status(403).json({ error: 'forbidden' });
        next();
    };
}
