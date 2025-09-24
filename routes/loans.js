import { Router } from 'express';
import { Loan, Book } from '../src/model.js';
import { validate, schemas, requireAuth } from '../src/utils.js';

const r = Router();

r.post('/borrow', requireAuth, validate(schemas.borrow), async (req, res, next) => {
  try {
    const { bookId, memberId, days } = req.body;
    const book = await Book.findById(bookId);
    if (!book || book.copies < 1) throw new Error('Book unavailable');
    book.copies -= 1; await book.save();
    const dueAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const loan = await Loan.create({ book: bookId, member: memberId, dueAt });
    res.status(201).json(loan);
  } catch (e) { next(e); }
});

r.post('/:id/return', requireAuth, async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id).populate('book');
    if (!loan) return next(Object.assign(new Error('Loan not found'), { status: 404 }));
    if (loan.returnedAt) return next(Object.assign(new Error('Loan already returned'), { status: 400 }));

    loan.returnedAt = new Date();
    await loan.save();

    // If the book no longer exists (deleted), skip incrementing copies
    if (loan.book) {
      loan.book.copies = (loan.book.copies || 0) + 1;
      await loan.book.save();
    }

    res.json(loan);
  } catch (e) { next(e); }
});

r.get('/', async (req, res, next) => {
  try {
    const ls = await Loan.find().populate('book').populate('member');
    res.json(ls);
  } catch (e) { next(e); }
});

export default r;
