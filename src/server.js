// src/server.js
import { createApp } from './app.js';
import { loadDrinks } from './repositories/drinksRepository.js';
import { loadMachine } from './repositories/machineRepository.js';
import { PORT } from './config/constants.js';

(async () => {
  const drinks  = await loadDrinks();
  const machine = await loadMachine();

  const app = createApp({ drinks, machine });
  app.listen(PORT, () => {
    console.log(`Heissgetränke-Panel läuft auf http://localhost:${PORT}`);
  });
})();
