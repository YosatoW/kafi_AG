// src/routes/superuserRoutes.js
import express from 'express';
import { renderAdmin, renderSim, postSettings, postResetDescale, postDrinks } from '../controllers/superuserController.js';
import { setSimValues, applySettings } from '../services/machineService.js';

export function createSuperuserRoutes(drinks, machine) {
  const router = express.Router();

  router.get('/superuser', (req, res) => {
    const { template, data } = renderAdmin(drinks, machine);
    res.render(template, data);
  });

  router.get('/sim', (req, res) => {
    const { template, data } = renderSim(machine);
    res.render(template, data);
  });

  router.post('/superuser/settings', async (req, res) => {
    await postSettings(machine, req.body, applySettings);
    res.redirect('/superuser');
  });

  router.post('/superuser/reset-descale', async (req, res) => {
    await postResetDescale(machine);
    res.redirect('/superuser');
  });

  router.post('/superuser/drinks', async (req, res) => {
    await postDrinks(drinks, req.body);
    res.redirect('/superuser');
  });

  router.post('/superuser/sim', async (req, res) => {
    await setSimValues(machine, req.body);
    res.redirect('/sim');
  });

  return router;
}

