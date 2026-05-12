import { buildQueryContext } from '@superset-ui/core';
import { OrganizationalChartFormData } from '../types';

export default function buildQuery(formData: OrganizationalChartFormData) {
  return buildQueryContext(formData, (baseQueryObject) => [
    {
      ...baseQueryObject,
      columns: [],
      row_limit: 1,
    },
  ]);
}
