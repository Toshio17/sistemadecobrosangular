"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const clients_routes_1 = __importDefault(require("./routes/clients.routes"));
const payments_routes_1 = __importDefault(require("./routes/payments.routes"));
const payments_metrics_routes_1 = __importDefault(require("./routes/payments.metrics.routes"));
const notifications_routes_1 = __importDefault(require("./routes/notifications.routes"));
const plans_routes_1 = __importDefault(require("./routes/plans.routes"));
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
exports.app.use('/auth', auth_routes_1.default);
exports.app.use('/clients', clients_routes_1.default);
exports.app.use('/payments', payments_routes_1.default);
exports.app.use('/payments', payments_metrics_routes_1.default);
exports.app.use('/notifications', notifications_routes_1.default);
exports.app.use('/plans', plans_routes_1.default);
exports.app.get('/health', (_req, res) => {
    res.json({ ok: true });
});
