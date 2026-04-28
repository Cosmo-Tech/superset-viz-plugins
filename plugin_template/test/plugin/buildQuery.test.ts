import buildQuery from '../../src/plugin/buildQuery';

describe('{{PACKAGE_NAME}} buildQuery', () => {
  const formData = {
    datasource: '5__table',
    granularity_sqla: 'ds',
    series: 'foo',
    viz_type: '{{PACKAGE_NAME}}',
  };

  it('should build columns with series in form data', () => {
    const queryContext = buildQuery(formData);
    const [query] = queryContext.queries;
    expect(query.columns).toEqual(['foo']);
  });

  it('should build empty columns when no series', () => {
    const queryContext = buildQuery({ ...formData, series: undefined });
    const [query] = queryContext.queries;
    expect(query.columns).toEqual([]);
  });
});
