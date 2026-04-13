
const mysql2 = require('mysql2');
require('dotenv').config();

const pool = mysql2.createPool({
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSOWRD,
    database: process.env.DB_NAME,
    waitForConnections: true, // Whether to queue requests when no connections are available
    connectionLimit: 50000,     // Maximum number of connections in the pool
    queueLimit: 0,

});


// Using async/await (recommended)
//  function getConnectionFromPool() {

//     try {
//         const connection = pool.getConnection();
//         // const rows = await connection.query("SELECT 1 as val");
//         // console.log("Database connection successful:", rows);
//         // connection.release()
//         return connection;
//     } catch (err) {
//         console.error('Error getting connection:', err);
//         throw err;
//     }
// }
// getConnectionFromPool()

   pool.getConnection((err,   connection) => {
    console.log("getting connection")
    if (err) {
        console.log(err)
        console.error('Error getting connection from pool:', err);
        return;
    }
    console.log("Connection successful")
       connection.release();


    require('crypto').randomBytes(48, function (err, buffer) {
        var token = buffer.toString('hex');
        console.log(token)
    });
});
module.exports = pool;








// DB_PORT='3306'
// DB_HOST='127.0.0.1'
// DB_USERNAME='root'
// DB_PASSOWRD='Mvk2Vk3@3011'
// DB_NAME='bha_db'
