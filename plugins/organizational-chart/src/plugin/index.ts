import { ChartPlugin, ChartMetadata } from '@superset-ui/core';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import thumbnail from '../images/thumbnail';

export default class OrganizationalChartPlugin extends ChartPlugin {
  constructor() {
    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('../OrganizationalChart'),
      metadata: new ChartMetadata({
        description: 'Simple organizational chart',
        name: 'My Organizational chart',
        thumbnail,
      }),
      transformProps,
    });
  }
}
