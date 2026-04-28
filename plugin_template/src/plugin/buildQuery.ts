import { buildQueryContext } from '@superset-ui/core';
import { {{PLUGIN_CLASS_NAME}}FormData } from '../types';

export default function buildQuery(formData: {{PLUGIN_CLASS_NAME}}FormData) {
  const { series } = formData;
  return buildQueryContext(formData, baseQueryObject => [
    {
      ...baseQueryObject,
      columns: series ? [series] : [],
    },
  ]);
}
