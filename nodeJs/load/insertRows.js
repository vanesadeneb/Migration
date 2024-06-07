import { compareFields } from '../transformation/compareFields.js';
import { getPrimaryKey } from '../extraction/getSqlPk.js';
import sql from 'mssql';

export async function insertRow(transaction, tableName, row) {
    const keys = Object.keys(row);
    const values = keys.map(key => row[key]);

    console.log("KEYS", keys);
    console.log("VALUES", values);

    const fields = await compareFields(tableName);
    const pk = await getPrimaryKey(tableName);
    const filteredFields = fields
    // .filter(fieldName =>  fieldName.COLUMN_NAME !== pk[0])
    .map(fieldName => fieldName.COLUMN_NAME);

    console.log("campos filtrados", filteredFields);

    // Create a new request within the transaction context
    let request = new sql.Request(transaction);

    // Map the row keys to their SQL data types and add inputs to the request
    keys.forEach((key, index) => {
        const value = values[index] !== undefined ? values[index] : null;
        // const type = typeof value === 'number' ? sql.Int : sql.VarChar;
        // request = request.input(key.toUpperCase(), type, values);
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

            request = request.input(key.toUpperCase(), type, value);
    });


    const columns = filteredFields.join(', ');
    const parameters = filteredFields.map(param => `@${param.toUpperCase()}`).join(', ');
    
    console.log("COLUMNS", columns);
    console.log("PARAMETERS", parameters);
    
    const query = `INSERT INTO ${tableName} (${columns}) VALUES ( ${parameters})`;
    // const query = `INSERT INTO ${tableName} (id_estatus_tramite, dsc_estatus_tramite) VALUES (@ID_ESTATUS_TRAMITE, @DSC_ESTATUS_TRAMITE)`;

    console.log("Filtered Fields: ", filteredFields);
    console.log("Query: ", query);

    try {
        // if (enableIdentityInsert) {
        //     console.log(`Enabling IDENTITY_INSERT for ${tableName}`);
        //     // Enable IDENTITY_INSERT
        //     await transaction.request().query(`SET IDENTITY_INSERT ${tableName} ON`);
        // }

        // Execute the insert query
        await request.query(query);
        console.log('Row inserted successfully');

        // if (enableIdentityInsert) {
        //     console.log(`Disabling IDENTITY_INSERT for ${tableName}`);
        //     // Disable IDENTITY_INSERT
        //     await transaction.request().query(`SET IDENTITY_INSERT ${tableName} OFF`);
        // }
    } catch (error) {
        console.error('Error inserting row:', error);
        throw error;
    }
}