// src/app.js
import express from 'express';
import path from 'path';
import session from 'express-session';
import bodyParser from 'body-parser';
import { VIEWS_DIR, PUBLIC_DIR } from './config/paths.js';
import { createPublicRoutes } from './routes/publicRoutes.js';
import { createSuperuserRoutes } from './routes/superuserRoutes.js';

import { createApiRoutes } from './routes/apiRoutes.js';

export function createApp({ drinks, machine }) {
  const app = express();

  app.set('view engine', 'pug');
  app.set('views', VIEWS_DIR);
  app.use(express.static(PUBLIC_DIR));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(session({ secret: 'hot-beverage-secret', resave: false, saveUninitialized: true }));

  app.use(createPublicRoutes(drinks, machine));
  app.use(createSuperuserRoutes(drinks, machine));
  app.use(createApiRoutes(drinks, machine));


  return app;
}
