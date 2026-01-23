// src/repositories/drinksRepository.js
import fs from 'fs/promises';
import fssync from 'fs';
import { DATA_DIR, DRINKS_FILE } from '../config/paths.js';

const DEFAULT_DRINKS = [
  { id: 'espresso',   name: 'Espresso',          price: 2.5, active: true, recipe: { coffee: 50, milk: 0,   chocolate: 0   } },
  { id: 'cappuccino', name: 'Cappuccino',        price: 3.5, active: true, recipe: { coffee: 30, milk: 120, chocolate: 0   } },
  { id: 'choc',       name: 'Heisse Schokolade', price: 3.0, active: true, recipe: { coffee: 0,  milk: 120, chocolate: 120 } }
];

export async function ensureDrinksFile() {
  if (!fssync.existsSync(DATA_DIR)) fssync.mkdirSync(DATA_DIR, { recursive: true });
  if (!fssync.existsSync(DRINKS_FILE)) {
    await fs.writeFile(DRINKS_FILE, JSON.stringify(DEFAULT_DRINKS, null, 2), 'utf-8');
  }
}

export async function loadDrinks() {
  await ensureDrinksFile();
  const buf = await fs.readFile(DRINKS_FILE, 'utf-8');
  return JSON.parse(buf);
}

export async function saveDrinks(drinks) {
  await fs.writeFile(DRINKS_FILE, JSON.stringify(drinks, null, 2), 'utf-8');
}
