import sql from 'mssql';

export async function insertRow(transaction, tableName, row) {
    console.log("row: ", row);
    const keys = Object.keys(row);
    const values = keys.map(key => row[key]);

    // Create a new request within the transaction context
    let request_table = new sql.Request(transaction);
    let request_procesados = new sql.Request(transaction);

    // Map the row keys to their SQL data types and add inputs to the request
    keys.forEach((key, index) => {
        const value = values[index] !== undefined ? values[index] : null;
        let type;

        // Infer SQL type based on JavaScript type
        if (typeof value === 'number') {
            type = Number.isInteger(value) ? sql.Int : sql.Float;
        } else if (typeof value === 'boolean') {
            type = sql.Bit;
        } else if (value instanceof Date) {
            type = sql.DateTime;
        } else {
            type = sql.VarChar;
        }

        request_table = request_table.input(key, type, value);
    });

    const columns = keys.join(', ');
    const parameters = keys.map(param => `@${param}`).join(', ');

    // console.log("COLUMNS: ", columns);
    // console.log("PARAMETERS: ", parameters);

    const query = `INSERT INTO ${tableName} (${columns}) VALUES (${parameters})`;
    const processed_data_success = `INSERT INTO procesados (id, detalle, estatus) VALUES (${values[0]}, '${tableName}', 1)`;

    // console.log("Query: ", query);
    // console.log("processed_data_success: ", processed_data_success);

    try {
        // Execute the insert query
        await request_table.query(query);
        console.log('Row inserted successfully: ' + values[0]);
        
        // Insert into procesados table
        await request_procesados.query(processed_data_success);
        console.log('Processed data inserted successfully');
    } catch (error) {
        let request_procesados_error = new sql.Request(transaction);
        const processed_data_fail = `INSERT INTO procesados (id, detalle, estatus) VALUES (${values[0]}, '${tableName}', 0)`;

        await request_procesados_error.query(processed_data_fail);
        console.error('Error inserting row:', error);
        
        throw error;
    }
}