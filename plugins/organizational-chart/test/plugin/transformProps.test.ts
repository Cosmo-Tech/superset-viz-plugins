import { ChartProps, supersetTheme } from '@superset-ui/core';
import transformProps from '../../src/plugin/transformProps';

describe('OrganizationalChart transformProps', () => {
  const formData = {
    datasource: '3__table',
    granularity_sqla: 'ds',
    viz_type: 'organizational-chart',
    font_size: 16,
    label_root: 'Root',
    col_root: 'TotalDonneesEntree',
    label_excluded: 'Excluded',
    col_excluded: 'BagagesExclus',
    label_simulated: 'Simulated',
    col_simulated: 'TotalSimulation',
    label_blocked: 'Blocked',
    col_blocked: 'BagagesBloques',
    label_processed: 'Processed',
    col_processed: 'BagagesTraites',
    label_arrived: 'Arrived',
    col_arrived: 'ArrivesADestination',
    label_not_arrived: 'Not arrived',
    col_not_arrived: 'NonArrives',
    label_end_stock: 'End stock',
    col_end_stock: 'FinAuStock',
    label_on_time: 'On time',
    col_on_time: 'ATemps',
    label_last_minute: 'Last minute',
    col_last_minute: 'DerniereMinute',
    label_missed: 'Missed',
    col_missed: 'BagagesRates',
    label_recirculation: 'Recirculation',
    col_recirculation: 'RebutRecirculation',
    label_ultimate_control: 'Ultimate',
    col_ultimate_control: 'ControleUltime',
    label_other_rejects: 'Other',
    col_other_rejects: 'AutresRebut',
    label_passed_stock: 'Passed stock',
    col_passed_stock: 'PassesAuStock',
  };

  const chartProps = new ChartProps({
    formData,
    width: 800,
    height: 600,
    theme: supersetTheme,
    queriesData: [
      {
        data: [
          {
            TotalDonneesEntree: 62374,
            BagagesExclus: 0,
            TotalSimulation: 48156,
            BagagesBloques: 0,
            BagagesTraites: 0,
            ArrivesADestination: 45389,
            NonArrives: 2600,
            FinAuStock: 167,
            ATemps: 42046,
            DerniereMinute: 3343,
            BagagesRates: 2090,
            RebutRecirculation: 2,
            ControleUltime: 508,
            AutresRebut: 0,
            PassesAuStock: 17389,
          },
        ],
      },
    ],
  });

  it('should transform chart props with tree structure', () => {
    const result = transformProps(chartProps);
    expect(result.width).toBe(800);
    expect(result.height).toBe(600);
    expect(result.fontSize).toBe(16);
    expect(result.tree.box.label).toBe('Root');
    expect(result.tree.value).toBe(62374);
    expect(result.tree.children).toHaveLength(2);
  });

  it('should build nested children for arrived node', () => {
    const result = transformProps(chartProps);
    // tree > simulated > processed > arrived
    const simulated = result.tree.children![1];
    const processed = simulated.children![1];
    const arrived = processed.children![0];
    expect(arrived.box.label).toBe('Arrived');
    expect(arrived.value).toBe(45389);
    expect(arrived.children).toHaveLength(2);
    expect(arrived.children![0].value).toBe(42046);
  });

  it('should build nested children for not arrived node', () => {
    const result = transformProps(chartProps);
    const simulated = result.tree.children![1];
    const processed = simulated.children![1];
    const notArrived = processed.children![1];
    expect(notArrived.box.label).toBe('Not arrived');
    expect(notArrived.children).toHaveLength(4);
  });
});
