import express from "express";
import bcrypt from "bcrypt";

import pool from "../db.js";

const usersRouter = express.Router();

// get all the users
usersRouter.get("/", async (_, res) => {
  try {
    const sqlQuery = "SELECT * FROM users";
    const result = await pool.query(sqlQuery);
    return res.status(200).json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// get single user based on the id
usersRouter.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "User id is required!" });
    }

    const sqlQuery = "SELECT * FROM users WHERE user_id = $1";
    const result = await pool.query(sqlQuery, [id]);
    if (result.rows.length == 0) {
      return res.status(404).json({ error: "User not found!" });
    }
    // NOTE: we here also giving the object with hashedPassword so create a new object without the hashedPassword
    const { user_password, ...userWithoutPassword } = result.rows[0];
    return res.status(200).json(userWithoutPassword);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// create a new user
usersRouter.post("/", async (req, res) => {
  try {
    // The body will have the data - name, email , password, role
    const { name, email, password, role } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name is required!" });
    }
    if (!email) {
      return res.status(400).json({ error: "Email is required!" });
    }
    if (!password) {
      return res.status(400).json({ error: "Password is required!" });
    }
    if (!role) {
      return res.status(400).json({ error: "Role is required!" });
    }

    // Remember to hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    const sqlQuery =
      "INSERT INTO users(user_name, user_email, user_password, user_role) VALUES($1, $2, $3, $4) RETURNING *";
    const result = await pool.query(sqlQuery, [
      name,
      email,
      hashedPassword,
      role,
    ]);

    // NOTE: Bad practice to send the whole object containing hashedPassword - sol - create a new object without the hashedPassword password
    const { user_password, ...userWithoutPassword } = result.rows[0];
    return res.status(201).json(userWithoutPassword);
  } catch (err) {
    // standard error code for postgres if we violate the UNIQUE constraint
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already exists!" });
    }
    return res.status(500).json({ error: err.message });
  }
});

// Delete the user by user_id
usersRouter.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "User id is required!" });
    }
    const sqlQuery = "DELETE FROM users WHERE user_id = $1";
    const result = await pool.query(sqlQuery, [id]);
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default usersRouter;
