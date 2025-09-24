import { Router } from 'express';
import books from './books.js';
import members from './members.js';
import loans from './loans.js';
import auth from './auth.js';

const r = Router();
r.use('/auth', auth);
r.use('/books', books);
r.use('/members', members);
r.use('/loans', loans);
export default r;
