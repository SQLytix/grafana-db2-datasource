import {
    DataFrame,
    DataQuery,
    DataQueryRequest,
    DataQueryResponse,
    DataSourceInstanceSettings,
    ScopedVars,
    vectorator,
  } from '@grafana/data';
  import { DataSourceWithBackend, getTemplateSrv } from '@grafana/runtime';
  import { JDBCSettings, SqlQuery } from './types';
  import { Observable, of } from 'rxjs';
  import { uniqueId } from 'lodash';
  import { VariableQuery, VariableQueryState, Query } from './components/VariableQuery';
  
  export class DataSource extends DataSourceWithBackend<SqlQuery, JDBCSettings> {
    // This enables default annotation support for 7.2+
    annotations = {};
    variableQuery?: VariableQuery<SqlQuery>;
  
    constructor(instanceSettings: DataSourceInstanceSettings<JDBCSettings>) {
      super(instanceSettings);
    }
  
    query(request: DataQueryRequest<SqlQuery>): Observable<DataQueryResponse> {
      // empty sql can cause a panic with some ODBC drivers - remove any queries with no rawSql
      request.targets = request.targets.filter((t) => t.rawSql !== undefined && t.rawSql?.trim() !== '');
      if (request.targets.length <= 0) {
        return of({ data: [] });
      }
  
      if (VariableQuery.Not(request)) {
        return super.query(request);
      }
  
      return this.variableQuery!.run(request);
    }
  
    // TODO
    // @ts-ignore
    async metricFindQuery(query: SqlQuery): Promise<MetricFindValue[]> {
      if (!query.rawSql) {
        return [];
      }
      const frame = await this.runQuery(query);
      if (frame.fields?.length === 0) {
        return [];
      }
      if (frame?.fields?.length === 1) {
        return vectorator(frame?.fields[0]?.values as any).map((text) => ({ text, value: text }));
      }
      // convention - assume the first field is an id field
      const ids = frame?.fields[0]?.values;
      return vectorator(frame?.fields[1]?.values as any).map((text, i) => ({ text, value: ids.get(i) }));
    }
  
    applyTemplateVariables(query: SqlQuery, scopedVars: ScopedVars) {
      const sql = this.replace(query.rawSql || '', scopedVars) || '';
      return { ...query, rawSql: sql };
    }
  
    replace(value?: string, scopedVars?: ScopedVars) {
      if (value !== undefined) {
        return getTemplateSrv().replace(value, scopedVars, this.format);
      }
      return value;
    }
  
    format(value: any) {
      if (Array.isArray(value)) {
        return `'${value.join("','")}'`;
      }
      return value;
    }
  
    runQuery(request: Partial<SqlQuery>): Promise<DataFrame> {
      return new Promise((resolve) => {
        const req = {
          targets: [{ ...request, refId: uniqueId() }],
        } as DataQueryRequest<SqlQuery>;
        this.query(req).subscribe((res) => {
          resolve(res.data[0] || { fields: [] });
        });
      });
    }
  
    setVariableQuery(vcs?: VariableQueryState) {
      const query = this.query as Query<DataQuery>;
      this.variableQuery = VariableQuery.GetInstance(query, vcs);
    }
  }
