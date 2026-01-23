// src/config/paths.js
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

export const ROOT_DIR   = path.resolve(__dirname, '../../');
export const VIEWS_DIR  = path.join(ROOT_DIR, 'views');
export const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
export const DATA_DIR   = path.join(ROOT_DIR, 'data');

export const DRINKS_FILE  = path.join(DATA_DIR, 'drinks.json');
export const MACHINE_FILE = path.join(DATA_DIR, 'machine.json');
