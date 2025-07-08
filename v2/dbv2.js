const mysql = require('mysql2');

const dbv2 = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'nodemysql'
});

dbv2.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL DB');
});

module.exports = dbv2;