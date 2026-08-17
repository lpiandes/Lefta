import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import path from 'path';
import { accountsRouter } from './routes/accounts';
import { actionsRouter } from './routes/actions';
import { authRouter } from './routes/auth';
import { legalRouter } from './routes/legal';
import { stripeWebhook } from './routes/billing';
import { opportunitiesRouter } from './routes/opportunities';
import { scanRouter } from './routes/scan';
import { userRouter } from './routes/user';
import { loadConfig, plaidIsConfigured, stripeIsConfigured } from './lib/config';
import { errorHandler } from './middleware/asyncHandler';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const config = loadConfig();
const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (config.corsOrigins.includes('*') || config.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
  }),
);
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  void stripeWebhook(req, res);
});
app.use(express.json({ limit: '32kb' }));

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'find-money-api',
    persistence: config.databaseUrl ? 'postgres' : 'memory',
    plaid: plaidIsConfigured(config),
    stripe: stripeIsConfigured(config),
  });
});

app.use('/api/legal', legalRouter);
app.use('/api/auth', authRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/scan', scanRouter);
app.use('/api/opportunities', opportunitiesRouter);
app.use('/api/actions', actionsRouter);
app.use('/api/user', userRouter);
app.use(errorHandler);

if (require.main === module) {
  app.listen(config.port, '0.0.0.0', () => {
    // eslint-disable-next-line no-console
    console.log(`Find Money API listening on port ${config.port}`);
  });
}

export default app;
