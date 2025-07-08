const express = require('express');
const db = require('./db');
const app = express();
const PORT = 3000;
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// CREATE
const fs = require('fs');
const path = require('path');

// CREATE User with Image
app.post('/users', (req, res) => {
  const { name, email, imgCode } = req.body;

  const fileName = `${name}.png`;
  const filePath = path.join(__dirname, 'uploads', fileName);

  const base64Data = imgCode.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, 'base64');

  fs.writeFile(filePath, buffer, (err) => {
    if (err) return res.status(500).json({ error: 'Failed to save image' });

    const sql = 'INSERT INTO users (name, email, image) VALUES (?, ?, ?)';
    db.query(sql, [name, email, fileName], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, name, email, image: fileName });
    });
  });
});

// READ ALL
app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// READ ONE
app.get('/users/:id', (req, res) => {
  db.query('SELECT * FROM users WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(results[0]);
  });
});

// UPDATE
app.put('/users/:id', (req, res) => {
  const allowedFields = ['name', 'email'];
  const updates = [];
  const values = [];

  for (const key in req.body) {
    if (allowedFields.includes(key)) {
      updates.push(`${key} = ?`);
      values.push(req.body[key]);
    }
  }
// Handle image separately
  if (req.body.image) {
    const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const imageName = `${Date.now()}.png`;
    const imagePath = path.join(__dirname, 'uploads', imageName);

    fs.writeFileSync(imagePath, buffer);
    updates.push(`image = ?`);
    values.push(imageName);
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: 'No valid fields provided for update' });
  }

  const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
  values.push(req.params.id);

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User updated successfully' });
  });
});



// DELETE
app.delete('/users/:id', (req, res) => {
  db.query('DELETE FROM users WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User deleted successfully' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
