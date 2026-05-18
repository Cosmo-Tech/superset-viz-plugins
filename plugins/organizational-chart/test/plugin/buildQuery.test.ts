import buildQuery from '../../src/plugin/buildQuery';

describe('organizational-chart buildQuery', () => {
  const formData = {
    datasource: '5__table',
    granularity_sqla: 'ds',
    viz_type: 'organizational-chart',
    col_root: 'TotalDonneesEntree',
    col_excluded: 'BagagesExclus',
    col_simulated: 'TotalSimulation',
    col_blocked: 'BagagesBloques',
    col_processed: 'BagagesTraites',
    col_arrived: 'ArrivesADestination',
    col_not_arrived: 'NonArrives',
    col_end_stock: 'FinAuStock',
    col_on_time: 'ATemps',
    col_last_minute: 'DerniereMinute',
    col_missed: 'BagagesRates',
    col_recirculation: 'RebutRecirculation',
    col_ultimate_control: 'ControleUltime',
    col_other_rejects: 'AutresRebut',
    col_passed_stock: 'PassesAuStock',
  };

  it('should build a query with row_limit 1 and all configured columns', () => {
    const queryContext = buildQuery(formData);
    const [query] = queryContext.queries;
    expect(query.row_limit).toBe(1);
    expect(query.columns).toContain('TotalDonneesEntree');
    expect(query.columns).toContain('BagagesExclus');
    expect(query.columns).toHaveLength(15);
  });

  it('should deduplicate columns', () => {
    const dupeFormData = { ...formData, col_excluded: 'TotalDonneesEntree' };
    const queryContext = buildQuery(dupeFormData);
    const [query] = queryContext.queries;
    expect(query.columns).toHaveLength(14);
  });

  it('should filter out empty column values', () => {
    const partialFormData = { ...formData, col_root: '', col_excluded: undefined };
    const queryContext = buildQuery(partialFormData);
    const [query] = queryContext.queries;
    expect(query.columns).not.toContain('');
    expect(query.columns).toHaveLength(13);
  });
});
