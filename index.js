import dotenv from 'dotenv';
dotenv.config();
import express from 'express';

import booksRouter from './routes/books.js';
import usersRouter from './routes/users.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();
app.use(express.json());

app.use('/books', booksRouter);
app.use('/users', usersRouter);
app.use(errorHandler);
const port = process.env.PORT;

app.listen(port, () => {
  console.log(`App is listening on PORT ${port}`);
});
