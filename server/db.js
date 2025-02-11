const sql = require('mssql');

// Configuration object for SQL Server connection using Windows Authentication
const config = {
    user: '',  // Leave empty for Windows Authentication
    password: '',  // Leave empty for Windows Authentication
    server: 'localhost',  // Your SQL Server hostname or IP (use 'localhost' for local)
    database: 'Admin',  // Your database name (e.g., Admin)
    options: {
        encrypt: true,  // Use this if you're using Azure SQL
        trustServerCertificate: true  // Set to true if you're working with a local server
    }
};

// Establish connection to SQL Server
const connectToDB = async () => {
    try {
        let pool = await sql.connect(config);  // Establish connection
        console.log('Connected to SQL Server');
        return pool;  // Return the connection pool
    } catch (err) {
        console.error('Error connecting to SQL Server:', err);
    }
};

module.exports = { connectToDB, sql };
