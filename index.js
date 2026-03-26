import express from "express";
import pool from "./db.js";
import dotenv from "dotenv";
import router from "./routes/books.js";

dotenv.config();
const app = express();
app.use(express.json());

app.use("/books", router);
const port = process.env.PORT;

app.listen(port, () => {
  console.log(`App is listening on PORT ${port}`);
});
