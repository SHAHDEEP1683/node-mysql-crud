const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;
const customerRoutes = require('./routes/customerRoutes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/customers', customerRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});