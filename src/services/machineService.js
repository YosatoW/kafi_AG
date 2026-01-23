// src/services/machineService.js
import { saveMachine } from '../repositories/machineRepository.js';

export async function setSimValues(machine, payload) {
  const toPos = v => Math.max(0, Number(v));
  const {
    milk, coffee, chocolate, cupPresent, descaleIn, timeoutMs,
    insertAdd, insertSet, resetPayment,
    minMilk, minCoffee, minChocolate,
    resetIngredients, resetDescale
  } = payload;

  if (resetIngredients) {
    machine.ingredients.milk = machine.max.milk;
    machine.ingredients.coffee = machine.max.coffee;
    machine.ingredients.chocolate = machine.max.chocolate;
  }
  if (resetDescale) {
    machine.descaleIn = 20;
  }

  if (milk !== undefined)      machine.ingredients.milk = toPos(milk);
  if (coffee !== undefined)    machine.ingredients.coffee = toPos(coffee);
  if (chocolate !== undefined) machine.ingredients.chocolate = toPos(chocolate);
  if (descaleIn !== undefined) machine.descaleIn = toPos(descaleIn);
  if (timeoutMs !== undefined) machine.screensaverTimeoutMs = Math.max(5000, Number(timeoutMs));
  machine.cupPresent = (cupPresent === 'on');

  if (minMilk !== undefined)      machine.minLevels.milk = toPos(minMilk);
  if (minCoffee !== undefined)    machine.minLevels.coffee = toPos(minCoffee);
  if (minChocolate !== undefined) machine.minLevels.chocolate = toPos(minChocolate);

  if (resetPayment === 'on') {
    machine.payment = { inserted: 0, change: 0 };
  } else {
    if (insertSet) machine.payment.inserted = toPos(insertSet);
    if (insertAdd) machine.payment.inserted += toPos(insertAdd);
  }

  await saveMachine(machine);
}

export async function applySettings(machine, payload) {
  const { minMilk, minCoffee, minChocolate, descaleWarning, timeoutSec } = payload;

  if (minMilk !== undefined)        machine.minLevels.milk = Number(minMilk);
  if (minCoffee !== undefined)      machine.minLevels.coffee = Number(minCoffee);
  if (minChocolate !== undefined)   machine.minLevels.chocolate = Number(minChocolate);
  if (descaleWarning !== undefined) machine.descaleWarning = Number(descaleWarning);

  if (timeoutSec !== undefined) {
    const sec = Math.max(1, Number(timeoutSec));
    machine.screensaverTimeoutMs = sec * 1000;
  }

  await saveMachine(machine);
}
