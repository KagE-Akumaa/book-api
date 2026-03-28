import express from "express";
import pool from "../db.js";

import auth from "../middlewares/auth.js";
const booksRouter = express.Router();

// Route to get all the books from the books table from the database
booksRouter.get("/", async (req, res) => {
  try {
    const sqlQuery = "SELECT * FROM books";
    // pool.query() has a row field there is the data for the query
    const result = await pool.query(sqlQuery);
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Route to get a single book based on the id
booksRouter.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    // Check the id
    if (!id) {
      return res.status(400).json({ error: "Book id is required!" });
    }
    const sqlQuery = `SELECT * FROM books WHERE book_id = $1`;
    const result = await pool.query(sqlQuery, [id]);
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Route to add a new book
booksRouter.post("/", auth, async (req, res) => {
  try {
    //NOTE: To add a new book what are the data we need from the body ?
    //Ans- title, price, stock, availability, author
    const { title, price, stock, availability, author } = req.body;
    // NEED TO VERIFY THE DATA TOO
    if (!title) {
      return res.status(400).json({ error: "Book Title is required!" });
    }
    if (!price) {
      return res.status(400).json({ error: "Book Price is required!" });
    }
    if (!stock) {
      return res.status(400).json({ error: "Book stock is required!" });
    }
    if (!availability) {
      return res.status(400).json({ error: "Book availability is required!" });
    }
    if (!author) {
      return res.status(400).json({ error: "Book author is required!" });
    }

    // Now we need to add the query to add a new book
    const sqlQuery =
      "INSERT INTO books( book_title, book_price, book_stock, book_availability, author_id) VALUES ($1, $2, $3, $4, $5) RETURNING *";

    const result = await pool.query(sqlQuery, [
      title,
      price,
      stock,
      availability,
      author,
    ]);
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Route to update price and stock
booksRouter.put("/:id", auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Book id is required!" });
    }
    const { price, stock, availability } = req.body;
    if (!price) {
      return res.status(400).json({ error: "Book price is required!" });
    }
    if (!stock) {
      return res.status(400).json({ error: "Book stock is required!" });
    }
    if (availability === undefined) {
      return res.status(400).json({ error: "Book availability is required!" });
    }
    const sqlQuery =
      "UPDATE books SET book_price = $1, book_stock = $2, book_availability = $3 WHERE book_id = $4 RETURNING *";
    const result = await pool.query(sqlQuery, [price, stock, availability, id]);
    return res.status(200).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
// Route to delete a book based on id
booksRouter.delete("/:id", auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Book id is required!" });
    }
    const sqlQuery = "DELETE FROM books WHERE book_id = $1 RETURNING *";
    const result = await pool.query(sqlQuery, [id]);
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default booksRouter;
