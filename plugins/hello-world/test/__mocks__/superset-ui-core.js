// Mock for @superset-ui/core
// Provides minimal implementations needed for tests

const supersetTheme = {
  colors: {
    primary: { base: '#20A7C9' },
    secondary: { base: '#444E7C' },
    grayscale: { base: '#666666', dark1: '#323232', dark2: '#000000', light1: '#B2B2B2', light2: '#F0F0F0', light3: '#F7F7F7', light4: '#F9F9F9', light5: '#FAFAFA' },
    error: { base: '#E04355' },
    warning: { base: '#FF7F44' },
    alert: { base: '#FCC700' },
    success: { base: '#5AC189' },
    info: { base: '#66BCFE' },
  },
  typography: {
    families: { sansSerif: 'Inter', serif: 'Georgia', monospace: 'Fira Code' },
    weights: { light: 200, normal: 400, bold: 700, bolder: 900 },
  },
  gridUnit: 4,
  borderRadius: 4,
  transitionTiming: 0.3,
};

const t = (str) => str;

class ChartProps {
  constructor(props = {}) {
    this.formData = props.formData || {};
    this.queriesData = props.queriesData || [];
    this.width = props.width || 800;
    this.height = props.height || 600;
    this.hooks = props.hooks || {};
    this.theme = props.theme || supersetTheme;
  }
  static createSelector() {
    return (props) => new ChartProps(props);
  }
}

class ChartMetadata {
  constructor(props = {}) {
    Object.assign(this, props);
  }
}

class ChartPlugin {
  constructor(props = {}) {
    Object.assign(this, props);
  }
  register() { return this; }
  unregister() { return this; }
}

const buildQueryContext = (formData, buildQuery) => {
  const baseQueryObject = {
    time_range: 'No filter',
    filters: [],
    extras: {},
    granularity_sqla: formData.granularity_sqla,
    metrics: [],
    columns: [],
    groupby: [],
    orderby: [],
    row_limit: 10000,
  };
  const queries = buildQuery ? buildQuery(baseQueryObject) : [baseQueryObject];
  return {
    datasource: { id: formData.datasource?.split('__')[0] || '1', type: formData.datasource?.split('__')[1] || 'table' },
    force: false,
    queries,
    result_format: 'json',
    result_type: 'full',
  };
};

const validateNonEmpty = (value) => (value == null || value === '' ? 'cannot be empty' : undefined);

module.exports = {
  t,
  supersetTheme,
  ChartProps,
  ChartMetadata,
  ChartPlugin,
  buildQueryContext,
  validateNonEmpty,
  QueryFormData: class QueryFormData {},
  TimeseriesDataRecord: class TimeseriesDataRecord {},
};
