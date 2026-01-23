// src/routers/apiRoutes.js
import express from 'express';
import { getDrinkById } from '../services/drinksService.js';
import { getStatus, postBrew, postFinish } from '../controllers/apiController.js';

export function createApiRoutes(drinks, machine) {
  const router = express.Router();

  router.get('/api/status', (req, res) => {
    res.json(getStatus(drinks, machine));
  });

  router.post('/api/brew', async (req, res) => {
    const drink = getDrinkById(drinks, req.body.id);
    if (!drink) return res.status(404).json({ ok: false, msg: 'Getränk nicht gefunden' });
    res.json(await postBrew(drink, machine));
  });

  router.post('/api/finish', async (req, res) => {
    res.json(await postFinish(machine));
  });

  return router;
}
