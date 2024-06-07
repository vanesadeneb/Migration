import mysql from 'mysql2/promise';
import { mysqlConfig } from '../connection/connection.js';

export async function getMysqlTableFields(tableName) {
    const connection = await mysql.createConnection(mysqlConfig);
    const query = `
        SELECT COLUMN_NAME, DATA_TYPE
        FROM information_schema.COLUMNS
        WHERE TABLE_NAME = ? AND TABLE_SCHEMA = ?
    `;
    const [rows] = await connection.execute(query, [tableName, mysqlConfig.database]);
    await connection.end();
    return rows;
}