// src/services/drinksService.js
export function getDrinkById(drinks, id) {
  return drinks.find(d => d.id === id);
}

// Nur Rezeptmenge entscheidet (Mindeststand ignorieren)
export function canMake(drink, machine) {
  if (!drink?.active) return false;
  const recipe = drink.recipe || {};
  for (const k of Object.keys(recipe)) {
    const need = Number(recipe[k]) || 0;
    if (need <= 0) continue;
    const have = Number(machine.ingredients?.[k]) || 0;
    if (have < need) return false;
  }
  return true;
}

export function consumeIngredients(drink, machine) {
  const recipe = drink.recipe || {};
  for (const [k, v] of Object.entries(recipe)) {
    machine.ingredients[k] = Math.max(0, Number(machine.ingredients[k] || 0) - Number(v || 0));
  }
  machine.descaleIn = Math.max(0, machine.descaleIn - 1);
}

export function getLowStock(machine) {
  const out = [];
  for (const k of Object.keys(machine.ingredients)) {
    const min = machine.minLevels?.[k] ?? 0;
    if (machine.ingredients[k] < min) out.push(k);
  }
  return out;
}

export function moneyState(price, machine) {
  const inserted = Number(machine.payment.inserted.toFixed(2));
  const remain = Math.max(0, price - inserted);
  const change = Math.max(0, inserted - price);
  return { inserted, remain: Number(remain.toFixed(2)), change: Number(change.toFixed(2)) };
}
