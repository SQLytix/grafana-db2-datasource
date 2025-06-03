import React from 'react';
import { QueryEditorProps } from '@grafana/data';
import { CodeEditor } from '@grafana/ui';
import { DataSource } from '../datasource';
import { SqlQuery, JDBCSettings, Format } from '../types';
import { css } from '@emotion/css';

type SQLEditorProps = QueryEditorProps<DataSource, SqlQuery, JDBCSettings>;

export const SQLEditor = (props: SQLEditorProps) => {
  const { query, onRunQuery, onChange, onBlur } = props;

  const onSqlChange = (sql: string) => {
    if (sql.trim() !== '') {
      const format = sql.toLowerCase().includes('as time') ? Format.TIMESERIES : Format.TABLE;
      onChange({ ...query, rawSql: sql, format });
      onRunQuery();
    }
  };

  const run = () => onSqlChange(query.rawSql || '');

  const styles = {
    wrapper: css`
      position: relative;
    `,
    run: css`
      position: absolute;
      top: 2px;
      left: 6px;
      z-index: 100;
      color: green;
    `,
  };

  const handleMount = (editor: Editor) => {
    editor.onKeyUp((_: Event) => {
        const rawSql = editor.getValue();
        onChange({ ...query, rawSql});
    });
  };

  const onSqlBlur = (query: SqlQuery) => {
    onChange(query);
    if (onBlur !== undefined) {
      onBlur();
    }
  }

  return (
    <div style={{ width: '100%' }} className={styles.wrapper}>
      <a onClick={run} className={styles.run}>
        <i className="fa fa-play"></i>
      </a>
      <CodeEditor
        aria-label="SQL"
        height={'300px'}
        width="100%"
        language="sql"
        value={query.rawSql || ''}
        onSave={onSqlChange}
        showMiniMap={false}
        showLineNumbers={true}
        onEditorDidMount={(editor) => handleMount(editor as unknown as Editor)}
        onBlur={(text) => onSqlBlur({ ...query, rawSql: text })}
      />
    </div>
  );
};

type Editor = {
  onKeyUp: (e: Event) => void
  getValue: () => string
}

type Event = {}
