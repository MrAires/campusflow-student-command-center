import { existsSync,writeFileSync } from 'node:fs';
import {randomBytes} from 'node:crypto';
if(!existsSync('.env')) {
  const secret=randomBytes(48).toString('hex');
  writeFileSync('.env',`MONGODB_URI=mongodb://127.0.0.1:27017\nMONGODB_DB=campusflow\nJWT_SECRET=${secret}\nNODE_ENV=development\n`);
  console.log('Created local .env with secure session secret and local MongoDB URL.');
} else console.log('Using existing .env');
