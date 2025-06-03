import { DataSourcePlugin } from '@grafana/data';
import { DataSource } from './datasource';
import { ConfigEditor } from './components/ConfigEditor';
import { QueryEditor } from './components/QueryEditor';
import { SqlQuery, JDBCSettings } from './types';
import { SQLVariableQueryEditor } from './components/VariableQueryEditor';

export const plugin = new DataSourcePlugin<DataSource, SqlQuery, JDBCSettings>(DataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor)
  .setVariableQueryEditor(SQLVariableQueryEditor);
