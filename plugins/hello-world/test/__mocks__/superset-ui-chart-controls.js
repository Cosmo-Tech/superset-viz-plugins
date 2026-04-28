// Mock for @superset-ui/chart-controls
const validateNonEmpty = (value) => (value == null || value === '' ? 'cannot be empty' : undefined);

module.exports = {
  validateNonEmpty,
  ControlPanelConfig: class ControlPanelConfig {},
  sections: { grainedTemporalColumnSection: [], legacyTimeseriesTime: [] },
  sharedControls: {},
};
