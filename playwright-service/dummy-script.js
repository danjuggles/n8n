const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json({ limit: '1mb' }));

const TOKEN = process.env.SERVICE_TOKEN || '';
app.use((req, res, next) => {
  if (!TOKEN) return next();
  const auth = req.headers.authorization || '';
  if (auth === `Bearer ${TOKEN}`) return next();
  res.status(401).json({ error: 'unauthorized' });
});

app.get('/healthz', (_req, res) => res.json({ ok: true, service: 'dummy-script' }));

app.post('/dummy-test', async (req, res) => {
  const input = req.body || {};
  await new Promise(r => setTimeout(r, 200));
  res.json({
    ok: true,
    received: input,
    meta: { service: 'playwright-dummy', processedAt: new Date().toISOString() },
    result: {
      upperMessage: typeof input.message === 'string' ? input.message.toUpperCase() : null,
      numberSquared: typeof input.number === 'number' ? input.number ** 2 : null
    }
  });
});

app.listen(3000, () => console.log('Dummy listening on 3000'));
