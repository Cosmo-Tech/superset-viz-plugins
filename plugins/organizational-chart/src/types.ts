import { QueryFormData } from '@superset-ui/core';

/**
 * Each box in the tree is defined by a label (title), a column (SQL column name),
 * and a color category that determines its background color.
 */
export interface BoxConfig {
  label: string;
  column: string;
  color: 'blue' | 'green' | 'red' | 'grey' | 'darkred';
}

/**
 * The tree is hardcoded in structure but each node's label, column, and color
 * are configurable from the control panel.
 */
export interface TreeNode {
  box: BoxConfig;
  value: string | number;
  children?: TreeNode[];
}

export type OrganizationalChartFormData = QueryFormData & {
  fontSize?: number;
  // Root level
  labelRoot?: string;
  colRoot?: string;
  // Level 1
  labelExcluded?: string;
  colExcluded?: string;
  labelSimulated?: string;
  colSimulated?: string;
  // Level 2
  labelBlocked?: string;
  colBlocked?: string;
  labelProcessed?: string;
  colProcessed?: string;
  // Level 3
  labelArrived?: string;
  colArrived?: string;
  labelNotArrived?: string;
  colNotArrived?: string;
  labelEndStock?: string;
  colEndStock?: string;
  // Level 4 — arrived children
  labelOnTime?: string;
  colOnTime?: string;
  labelLastMinute?: string;
  colLastMinute?: string;
  // Level 4 — not arrived children
  labelMissed?: string;
  colMissed?: string;
  labelRecirculation?: string;
  colRecirculation?: string;
  labelUltimateControl?: string;
  colUltimateControl?: string;
  labelOtherRejects?: string;
  colOtherRejects?: string;
  // Level 4 — stock child
  labelPassedStock?: string;
  colPassedStock?: string;
};

export type OrganizationalChartProps = {
  data: Record<string, unknown>[];
  height: number;
  width: number;
  fontSize: number;
  tree: TreeNode;
};
