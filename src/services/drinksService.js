// src/services/drinksService.js
export function getDrinkById(drinks, id) {
  return drinks.find(d => d.id === id);
}

// Verfügbarkeit: berücksichtigt coffee1/coffee2 statt "coffee"
export function canMake(drink, machine) {
  if (!drink?.active) return false;

  const recipe  = drink.recipe || {};
  const mods    = machine.modules || {};
  const ing     = machine.ingredients || {};

  for (const k of Object.keys(recipe)) {
    const need = Number(recipe[k]) || 0;
    if (need <= 0) continue;

    let have = 0;
    if (k === 'coffee') {
      const c1 = Number(ing.coffee1 || 0);
      const c2 = Number(ing.coffee2 || 0);
      // wenn zweite Bohne aktiv → nimm den besseren Behälter, sonst coffee1
      have = mods.secondCoffee ? Math.max(c1, c2) : c1;
    } else {
      have = Number(ing[k] || 0);
    }

    if (have < need) return false;
  }
  return true;
}

// Verbrauch: zieht bei "coffee" vom richtigen Behälter ab (indexbasiert)
export function consumeIngredients(drink, machine) {
  const recipe = drink.recipe || {};
  const mods   = machine.modules || {};
  const ing    = machine.ingredients || {};

  const beans  = Array.isArray(machine.modules?.beans) ? machine.modules.beans : [];
  const firstId = beans[0]?.id || null;

  for (const [k, vRaw] of Object.entries(recipe)) {
    const v = Number(vRaw || 0);
    if (v <= 0) continue;

    if (k === 'coffee') {
      const c1 = Number(ing.coffee1 || 0);
      const c2 = Number(ing.coffee2 || 0);
      // Ohne zweite Sorte oder wenn die gewählte Bohne die "erste" ist → coffee1
      if (!mods.secondCoffee || !drink.chosenBean || (firstId && drink.chosenBean === firstId)) {
        ing.coffee1 = Math.max(0, c1 - v);
      } else {
        ing.coffee2 = Math.max(0, c2 - v);
      }
    } else {
      ing[k] = Math.max(0, Number(ing[k] || 0) - v);
    }
  }

  machine.descaleIn = Math.max(0, (machine.descaleIn || 0) - 1);
}

export function getLowStock(machine) {
  const out = [];
  const ing  = machine.ingredients || {};
  const mods = machine.modules || {};
  const min  = Number(machine.minLevels?.coffee || 0);

  // Milch
  if (ing.milk < (machine.minLevels.milk || 0)) {
    out.push({ key: "milk", name: "Milch" });
  }

  // Schokolade
  if (ing.chocolate < (machine.minLevels.chocolate || 0)) {
    out.push({ key: "chocolate", name: "Kakao" });
  }

  // Kaffee
  const c1 = Number(ing.coffee1 || 0);
  const c2 = Number(ing.coffee2 || 0);

  if (!mods.secondCoffee) {
    if (c1 < min) {
      out.push({ key: "coffee", name: "Kaffee" });
    }
  } else {
    if (c1 < min) {
      out.push({
        key: "coffee1",
        name: `Kaffee ${machine.modules.beans[0].name}`
      });
    }
    if (c2 < min) {
      out.push({
        key: "coffee2",
        name: `Kaffee ${machine.modules.beans[1].name}`
      });
    }
  }
  return out;
}

export function moneyState(price, machine) {
  const inserted = Number(machine.payment.inserted.toFixed(2));
  const remain   = Math.max(0, price - inserted);
  const change   = Math.max(0, inserted - price);
  return { inserted, remain: Number(remain.toFixed(2)), change: Number(change.toFixed(2)) };
}