import { QueryFormData } from '@superset-ui/core';

export type {{PLUGIN_CLASS_NAME}}FormData = QueryFormData & {
  series?: string;
};

export type {{PLUGIN_CLASS_NAME}}Props = {
  data: Record<string, unknown>[];
  height: number;
  width: number;
};
