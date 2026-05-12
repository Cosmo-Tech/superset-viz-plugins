import buildQuery from '../../src/plugin/buildQuery';

describe('organizational-chart buildQuery', () => {
  const formData = {
    datasource: '5__table',
    granularity_sqla: 'ds',
    viz_type: 'organizational-chart',
  };

  it('should build a query with row_limit 1 and empty columns', () => {
    const queryContext = buildQuery(formData);
    const [query] = queryContext.queries;
    expect(query.columns).toEqual([]);
    expect(query.row_limit).toBe(1);
  });
});
