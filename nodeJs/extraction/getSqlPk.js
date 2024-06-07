import { mysqlConnection } from '../connection/connection.js';

// mysqlConnection.connect(err => {
//     if (err) {
//         console.error('Error connecting to MySQL:', err);
//         return;
//     }
//     console.log('Connected to MySQL');
// });

// Function to get primary key information
export const getPrimaryKey = async (tableName) => {
  const query = `
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = ?
    AND CONSTRAINT_NAME = 'PRIMARY'
  `;

  return new Promise((resolve, reject) => {
      mysqlConnection.query(query, [tableName], (err, results) => {
          if (err) {
              console.error('Error executing query:', err);
              return reject(err);
          }

          const primary_keys = [];
          if (results.length > 0) {
              console.log(`Primary key(s) for table ${tableName}:`);
              results.forEach(row => {
                  console.log(row.COLUMN_NAME);
                  primary_keys.push(row.COLUMN_NAME);
              });
          } else {
              console.log(`No primary key found for table ${tableName}.`);
          }

          // // Close the connection
          // mysqlConnection.end();

          resolve(primary_keys);
      });
  });
};