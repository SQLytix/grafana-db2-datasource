import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface SqlQuery extends DataQuery {
  rawSql?: string;
  format: number;
}

export interface Setting {
  name: string;
  value?: string;
  secure?: boolean;
}

export interface JDBCSettings extends DataSourceJsonData {
  settings: Setting[];
}

export interface SecureJDBCSettings {
  [key: string]: string;
}

export enum Format {
  TIMESERIES = 0,
  TABLE = 1,
  LOGS = 2,
}
