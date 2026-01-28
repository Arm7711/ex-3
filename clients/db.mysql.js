import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';

const caFilePath = path.resolve('./clients/certificates/ca.pem');
const { MYSQL_HOST, MYSQL_DATABASE, MYSQL_PASSWORD, MYSQL_USER, MYSQL_PORT } = process.env;

const pool = mysql.createPool({
  host: MYSQL_HOST,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  port: Number(MYSQL_PORT),
  waitForConnections: true,
  ssl: {
    ca: await fs.readFile(caFilePath),
    rejectUnauthorized: true
  }
});

const DB = {
  query(sql, params) {
    return pool.query(sql, params); 
  }
};

export default DB;
