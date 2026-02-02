// src/repositories/machineRepository.js
import fs from 'fs/promises';
import fssync from 'fs';
import { DATA_DIR, MACHINE_FILE } from '../config/paths.js';
import { CURRENCY, SCREENSAVER_TIMEOUT_MS, DEFAULT_BREW_MS } from '../config/constants.js';

const DEFAULT_MACHINE = {
  cupPresent: false,
  ingredients: { milk: 5000, coffee: 5000, chocolate: 5000 },
  max:         { milk: 5000, coffee: 5000, chocolate: 5000 },
  minLevels:   { milk: 500,  coffee: 500,  chocolate: 500  },
  descaleIn: 500,
  descaleWarning: 50,
  payment: { inserted: 0, change: 0 },
  brewing: { inProgress: false, drinkId: null, etaMs: DEFAULT_BREW_MS, startedAt: 0, awaitingCupRemoval: false },
  screensaverTimeoutMs: SCREENSAVER_TIMEOUT_MS,
  currency: CURRENCY
};

export async function ensureMachineFile() {
  if (!fssync.existsSync(DATA_DIR)) fssync.mkdirSync(DATA_DIR, { recursive: true });
  if (!fssync.existsSync(MACHINE_FILE)) {
    await fs.writeFile(MACHINE_FILE, JSON.stringify(DEFAULT_MACHINE, null, 2), 'utf-8');
  }
}

export async function loadMachine() {
  await ensureMachineFile();
  const buf = await fs.readFile(MACHINE_FILE, 'utf-8');
  return JSON.parse(buf);
}

export async function saveMachine(machine) {
  await fs.writeFile(MACHINE_FILE, JSON.stringify(machine, null, 2), 'utf-8');
}
