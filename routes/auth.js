import { Router } from 'express';
import { Member } from '../src/model.js';
import { validate, schemas, signToken } from '../src/utils.js';

const r = Router();

// Register (optional helper)
r.post('/register', validate(schemas.register), async (req, res, next) => {
  try {
    const exists = await Member.findOne({ email: req.body.email });
    if (exists) throw Object.assign(new Error('Email already registered'), { status: 400 });
    const member = await Member.create(req.body);
    res.status(201).json({ _id: member._id, name: member.name, email: member.email });
  } catch (e) { next(e); }
});

// Login
r.post('/login', validate(schemas.login), async (req, res, next) => {
  try {
    const member = await Member.findOne({ email: req.body.email });
    if (!member) throw Object.assign(new Error('Invalid credentials'), { status: 401 });
    const ok = await member.checkPassword(req.body.password);
    if (!ok) throw Object.assign(new Error('Invalid credentials'), { status: 401 });
    const token = signToken({ sub: member._id.toString(), email: member.email });
    res.json({ token, user: { _id: member._id, name: member.name, email: member.email } });
  } catch (e) { next(e); }
});

export default r;


