import { ChartProps, supersetTheme } from '@superset-ui/core';
import transformProps from '../../src/plugin/transformProps';

describe('{{PLUGIN_CLASS_NAME}} transformProps', () => {
  const formData = {
    colorScheme: 'bnbColors',
    datasource: '3__table',
    granularity_sqla: 'ds',
    series: 'name',
    viz_type: '{{PACKAGE_NAME}}',
  };
  const chartProps = new ChartProps({
    formData,
    width: 800,
    height: 600,
    theme: supersetTheme,
    queriesData: [
      {
        data: [{ name: 'Hulk', value: 1 }],
      },
    ],
  });

  it('should transform chart props for viz', () => {
    expect(transformProps(chartProps)).toEqual({
      width: 800,
      height: 600,
      data: [{ name: 'Hulk', value: 1 }],
    });
  });
});
