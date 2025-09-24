import Joi from 'joi';
import jwt from 'jsonwebtoken';
import { Member } from './model.js';

export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body);
  if (error) return next(new Error(error.message));
  req.body = value; next();
};

export const schemas = {
  book: Joi.object({
    title: Joi.string().required(),
    author: Joi.string().required(),
    isbn: Joi.string().allow('', null).optional(),
    copies: Joi.number().integer().min(0).default(1)
  }),
  member: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required()
  }),
  borrow: Joi.object({
    bookId: Joi.string().required(),
    memberId: Joi.string().required(),
    days: Joi.number().integer().min(1).max(30).default(7)
  }),
  register: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};

export function notFound(req, res, next) {
  res.status(404).json({ message: 'Route not found' });
}
export function errorHandler(err, req, res, next) {
  const status = err.status || 400;
  res.status(status).json({
    message: err.message || 'Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

// Auth helpers
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN = '1d';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await Member.findById(decoded.sub).select('-password');
    if (!user) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    req.user = user;
    next();
  } catch (e) {
    next(Object.assign(new Error('Unauthorized'), { status: 401 }));
  }
}
