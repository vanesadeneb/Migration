import sql from 'mssql';
import { mysqlConnection, sqlPool } from './connection/connection.js';
import { getPrimaryKey } from './extraction/getSqlPk.js';
import { insertRow } from './load/insertRows.js';
import { compareFields } from './transformation/compareFields.js';

const tableName = 'c_persona';
const chunkSize = 1000; // Define the chunk size

// Function to transfer data in chunks
async function transferData() {
    let count = 0;

    try {
        // Connect to SQL Server
        await sqlPool.connect();
        console.log('Connected to SQL Server');

        // Connect to MySQL
        mysqlConnection.connect((err) => {
            if (err) {
                console.error('Error connecting to MySQL:', err);
                return;
            }
            console.log('Connected to MySQL');
        });

        // Get total number of rows in the MySQL table
        const countResults = await queryMySQL(`SELECT COUNT(*) AS total FROM ${tableName}`);
        const totalRows = countResults[0].total;
        const totalChunks = Math.ceil(totalRows / chunkSize);

        for (let i = 0; i < totalChunks; i++) {
            const offset = i * chunkSize;
            const results = await queryMySQL(`SELECT * FROM ${tableName} where id_persona > 1020023 LIMIT ${chunkSize} OFFSET ${offset}`);

            console.log(`Data fetched from MySQL: Chunk ${i + 1} of ${totalChunks}`);

            // Start transaction
            const transaction = new sql.Transaction(sqlPool);

            try {
                await transaction.begin();
                
                const pk = await getPrimaryKey(tableName);
                console.log("PK: ", pk);

                const fieldsInSql = await compareFields(tableName);

                const fieldsWithoutPk = fieldsInSql
                    .map(fieldName => fieldName.COLUMN_NAME);
                
                console.log("fieldsWithoutPk: ", fieldsWithoutPk);

                const filteredResults = results.map(row => {
                    return Object.keys(row)
                        .filter(key => fieldsWithoutPk.includes(key))
                        .reduce((obj, key) => {
                            obj[key] = row[key];
                            return obj;
                        }, {});
                });

                console.log("filteredResults: ",filteredResults.length);

                // Loop through results and insert into SQL Server
                for (let row of filteredResults) {
                    console.log("row: ", row);
                    // Replace undefined values with null
                    const sanitizedRow = Object.fromEntries(
                        Object.entries(row).map(([key, value]) => [key, value === undefined ? null : value])
                    );

                    await insertRow(transaction, tableName, sanitizedRow);
                    count += 1;
                }

                await transaction.commit();
                console.log(`Chunk ${i + 1} transferred to SQL Server`);
            } catch (err) {
                console.error('Error during data transfer:', err);

                if (transaction) {
                    // Rollback the transaction in case of error
                    await transaction.rollback();
                    console.log('Transaction rolled back.');
                }
            }
        }

        console.log('Data transferred to SQL Server');
        console.log(`${count} records inserted`);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        // Close connections
        await sqlPool.close();
        mysqlConnection.end();
    }
}

// Helper function to execute a MySQL query and return a promise
function queryMySQL(query) {
    return new Promise((resolve, reject) => {
        mysqlConnection.query(query, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

// Start the data transfer
transferData();