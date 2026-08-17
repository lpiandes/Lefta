import { Router } from 'express';

export const legalRouter = Router();

legalRouter.get('/privacy', (_req, res) => {
  res.json({
    title: 'Your Money. Your Data.',
    body: [
      'Find Money does not sell financial data or transaction histories.',
      'We do not use financial information for advertising.',
      'You can disconnect accounts and delete your data at any time.',
      'We store merchant, amount, date, category, and ids needed by detectors.',
      'We never store bank passwords. Plaid tokens are encrypted at rest.',
    ],
  });
});

legalRouter.get('/terms', (_req, res) => {
  res.json({
    title: 'Terms of use',
    body: [
      'Find Money is a read-only money-recovery assistant. Opportunities are not guarantees until the merchant or institution confirms cash.',
      'You approve every consequential action. We do not move money, file disputes automatically, or take custody of recovered funds.',
      'The app is free. If recovered cash is verified, Find Money may charge a 20% success fee on that verified amount only — never on hypothetical savings.',
      'You are responsible for sending merchant requests using the drafts we prepare, unless a later permitted integration is explicitly enabled.',
      'You may disconnect accounts and delete your data at any time.',
    ],
  });
});
