import sql from 'mssql';
import { sqlConfig } from '../connection/connection.js';

export async function getTableFields(tableName) {
    try {
        await sql.connect(sqlConfig);
        const query = `
            SELECT COLUMN_NAME, DATA_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = @tableName
        `;
        const request = new sql.Request();
        request.input('tableName', sql.VarChar, tableName);
        const result = await request.query(query);
        return result.recordset;
    } catch (err) {
        console.error('SQL Server query error', err);
    } finally {
        await sql.close();
    }
}