import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';
import { notFound, errorHandler } from './src/utils.js';

const PORT = 3000; 
const MONGODB_URI = 'mongodb://127.0.0.1:27017/librarydb'; 

const app = express();
app.use(express.json());
app.use(express.static('public'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => res.redirect('/login'));
app.get('/app', (req, res) => res.render('dashboard'));
app.get('/login', (req, res) => res.render('login'));
app.get('/signup', (req, res) => res.render('signup'));
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

(async () => {
  mongoose.set('strictQuery', true);
  await mongoose.connect(MONGODB_URI);
  console.log('Mongo connected');
  app.listen(PORT, () => console.log(`Server on ${PORT}`));
})();
