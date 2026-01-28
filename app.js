import 'dotenv/config';
import path from 'path';
import cors from 'cors';
import logger from 'morgan';
import express from 'express';
import createError from 'http-errors';
import router from './routes/index.js';
import './migrate.js';

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true, 
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.resolve('public')));

app.use(router);

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  if (app.get('env') === 'development') {
    console.error(err);
  }

  res.status(status).json({
    status: 'error',
    message,
    ...(app.get('env') === 'development' && { stack: err.stack })
  });
});

export default app;