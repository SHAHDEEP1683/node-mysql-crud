const db = require('../dbv2');
const fs = require('fs');
const path = require('path');

exports.createCustomer = (req, res) => {
  const { name, email, imgCode } = req.body;
  const fileName = `${name}.png`;
  const filePath = path.join(__dirname, '../uploads', fileName);
  const base64Data = imgCode.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  fs.writeFile(filePath, buffer, (err) => {
    if (err) return res.status(500).json({ error: 'Failed to save image' });

    const sql = 'INSERT INTO customers (name, email, image) VALUES (?, ?, ?)';
    db.query(sql, [name, email, fileName], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, name, email, image: fileName });
    });
  });
};

exports.getAllCustomers = (req, res) => {
  db.query('SELECT * FROM customers', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.getCustomerById = (req, res) => {
  db.query('SELECT * FROM customers WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Customer not found' });
    res.json(results[0]);
  });
};

exports.updateCustomer = (req, res) => {
  const allowedFields = ['name', 'email'];
  const updates = [];
  const values = [];

  for (const key in req.body) {
    if (allowedFields.includes(key)) {
      updates.push(`${key} = ?`);
      values.push(req.body[key]);
    }
  }

  if (req.body.image) {
    const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const imageName = `${req.body.name }.png`;
    const imagePath = path.join(__dirname, '../uploads', imageName);

    fs.writeFileSync(imagePath, buffer);
    updates.push('image = ?');
    values.push(imageName);
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: 'No valid fields provided for update' });
  }

  const sql = `UPDATE customers SET ${updates.join(', ')} WHERE id = ?`;
  values.push(req.params.id);

 db.query('SELECT * FROM customers WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Customer not found' });
    res.json(results[0]);
  });
};

exports.deleteCustomer = (req, res) => {
  const id = req.params.id;

  db.query('SELECT * FROM customers WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

  db.query('DELETE FROM customers WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(401).json({ error: err.message });
    res.json({ message: 'Customer deleted successfully'});
  });
  });
};
