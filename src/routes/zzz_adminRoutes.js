// src/routers/adminRoutes.js
import express from 'express';
import { renderAdmin, renderSim, postSettings, postResetDescale, postDrinks } from '../controllers/adminController.js';
import { setSimValues, applySettings } from '../services/machineService.js';

export function createAdminRoutes(drinks, machine) {
  const router = express.Router();

  router.get('/admin', (req, res) => {
    const { template, data } = renderAdmin(drinks, machine);
    res.render(template, data);
  });

  router.get('/sim', (req, res) => {
    const { template, data } = renderSim(machine);
    res.render(template, data);
  });

  router.post('/admin/settings', async (req, res) => {
    await postSettings(machine, req.body, applySettings);
    res.redirect('/admin');
  });

  router.post('/admin/reset-descale', async (req, res) => {
    await postResetDescale(machine);
    res.redirect('/admin');
  });

  router.post('/admin/drinks', async (req, res) => {
    await postDrinks(drinks, req.body);
    res.redirect('/admin');
  });

  router.post('/admin/sim', async (req, res) => {
    await setSimValues(machine, req.body);
    res.redirect('/sim');
  });

  return router;
}
