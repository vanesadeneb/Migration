import sql from 'mssql';
import { sqlConfig } from '../connection/connection.js';

export async function fetchDataFromSQLServer(query) {
    try {
        await sql.connect(sqlConfig);
        const result = await sql.query(query);
        return result.recordset;
    } catch (err) {
        console.error('SQL Server query error', err);
    } finally {
        await sql.close();
    }
}