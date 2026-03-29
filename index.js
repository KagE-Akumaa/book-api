import express from "express";
import dotenv from "dotenv";

dotenv.config();
import booksRouter from "./routes/books.js";
import usersRouter from "./routes/users.js";

const app = express();
app.use(express.json());

app.use("/books", booksRouter);
app.use("/users", usersRouter);
const port = process.env.PORT;

app.listen(port, () => {
  console.log(`App is listening on PORT ${port}`);
});
