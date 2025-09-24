import { Router } from 'express';
import { Book } from '../src/model.js';
import { validate, schemas, requireAuth } from '../src/utils.js';

const r = Router();

r.post('/', requireAuth, validate(schemas.book), async (req, res, next) => {
  try { const b = await Book.create(req.body); res.status(201).json(b); }
  catch (e) { next(e); }
});

r.get('/', async (req, res, next) => {
  try { const bs = await Book.find(); res.json(bs); }
  catch (e) { next(e); }
});

r.patch('/:id', requireAuth, async (req, res, next) => {
  try { const b = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(b); }
  catch (e) { next(e); }
});

r.delete('/:id', requireAuth, async (req, res, next) => {
  try { await Book.findByIdAndDelete(req.params.id); res.status(204).end(); }
  catch (e) { next(e); }
});

export default r;
