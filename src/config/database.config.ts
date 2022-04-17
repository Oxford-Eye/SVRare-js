import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

const ENV_FILE = process.env.ENV_FILE || '.env'
dotenv.config({
  path: path.resolve(process.cwd(), ENV_FILE)
});

const db = new Sequelize('app', '', '', {
  storage: process.env.DATABASE,
  dialect: 'sqlite',
  logging: false
});

export default db;