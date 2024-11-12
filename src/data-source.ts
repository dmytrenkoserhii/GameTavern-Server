import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

const ENVIRONMENT = process.env.NODE_ENV;

dotenv.config({
  path: ENVIRONMENT ? `.env.${ENVIRONMENT}` : '.env.development',
});

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  migrations: ['dist/migrations/*.js'],
  entities: ['dist/modules/**/*.entity.js'],
};
const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
