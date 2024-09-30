const express = require('express');
const { Client } = require('pg');
const Joi = require('joi'); 
const app = express();

app.use(express.json());

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'mydb',
  password: 'postgre', 
  port: 5432,
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Connection error', err.stack));


const userSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(), 
  email: Joi.string().email().required(),       
});


app.post('/users', async (req, res) => {
  const { name, email } = req.body;

  
  const { error } = userSchema.validate({ name, email });
  if (error) {
    return res.status(400).json({ error: error.details[0].message }); 
  }

  try {
    const result = await client.query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *', [name, email]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/users', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM users');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  
  const { error } = userSchema.validate({ name, email });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const result = await client.query('UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *', [name, email, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

