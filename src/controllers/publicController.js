// src/controllers/publicController.js
import { getLowStock, canMake } from '../services/drinksService.js';

export function renderHome(drinks, machine) {
  const modules = machine.modules || {};
  const beans   = modules.beans || [];
  
  // max priceMod bestimmen
  const maxPriceMod = modules.secondCoffee
    ? Math.max(0, ...beans.map(b => Number(b.priceMod || 0)))
    : 0;

  const enriched = drinks
    .filter(d => d.active)
    .filter(d => modules.chocolate ? true : (d.recipe.chocolate === 0))
    .map(d => ({
      ...d,
      available: canMake(d, machine),
      maxPriceMod: maxPriceMod
    }));

  return {
    template: 'index',
    data: {
      drinks: enriched,
      status: {
        currency: machine.currency,
        cupPresent: machine.cupPresent,
        payment: machine.payment,
        screensaverTimeoutMs: machine.screensaverTimeoutMs,
        lowStock: getLowStock(machine),
        descaleWarning: machine.descaleIn <= machine.descaleWarning,
        descaleIn: machine.descaleIn
      }
    }
  };
}

export function renderPay(drink, machine) {
  return {
    template: 'pay',
    data: {
      drink,
      machine,
      status: {
        currency: machine.currency,
        cupPresent: machine.cupPresent,
        payment: machine.payment,
        lowStock: getLowStock(machine),
        descaleWarning: machine.descaleIn <= machine.descaleWarning,
        descaleIn: machine.descaleIn
      }
    }
  };
}

export function renderBrew(drink, machine) {
  return {
    template: 'brew',
    data: {
      drink, status: {
        currency: machine.currency,
        brewing: machine.brewing,
        lowStock: getLowStock(machine),
        descaleWarning: machine.descaleIn <= machine.descaleWarning,
        descaleIn: machine.descaleIn
        }
    }
  };
}

