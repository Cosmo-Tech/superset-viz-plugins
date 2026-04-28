import { ChartProps } from '@superset-ui/core';
import { {{PLUGIN_CLASS_NAME}}Props } from '../types';

export default function transformProps(chartProps: ChartProps): {{PLUGIN_CLASS_NAME}}Props {
  const { width, height, queriesData } = chartProps;
  const data = queriesData[0]?.data || [];
  return {
    data,
    height,
    width,
  };
}
