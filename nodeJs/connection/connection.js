import 'dotenv/config';
import mysql from 'mysql';
import sql from 'mssql';

const HOST = process.env.HOST;
const HOST_SQLSERVER = process.env.HOST_SQLSERVER;
const DATABASE = process.env.DATABASE;
const USER_MYSQL = process.env.USER_MYSQL;
const USER_SQLSERVER = process.env.USER_SQLSERVER;
const PWD = process.env.PASSWORD;
const PWD_SQLSERVER = process.env.PASSWORD_SQLSERVER;

// MySQL connection configuration
export const mysqlConfig = {
    host: HOST,
    user: USER_MYSQL,
    password: PWD,
    database: DATABASE
};
  
  // SQL Server connection configuration
export const sqlConfig = {
    user: USER_SQLSERVER,
    password: PWD_SQLSERVER,
    server: HOST_SQLSERVER,
    database: DATABASE,
    port: 1433,
    options: {
      encrypt: true,
      trustServerCertificate: true,
      connectTimeout: 30000
    }
};

// Create MySQL connection
export const mysqlConnection = mysql.createConnection(mysqlConfig);

// Create SQL Server pool
export const sqlPool = new sql.ConnectionPool(sqlConfig);