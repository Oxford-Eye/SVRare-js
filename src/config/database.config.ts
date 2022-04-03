import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(process.cwd(), ".env.local")
});

const db = new Sequelize('app', '', '', {
  storage: process.env.DATABASE,
  dialect: 'sqlite',
  logging: console.log
});

export default db;