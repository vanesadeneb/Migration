import sql from 'mssql';
import { mysqlConnection, sqlPool } from './connection/connection.js';
import { insertRow } from './load/insertRows.js';

const tableName = 'c_municipio';

// Function to transfer data
async function transferData() {
    try {
        let count = 0;
        // Connect to SQL Server
        await sqlPool.connect();
        console.log('Connected to SQL Server');

        // Connect to MySQL
        mysqlConnection.connect(async err => {
            if (err) {
                console.error('Error connecting to MySQL:', err);
                return;
            }
            console.log('Connected to MySQL');

            // Query data from MySQL
            mysqlConnection.query(`SELECT * FROM ${tableName}`, async (err, results) => {
                if (err) {
                    console.error('Error querying MySQL:', err);
                    mysqlConnection.end();
                    return;
                }

                console.log('Data fetched from MySQL');

                // Start transaction
                const transaction = new sql.Transaction(sqlPool);
                try {
                    await transaction.begin(); //inicia una nueva transaccion
                    
                    // Loop through results and insert into SQL Server
                    for (let row of results) {
                        // Replace undefined values with null
                        const sanitizedRow = Object.fromEntries(
                            Object.entries(row).map(([key, value]) => [key, value === undefined ? null : value])
                        );
                        console.log(sanitizedRow);
                        await insertRow(transaction, tableName, sanitizedRow);
                        count += 1;
                    }

                    await transaction.commit();
                    console.log('Data transferred to SQL Server');
                    console.log(`${count} registros insertados`);
                } catch (err) {
                    console.error('Error during data transfer:', err);
                    if (transaction) {
                        // Rollback the transaction in case of error
                        await transaction.rollback();
                        console.log('Transaction rolled back.');
                    }
                } finally {
                    sqlPool.close();
                    mysqlConnection.end();
                }
            });
        });
    } catch (err) {
        console.error('SQL Server connection error:', err);
    }
}

await transferData();