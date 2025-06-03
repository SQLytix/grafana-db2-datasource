import React, { PureComponent } from 'react';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../datasource';
import { JDBCSettings, SqlQuery } from '../types';
import { SQLEditor } from './SQLEditor';

type Props = QueryEditorProps<DataSource, SqlQuery, JDBCSettings>;

export class QueryEditor extends PureComponent<Props> {
  render() {
    return (
      <div className="gf-form">
        <SQLEditor {...this.props} />
      </div>
    );
  }
}
