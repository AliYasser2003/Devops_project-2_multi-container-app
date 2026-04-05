const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ DB connection (using environment variables)
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
});

// Create table
app.get("/init", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT
      )
    `);
    res.send("Table created");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Add user
app.post("/users", async (req, res) => {
  const { name } = req.body;

  if (!name) return res.status(400).send("Name required");

  try {
    await pool.query("INSERT INTO users(name) VALUES($1)", [name]);
    res.send("User added");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get users
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ✅ IMPORTANT: listen on 0.0.0.0 for Docker
app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});
