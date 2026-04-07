import express from 'express';
import pool from '../db.js';

import { z } from 'zod';
import auth from '../middlewares/auth.js';
import requireRole from '../middlewares/authRole.js';
import AppError from '../utils/AppError.js';
const booksRouter = express.Router();

//NOTE: This contains bookSchema for zod :->
const bookSchema = z.object({
  title: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  availability: z.boolean(),
  author: z.number().int().positive(),
});
// Route to get all the books from the books table from the database
booksRouter.get('/', async (req, res, next) => {
  try {
    const sqlQuery = 'SELECT * FROM books';
    // pool.query() has a row field there is the data for the query
    const result = await pool.query(sqlQuery);
    return res.json(result.rows);
  } catch (err) {
    next(err);
    //return res.status(500).json({ error: err.message });
  }
});

// Route to get a single book based on the id
booksRouter.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    // Check the id
    if (!id) {
      return next(new AppError('Book id is required!', 400));
      // return res.status(400).json({ error: 'Book id is required!' });
    }
    const sqlQuery = `SELECT * FROM books WHERE book_id = $1`;
    const result = await pool.query(sqlQuery, [id]);
    return res.json(result.rows);
  } catch (err) {
    //NOTE: if we throw here too so it will be double first from the id and then again for the catch block
    next(err);
    //return res.status(500).json({ error: err.message });
  }
});

// Route to add a new book
booksRouter.post('/', auth, requireRole('author'), async (req, res, next) => {
  try {
    //NOTE: This all feels untidy as we have to write every edge case and still for some it might fail that where we bring zod into our arsenal we have already created the schema for the validation and it will give correct validation from there we just have to pass the data to zod
    const bookSchemaResult = bookSchema.safeParse(req.body);

    // returns { success, data, error }
    //NOTE:.error is the zod error object, .errors is the array of field failures, [0].message gets the first failure message.
    if (!bookSchemaResult.success) {
      return next(new AppError(bookSchemaResult.error.errors[0].message, 400));
    }
    // //NOTE: To add a new book what are the data we need from the body ?
    // //Ans- title, price, stock, availability, author
    // const { title, price, stock, availability, author } = req.body;
    // // NEED TO VERIFY THE DATA TOO
    // if (!title) {
    //   return next(new AppError('Book title is required!', 400));
    //   //return res.status(400).json({ error: 'Book Title is required!' });
    // }
    // if (!price) {
    //   return next(new AppError('Book Price is required!', 400));
    //   //return res.status(400).json({ error: 'Book Price is required!' });
    // }
    // if (!stock) {
    //   return next(new AppError('Book stock is required!', 400));
    //   //      return res.status(400).json({ error: 'Book stock is required!' });
    // }
    // if (!availability) {
    //   return next(new AppError('Book availability is required!', 400));
    //   //return res.status(400).json({ error: 'Book availability is required!' });
    // }
    // if (!author) {
    //   return next(new AppError('Book author is required!', 400));
    //   //return res.status(400).json({ error: 'Book author is required!' });
    // }
    //
    // Now we need to add the query to add a new book
    const { title, price, stock, availability, author } = bookSchemaResult.data;
    const sqlQuery =
      'INSERT INTO books( book_title, book_price, book_stock, book_availability, author_id) VALUES ($1, $2, $3, $4, $5) RETURNING *';

    const result = await pool.query(sqlQuery, [
      title,
      price,
      stock,
      availability,
      author,
    ]);
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
    //return res.status(500).json({ error: err.message });
  }
});

// Route to update price and stock
booksRouter.put('/:id', auth, requireRole('author'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return next(new AppError('Book id is required', 400));
      //return res.status(400).json({ error: 'Book id is required!' });
    }
    const { price, stock, availability } = req.body;
    if (!price) {
      return next(new AppError('Book price is required', 400));
      //return res.status(400).json({ error: 'Book price is required!' });
    }
    if (!stock) {
      return next(new AppError('Book stock is required', 400));
      //return res.status(400).json({ error: 'Book stock is required!' });
    }
    if (availability === undefined) {
      return next(new AppError('Book availability is required', 400));
      //return res.status(400).json({ error: 'Book availability is required!' });
    }
    const sqlQuery =
      'UPDATE books SET book_price = $1, book_stock = $2, book_availability = $3 WHERE book_id = $4 RETURNING *';
    const result = await pool.query(sqlQuery, [price, stock, availability, id]);
    return res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
    //return res.status(500).json({ error: err.message });
  }
});
// Route to delete a book based on id
booksRouter.delete(
  '/:id',
  auth,
  requireRole('author'),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!id) {
        return next(new AppError('Book id is required!', 400));
        //  return res.status(400).json({ error: 'Book id is required!' });
      }
      const sqlQuery = 'DELETE FROM books WHERE book_id = $1 RETURNING *';
      await pool.query(sqlQuery, [id]);
      return res.status(204).send();
    } catch (err) {
      next(err);
      //return res.status(500).json({ error: err.message });
    }
  },
);

// Adding new post route to practice transaction in database
booksRouter.post('/:id/purchase', auth, async (req, res, next) => {
  //NOTE: We want to update the book stock if a user purchase a book
  const client = await pool.connect();
  try {
    const id = Number(req.params.id);
    if (!id) {
      return next(new AppError('Book id is required!', 400));
    }
    await client.query('BEGIN');
    //NOTE: now the transaction has begun now we want to get the books stock from the books table and decrement it
    const bookstockQuery = 'SELECT book_stock FROM books WHERE book_id = $1';

    const result = await client.query(bookstockQuery, [id]);
    //now result.row contains the book_stock update it
    const { book_stock } = result.rows[0];
    const newBookStock = book_stock - 1;
    const newBookStockQuery =
      'UPDATE books SET book_stock = $1 WHERE book_id = $2 RETURNING *';
    const stockResult = await client.query(newBookStockQuery, [
      newBookStock,
      id,
    ]);
    // Now we have to update the purchase in database
    const purchaseQuery =
      'INSERT INTO purchases(user_id, book_id, purchased_at) VALUES ($1, $2, $3) RETURNING *';
    await client.query(purchaseQuery, [req.user.id, id, Date.now()]);
    await client.query('COMMIT');
    return res.status(201).json(stockResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});
export default booksRouter;
