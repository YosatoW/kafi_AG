// src/controllers/publicController.js
import { getLowStock, canMake } from '../services/drinksService.js';

export function renderHome(drinks, machine) {
  const modules = machine.modules || {};

  const enriched = drinks
    .filter(d => d.active)
    .filter(d => modules.chocolate ? true : (d.recipe.chocolate === 0)) 
    .map(d => ({ ...d, available: canMake(d, machine) }))

  return {
    template: 'index',
    data: {
      drinks: enriched,
      status: {
        cupPresent: machine.cupPresent,
        descaleIn: machine.descaleIn,
        payment: machine.payment,
        screensaverTimeoutMs: machine.screensaverTimeoutMs,
        currency: machine.currency,
        lowStock: getLowStock(machine),
        descaleWarning: machine.descaleIn <= machine.descaleWarning
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
      status: { cupPresent: machine.cupPresent, payment: machine.payment, currency: machine.currency }
    }
  };
}

export function renderBrew(drink, machine) {
  return {
    template: 'brew',
    data: { drink, status: { brewing: machine.brewing, currency: machine.currency } }
  };
}
