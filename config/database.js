const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',         // Usuario por defecto de XAMPP
    password: '',         // Por defecto, sin contraseña en XAMPP
    database: 'nodejs',   // Tu base de datos
    waitForConnections: true
});

module.exports = db;