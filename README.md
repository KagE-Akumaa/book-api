# book-api

A backend learning project built with **Node.js**, **Express 5**, and **PostgreSQL**. Covers the core concepts needed for production-grade REST APIs — authentication, authorization, input validation, error handling, and database transactions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ES Modules) |
| Framework | Express 5 |
| Database | PostgreSQL + node-postgres (`pg`) |
| Auth | JWT (`jsonwebtoken`) + bcrypt |
| Validation | Zod |
| Environment | dotenv |

---

## Features

- **JWT Authentication** — register and login routes issue signed tokens; protected routes verify them via `auth` middleware
- **Role-Based Access Control** — `requireRole` middleware restricts routes by user role (`author`, `reader`, etc.)
- **Zod Input Validation** — all incoming request bodies are validated against schemas before hitting the database
- **Centralized Error Handling** — single `app.use` error middleware catches all operational errors; `AppError` class carries status code and message
- **PostgreSQL Transactions** — purchase route uses `pool.connect()` + `BEGIN/COMMIT/ROLLBACK` to atomically decrement stock and record the purchase
- **Clean Project Structure** — routes, middlewares, utils, and db separated by concern

---

## Project Structure

```
book-api/
├── db.js                  # pg pool setup
├── index.js               # app entry point
├── routes/
│   ├── books.js           # book CRUD + purchase route
│   └── auth.js            # register + login
├── middlewares/
│   ├── auth.js            # JWT verification
│   ├── authRole.js        # role-based access
│   └── errorHandler.js    # centralized error middleware
└── utils/
    └── AppError.js        # operational error class
```

---

## API Routes

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive JWT |

### Books
| Method | Route | Auth | Role |
|---|---|---|---|
| GET | `/books` | ✗ | — |
| GET | `/books/:id` | ✗ | — |
| POST | `/books` | ✓ | author |
| PUT | `/books/:id` | ✓ | author |
| DELETE | `/books/:id` | ✓ | author |
| POST | `/books/:id/purchase` | ✓ | any |

---

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL running locally

### Installation

```bash
git clone https://github.com/KagE-Akumaa/book-api
cd book-api
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/booksdb
JWT_SECRET=your_secret_here
```

### Database

Create the required tables in your PostgreSQL database:

```sql
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'reader'
);

CREATE TABLE books (
  book_id SERIAL PRIMARY KEY,
  book_title VARCHAR(255) NOT NULL,
  book_price NUMERIC NOT NULL,
  book_stock INT NOT NULL DEFAULT 0,
  book_availability BOOLEAN DEFAULT true,
  author_id INT REFERENCES users(user_id)
);

CREATE TABLE purchases (
  purchase_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(user_id),
  book_id INT NOT NULL REFERENCES books(book_id),
  purchased_at TIMESTAMP DEFAULT NOW()
);
```

### Run

```bash
node index.js
```

---

## Key Concepts Practiced

**Transactions** — the `/books/:id/purchase` route demonstrates atomicity: stock is decremented and a purchase record is inserted inside a single transaction. If either query fails, both are rolled back.

**Why `pool.connect()` over `pool.query()` for transactions** — `pool.query()` can use any connection from the pool on each call. Transactions are connection-scoped in PostgreSQL, so a dedicated client must be checked out, used for all queries in the transaction, and released in a `finally` block.

**Operational vs Programmer Errors** — `AppError` is thrown for expected failures (bad input, not found, unauthorized). Unexpected errors bubble to the centralized handler which returns a generic 500.

---

## What's Next

- [ ] Redis caching on `GET /books` with TTL
- [ ] Jest + Supertest integration tests
- [ ] Railway deployment with GitHub Actions CI/CD

---

*build_breakrepeat · KagE-Akumaa · 2026*
