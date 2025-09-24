import { Router } from 'express';
import { Member } from '../src/model.js';
import { validate, schemas, requireAuth } from '../src/utils.js';

const r = Router();

r.post('/', requireAuth, validate(schemas.member), async (req, res, next) => {
  try { const m = await Member.create(req.body); res.status(201).json(m); }
  catch (e) { next(e); }
});

r.get('/', async (req, res, next) => {
  try { const ms = await Member.find(); res.json(ms); }
  catch (e) { next(e); }
});

export default r;
