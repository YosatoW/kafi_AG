// src/controllers/apiController.js
import { canMake, consumeIngredients, moneyState } from '../services/drinksService.js';
import { saveMachine } from '../repositories/machineRepository.js';

export function getStatus(drinks, machine) {
  return {
    cupPresent: machine.cupPresent,
    descaleIn: machine.descaleIn,
    payment: machine.payment,
    brewing: machine.brewing,
    drinks: drinks.map(d => ({
      id: d.id, name: d.name, price: d.price, active: d.active, available: canMake(d, machine)
    })),
    ingredients: machine.ingredients,
    currency: machine.currency,
    screensaverTimeoutMs: machine.screensaverTimeoutMs
  };
}

export async function postBrew(drink, machine) {
  const pay = moneyState(drink.price, machine);
  if (pay.remain > 0)             return { ok: false, msg: `Bitte noch ${pay.remain.toFixed(2)} ${machine.currency} einwerfen.` };
  if (!machine.cupPresent)        return { ok: false, msg: 'Bitte Tasse hinstellen.' };
  if (!canMake(drink, machine))   return { ok: false, msg: 'Zutat leer – Getränk derzeit nicht verfügbar.' };
  if (machine.brewing.inProgress) return { ok: false, msg: 'Zubereitung läuft bereits…' };

  machine.brewing = { inProgress: true, drinkId: drink.id, etaMs: 4000, startedAt: Date.now(), awaitingCupRemoval: false };

  setTimeout(async () => {
    consumeIngredients(drink, machine);
    machine.payment.change = Number((machine.payment.inserted - drink.price).toFixed(2));
    machine.payment.inserted = 0;
    machine.brewing = { inProgress: false, drinkId: null, etaMs: 4000, startedAt: 0, awaitingCupRemoval: true };
    await saveMachine(machine);
  }, machine.brewing.etaMs);

  return { ok: true, msg: 'Zubereitung gestartet…', etaMs: machine.brewing.etaMs };
}

export async function postFinish(machine) {
  machine.brewing.awaitingCupRemoval = false;
  await saveMachine(machine);
  return { ok: true };
}
