import dotenv from "dotenv";
dotenv.config();
import express from "express";

import booksRouter from "./routes/books.js";
import usersRouter from "./routes/users.js";

const app = express();
app.use(express.json());

app.use("/books", booksRouter);
app.use("/users", usersRouter);
const port = process.env.PORT;

app.listen(port, () => {
  console.log(`App is listening on PORT ${port}`);
  console.log(process.env.JWT_SECRET);
  console.log(process.env.DB_USER);
});
