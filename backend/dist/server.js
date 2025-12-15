"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = require("./app");
const db_1 = require("./services/db");
const port = Number(process.env.PORT || 4000);
async function start() {
    try {
        await (0, db_1.getPool)().query('SELECT 1');
        app_1.app.listen(port, () => { });
    }
    catch (err) {
        process.exit(1);
    }
}
start();
