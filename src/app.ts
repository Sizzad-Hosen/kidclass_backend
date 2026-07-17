import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { routes } from './routes';

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(','),
    credentials: true
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  '/uploads',
  express.static(path.resolve(process.cwd(), 'uploads'), {
    setHeaders: (res) => res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  })
);

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'KidClass backend ready to serve requests'
  });
});

app.use('/api/v1', routes);
app.use(notFound);
app.use(errorHandler);
