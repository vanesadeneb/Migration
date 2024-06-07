import { compareFields } from '../transformation/compareFields.js';
import sql from 'mssql';

export async function insertRow(transaction, tableName, row) {
    const keys = Object.keys(row);
    const values = keys.map(key => row[key]);
    console.log("KEYS", keys);

    // Fetch the fields from the table
    const fields = await compareFields(tableName);
    const filteredFields = fields.map(fieldName => fieldName.COLUMN_NAME);

    // Create a new request within the transaction context
    let request = new sql.Request(transaction);
    let enableIdentityInsert = false;

    // Check if any key starts with "ID_"
    const identityKey = keys.find(key => key.startsWith('ID_'));

    if (identityKey) {
        enableIdentityInsert = true;
    }

    // Map the row keys to their SQL data types and add inputs to the request
    keys.forEach((key, index) => {
        const type = typeof row[key] === 'number' ? sql.Int : sql.VarChar;
        request = request.input(key.toUpperCase(), type, values[index]);
    });

    // const columns = filteredFields.join(', ');
    // const parameters = filteredFields.map(column => `@${column.toUpperCase()}`).join(', ');
    // const query = `INSERT INTO ${tableName} (${columns}) VALUES (${parameters})`;
    const query = `INSERT INTO ${tableName} (id_estatus_tramite, dsc_estatus_tramite) VALUES (@ID_ESTATUS_TRAMITE, @DSC_ESTATUS_TRAMITE)`;

    console.log("Filtered Fields: ", filteredFields);
    console.log("Query: ", query);

    try {
        if (enableIdentityInsert) {
            console.log(`Enabling IDENTITY_INSERT for ${tableName}`);
            // Enable IDENTITY_INSERT
            await transaction.request().query(`SET IDENTITY_INSERT ${tableName} ON`);
        }

        // Execute the insert query
        await request.query(query);
        console.log('Row inserted successfully');

        if (enableIdentityInsert) {
            console.log(`Disabling IDENTITY_INSERT for ${tableName}`);
            // Disable IDENTITY_INSERT
            await transaction.request().query(`SET IDENTITY_INSERT ${tableName} OFF`);
        }
    } catch (error) {
        console.error('Error inserting row:', error);
        throw error;
    }
}