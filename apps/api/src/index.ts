import cors from 'cors';
import express from 'express';
import { accountsRouter } from './routes/accounts';
import { actionsRouter } from './routes/actions';
import { opportunitiesRouter } from './routes/opportunities';
import { scanRouter } from './routes/scan';
import { userRouter } from './routes/user';

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'find-money-api' });
});

app.use('/api/accounts', accountsRouter);
app.use('/api/scan', scanRouter);
app.use('/api/opportunities', opportunitiesRouter);
app.use('/api/actions', actionsRouter);
app.use('/api/user', userRouter);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Find Money API listening on http://localhost:${PORT}`);
});

export default app;
