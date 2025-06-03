import { DataSource } from '../datasource';
import React, { useEffect, useState } from 'react';
import { SQLEditor } from './SQLEditor';
import { SqlQuery } from '../types';

export type SqlVariableQueryEditorProps = {
  datasource: DataSource;
  onChange: (query: SqlQuery, definition: string) => void;
  query: SqlQuery;
};

export const SQLVariableQueryEditor = (props: SqlVariableQueryEditorProps) => {
  const { datasource, onChange } = props;
  const [sql, setSql] = useState<string>(props.query.rawSql || '');
  const [query, setQuery] = useState(props.query);

  useEffect(() => {
    return () => {
        // unmount
        datasource.setVariableQuery();
    }
  }, [datasource])

  const handleChange = (query: SqlQuery) => {
    setSql(query.rawSql || '');
    setQuery(query);
  };

  const onRun = () => {
    onChange({ ...query, rawSql: sql }, `Query: ${sql}`);
  };

  const onBlur = () => {
    if (query.rawSql !== props.query.rawSql) {
      // workaround for "Run query" button at the bottom of the page
      // force the model update but skip running the query
      datasource.setVariableQuery({ skip: true });
      onChange({ ...query, rawSql: sql }, `Query: ${sql}`);
    }
  }

  return (
    <SQLEditor 
      datasource={datasource} 
      onChange={handleChange} 
      onBlur={onBlur} 
      onRunQuery={onRun} 
      query={{ ...query, rawSql: sql }} 
    />
  );
};
