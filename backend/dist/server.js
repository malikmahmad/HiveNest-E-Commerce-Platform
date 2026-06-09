"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("express-async-errors");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
const logger_1 = require("./utils/logger");
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
// ─── SECURITY ────────────────────────────────────────────────
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use((0, cors_1.default)({
    origin: config_1.config.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));
// ─── MIDDLEWARE ───────────────────────────────────────────────
app.use((0, morgan_1.default)(config_1.config.isProd ? 'combined' : 'dev'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
// ─── STATIC FILES (uploaded images) ──────────────────────────
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
// ─── HEALTH CHECK ─────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'OK', env: config_1.config.nodeEnv, timestamp: new Date().toISOString() }));
// ─── API ROUTES ───────────────────────────────────────────────
app.use('/api/v1', routes_1.default);
// ─── ERROR HANDLING ───────────────────────────────────────────
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
// ─── START SERVER ─────────────────────────────────────────────
const PORT = process.env.PORT || config_1.config.port;
app.listen(PORT, () => {
    logger_1.logger.info(`🚀 HiveNest API running on port ${PORT} [${config_1.config.nodeEnv}]`);
});
exports.default = app;
//# sourceMappingURL=server.js.map