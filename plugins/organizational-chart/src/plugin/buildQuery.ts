import { buildQueryContext } from '@superset-ui/core';
import { OrganizationalChartFormData } from '../types';

export default function buildQuery(formData: OrganizationalChartFormData) {
  const f = formData as Record<string, any>;

  // Collect all configured column names to build the SELECT clause.
  // Superset rejects queries with no columns and no metrics ("Empty query?").
  const allColumns: string[] = [
    f.col_root,
    f.col_excluded,
    f.col_simulated,
    f.col_blocked,
    f.col_processed,
    f.col_arrived,
    f.col_not_arrived,
    f.col_end_stock,
    f.col_on_time,
    f.col_last_minute,
    f.col_missed,
    f.col_recirculation,
    f.col_ultimate_control,
    f.col_other_rejects,
    f.col_passed_stock,
  ].filter((col): col is string => typeof col === 'string' && col.length > 0);

  // Deduplicate
  const columns = [...new Set(allColumns)];

  return buildQueryContext(formData, (baseQueryObject) => [
    {
      ...baseQueryObject,
      columns,
      row_limit: 1,
    },
  ]);
}
