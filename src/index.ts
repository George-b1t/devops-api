import express from 'express';
import { Router, Request, Response } from 'express';
import client from 'prom-client';

const app = express();
const route = Router();

const register = new client.Registry();

client.collectDefaultMetrics({ register });

const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Número total de requisições HTTP recebidas',
  labelNames: ['method', 'route', 'status'],
});

register.registerMetric(httpRequestCounter);

app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({ method: req.method, route: req.url, status: res.statusCode });
  });
  next();
});

route.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello world with Typescript v2' });
});

route.get('/metrics', async (req: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use(express.json());
app.use(route);

app.listen(3333, () => console.log('Server running on port 3333'));
