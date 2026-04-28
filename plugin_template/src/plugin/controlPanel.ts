import { ControlPanelConfig } from '@superset-ui/chart-controls';
import { validateNonEmpty } from '@superset-ui/core';

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: '{{PLUGIN_DISPLAY_NAME}} Settings',
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'series',
            config: {
              type: 'SelectControl',
              label: 'Series',
              default: null,
              description: 'Choose the series column',
              validators: [validateNonEmpty],
              mapStateToProps: state => ({
                choices: (state.datasource?.columns || []).map(
                  (col: { column_name: string }) => [col.column_name, col.column_name],
                ),
              }),
            },
          },
        ],
      ],
    },
  ],
};

export default config;
