import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { config } from './config';
import { logger } from './utils/logger';
import routes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

app.use(morgan(config.isProd ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/health', (_, res) =>
  res.json({ status: 'OK', env: config.nodeEnv, timestamp: new Date().toISOString() })
);

app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || config.port;
app.listen(PORT, () => {
  logger.info(`HiveNest API running on port ${PORT} [${config.nodeEnv}]`);
});

export default app;
