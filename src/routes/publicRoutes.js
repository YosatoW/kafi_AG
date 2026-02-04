// routes/publicRoutes.js
import express from 'express';
import { getDrinkById, canMake } from '../services/drinksService.js';
import { renderHome, renderPay, renderBrew } from '../controllers/publicController.js';

export function createPublicRoutes(drinks, machine) {
  const router = express.Router();

  router.get('/', (req, res) => {
    const { template, data } = renderHome(drinks, machine);

    res.render(template, data);
  });

  router.get('/pay/:id', (req, res) => {
    const drink = getDrinkById(drinks, req.params.id);
    if (!drink) return res.redirect('/');

    const modules = machine.modules || {};

    if (!drink.active || !canMake(drink, machine)) return res.redirect('/');
    if (!modules.chocolate && (drink?.recipe?.chocolate || 0) > 0) return res.redirect('/');

    const { template, data } = renderPay(drink, machine);

    data.bean          = req.query.bean || null;
    data.secondCoffee = machine.modules?.secondCoffee ? true : false; 
    data.beans        = machine.modules?.beans || [];


    res.render(template, data);
  });


  router.get('/brew/:id', (req, res) => {
    const drink = getDrinkById(drinks, req.params.id);
    if (!drink) return res.redirect('/');
    const { template, data } = renderBrew(drink, machine);

    res.render(template, data);
  });

  router.get('/screensaver', (req, res) => res.render('screensaver'));
  
  return router;
}
