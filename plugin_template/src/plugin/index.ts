import { ChartPlugin, ChartMetadata } from '@superset-ui/core';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import thumbnail from '../images/thumbnail';

export default class {{PLUGIN_CLASS_NAME}}Plugin extends ChartPlugin {
  constructor() {
    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('../__PLUGIN_CLASS_NAME__'),
      metadata: new ChartMetadata({
        description: '{{DESCRIPTION}}',
        name: '{{PLUGIN_DISPLAY_NAME}}',
        thumbnail,
      }),
      transformProps,
    });
  }
}
