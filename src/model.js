import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  isbn: { type: String, unique: true, sparse: true },
  copies: { type: Number, default: 1, min: 0 }
}, { timestamps: true });

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, minlength: 6 }
}, { timestamps: true });

// Hash password before save when modified/created
memberSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

memberSchema.methods.checkPassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

const loanSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  borrowedAt: { type: Date, default: Date.now },
  dueAt: { type: Date, required: true },
  returnedAt: { type: Date }
}, { timestamps: true });

export const Book = mongoose.model('Book', bookSchema);
export const Member = mongoose.model('Member', memberSchema);
export const Loan = mongoose.model('Loan', loanSchema);
