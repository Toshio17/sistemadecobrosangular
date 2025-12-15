"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const metrics_controller_1 = require("../controllers/metrics.controller");
const r = (0, express_1.Router)();
r.use(auth_1.authenticate);
r.get('/metrics', (0, auth_1.authorize)(['admin', 'cobrador', 'supervisor']), metrics_controller_1.metrics);
exports.default = r;
