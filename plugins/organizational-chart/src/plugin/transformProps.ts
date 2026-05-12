import { ChartProps } from '@superset-ui/core';
import { OrganizationalChartProps, TreeNode, BoxConfig } from '../types';

function getValue(row: Record<string, unknown>, col: string): string | number {
  const v = row[col];
  if (v == null || v === '') return '';
  return typeof v === 'number' ? v : String(v);
}

function makeNode(
  row: Record<string, unknown>,
  label: string,
  col: string,
  color: BoxConfig['color'],
  children?: TreeNode[],
): TreeNode {
  return {
    box: { label, column: col, color },
    value: getValue(row, col),
    ...(children && children.length > 0 ? { children } : {}),
  };
}

export default function transformProps(chartProps: ChartProps): OrganizationalChartProps {
  const { width, height, formData, queriesData } = chartProps;
  const data = (queriesData[0]?.data || []) as Record<string, unknown>[];
  const row = data[0] || {};

  const f = formData as Record<string, any>;
  const fontSize = f.fontSize || f.font_size || 14;

  const tree: TreeNode = makeNode(
    row,
    f.labelRoot || f.label_root || '',
    f.colRoot || f.col_root || '',
    'blue',
    [
      makeNode(
        row,
        f.labelExcluded || f.label_excluded || '',
        f.colExcluded || f.col_excluded || '',
        'grey',
      ),
      makeNode(
        row,
        f.labelSimulated || f.label_simulated || '',
        f.colSimulated || f.col_simulated || '',
        'blue',
        [
          makeNode(
            row,
            f.labelBlocked || f.label_blocked || '',
            f.colBlocked || f.col_blocked || '',
            'grey',
          ),
          makeNode(
            row,
            f.labelProcessed || f.label_processed || '',
            f.colProcessed || f.col_processed || '',
            'blue',
            [
              makeNode(
                row,
                f.labelArrived || f.label_arrived || '',
                f.colArrived || f.col_arrived || '',
                'green',
                [
                  makeNode(
                    row,
                    f.labelOnTime || f.label_on_time || '',
                    f.colOnTime || f.col_on_time || '',
                    'green',
                  ),
                  makeNode(
                    row,
                    f.labelLastMinute || f.label_last_minute || '',
                    f.colLastMinute || f.col_last_minute || '',
                    'green',
                  ),
                ],
              ),
              makeNode(
                row,
                f.labelNotArrived || f.label_not_arrived || '',
                f.colNotArrived || f.col_not_arrived || '',
                'red',
                [
                  makeNode(
                    row,
                    f.labelMissed || f.label_missed || '',
                    f.colMissed || f.col_missed || '',
                    'darkred',
                  ),
                  makeNode(
                    row,
                    f.labelRecirculation || f.label_recirculation || '',
                    f.colRecirculation || f.col_recirculation || '',
                    'darkred',
                  ),
                  makeNode(
                    row,
                    f.labelUltimateControl || f.label_ultimate_control || '',
                    f.colUltimateControl || f.col_ultimate_control || '',
                    'darkred',
                  ),
                  makeNode(
                    row,
                    f.labelOtherRejects || f.label_other_rejects || '',
                    f.colOtherRejects || f.col_other_rejects || '',
                    'darkred',
                  ),
                ],
              ),
              makeNode(
                row,
                f.labelEndStock || f.label_end_stock || '',
                f.colEndStock || f.col_end_stock || '',
                'grey',
                [
                  makeNode(
                    row,
                    f.labelPassedStock || f.label_passed_stock || '',
                    f.colPassedStock || f.col_passed_stock || '',
                    'grey',
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  );

  return { data, height, width, fontSize, tree };
}
