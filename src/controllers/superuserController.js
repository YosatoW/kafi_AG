// src/controllers/adminController.js
import { saveDrinks } from '../repositories/drinksRepository.js';
import { saveMachine } from '../repositories/machineRepository.js';

export function renderAdmin(drinks, machine) {
  return { template: 'superuser', data: { drinks, machine, currency: machine.currency } };
}

export function renderSim(machine) {
  return { template: 'sim', data: { machine, currency: machine.currency } };
}

export async function postSettings(machine, payload, applySettingsFn) {
  await applySettingsFn(machine, payload);
}

export async function postResetDescale(machine) {
  machine.descaleIn = 500;
  await saveMachine(machine);
}

export async function postDrinks(drinks, payload) {
  const incoming = payload.drinks || {};
  for (const [id, fields] of Object.entries(incoming)) {
    const d = drinks.find(dr => dr.id === id);
    if (!d) continue;

    d.active = fields.active === 'on';

    if (fields.price !== undefined) {
      const p = Number(fields.price);
      if (!Number.isNaN(p) && p >= 0) d.price = p;
    }

    if (fields.coffee !== undefined) {
      const c = Number(fields.coffee);
      if (!Number.isNaN(c) && c >= 0) d.recipe.coffee = c;
    }

    if (fields.milk !== undefined) {
      const mk = Number(fields.milk);
      if (!Number.isNaN(mk) && mk >= 0) d.recipe.milk = mk;
    }

    if (fields.chocolate !== undefined) {
      const ch = Number(fields.chocolate);
      if (!Number.isNaN(ch) && ch >= 0) d.recipe.chocolate = ch;
    }

    if (!d.config) d.config = {};

    if (fields.water !== undefined) {
      const w = Number(fields.water);
      if (!Number.isNaN(w) && w >= 0) d.config.water = w;
    }

    if (fields.mahlgrad !== undefined) {
      const mg = Number(fields.mahlgrad);
      if (!Number.isNaN(mg) && mg >= 1) d.config.mahlgrad = mg;
    }
  }
  await saveDrinks(drinks);
}
