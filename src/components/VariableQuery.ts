import { DataQuery, DataQueryRequest, DataQueryResponse } from '@grafana/data';
import { Observable, of } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

export type VariableQueryState = {
    skip: boolean
}

interface VQuery extends DataQuery {};

export class VariableQuery<TQuery extends DataQuery> {

    static App = 'VariableQuery';
    private static instance?: VariableQuery<VQuery>;

    static GetInstance<TQuery extends DataQuery>(query: Query<VQuery>, state?: VariableQueryState): VariableQuery<TQuery> | undefined {
        if (state === undefined) {
            VariableQuery.instance = undefined;
            return undefined;
        }
        if (!VariableQuery.instance) {
            VariableQuery.instance = new VariableQuery<VQuery>(query, state);
        }
        VariableQuery.instance.setState(state);
        return VariableQuery.instance;
    }

    static Not(request: DataQueryRequest<DataQuery>) {
        return VariableQuery.instance === undefined || request.app === VariableQuery.App;
    }

    replayQuery?: Observable<DataQueryResponse>;
    
    constructor(private query: Query<TQuery>, private state: VariableQueryState) {}

    run(request: DataQueryRequest<TQuery>): Observable<DataQueryResponse> {
        const query = this.getReplayQuery(request);
        this.state = ({ skip: false });
        if (query === undefined) {
            return of({ data: [] });
        }
        return query;
    }

    getReplayQuery(request: DataQueryRequest<TQuery>) {
        if (!this.state?.skip) {
            const query = this.query({...request, app: VariableQuery.App});
            this.replayQuery = query.pipe(
                shareReplay(1)
            )
        }
        if (this.replayQuery !== undefined) {
            return this.replayQuery;
        }
        return undefined;
    }

    setState(state: VariableQueryState) {
        this.state = state;
    }
}

export type Query<TQuery extends DataQuery> = {
    (request: DataQueryRequest<TQuery>): Observable<DataQueryResponse>
}
