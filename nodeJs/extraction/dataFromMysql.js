import mysql from 'mysql2/promise';
import { mysqlConfig } from '../connection/connection.js';

export async function fetchDataFromMySQL(query) {
    const connection = await mysql.createConnection(mysqlConfig);
    const [rows] = await connection.execute(query);
    await connection.end();
    return rows;
}