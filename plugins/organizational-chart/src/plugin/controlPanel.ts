import { ControlPanelConfig } from '@superset-ui/chart-controls';
import { t } from '@superset-ui/core';

/**
 * Helper to create a column selector control.
 */
function columnSelector(name: string, label: string, defaultValue: string, description: string) {
  return {
    name,
    config: {
      type: 'SelectControl' as const,
      label: t(label),
      default: defaultValue,
      description: t(description),
      mapStateToProps: (state: any) => ({
        choices: (state.datasource?.columns || []).map((col: { column_name: string }) => [
          col.column_name,
          col.column_name,
        ]),
      }),
      renderTrigger: true,
    },
  };
}

/**
 * Helper to create a text control for a box label.
 */
function labelControl(name: string, label: string, defaultValue: string) {
  return {
    name,
    config: {
      type: 'TextControl' as const,
      label: t(label),
      default: defaultValue,
      renderTrigger: true,
    },
  };
}

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Display'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'font_size',
            config: {
              type: 'SliderControl' as const,
              label: t('Font size (px)'),
              default: 14,
              min: 8,
              max: 32,
              step: 1,
              renderTrigger: true,
              description: t('Base font size for all text in the chart'),
            },
          },
        ],
      ],
    },
    {
      label: t('Root — Input data'),
      expanded: false,
      controlSetRows: [
        [labelControl('label_root', 'Title', "Bagages données d'entrée")],
        [columnSelector('col_root', 'Column', 'TotalDonneesEntree', 'SQL column for this box')],
      ],
    },
    {
      label: t('Level 1 — Excluded / Simulated'),
      expanded: false,
      controlSetRows: [
        [labelControl('label_excluded', 'Excluded — Title', 'Bagages exclus')],
        [columnSelector('col_excluded', 'Excluded — Column', 'BagagesExclus', 'SQL column')],
        [labelControl('label_simulated', 'Simulated — Title', 'Bagages simulés')],
        [columnSelector('col_simulated', 'Simulated — Column', 'TotalSimulation', 'SQL column')],
      ],
    },
    {
      label: t('Level 2 — Blocked / Processed'),
      expanded: false,
      controlSetRows: [
        [labelControl('label_blocked', 'Blocked — Title', 'Bagages bloqués')],
        [columnSelector('col_blocked', 'Blocked — Column', 'BagagesBloques', 'SQL column')],
        [labelControl('label_processed', 'Processed — Title', 'Bagages traités')],
        [columnSelector('col_processed', 'Processed — Column', 'BagagesTraites', 'SQL column')],
      ],
    },
    {
      label: t('Level 3 — Arrived / Not arrived / End stock'),
      expanded: false,
      controlSetRows: [
        [labelControl('label_arrived', 'Arrived — Title', 'Arrivés à destination')],
        [columnSelector('col_arrived', 'Arrived — Column', 'ArrivesADestination', 'SQL column')],
        [labelControl('label_not_arrived', 'Not arrived — Title', 'Non arrivés à destination')],
        [columnSelector('col_not_arrived', 'Not arrived — Column', 'NonArrives', 'SQL column')],
        [labelControl('label_end_stock', 'End stock — Title', 'Fin en stock')],
        [columnSelector('col_end_stock', 'End stock — Column', 'FinAuStock', 'SQL column')],
      ],
    },
    {
      label: t('Level 4 — Arrived details'),
      expanded: false,
      controlSetRows: [
        [labelControl('label_on_time', 'On time — Title', 'Arrivés à temps')],
        [columnSelector('col_on_time', 'On time — Column', 'ATemps', 'SQL column')],
        [labelControl('label_last_minute', 'Last minute — Title', 'Dernière minute')],
        [columnSelector('col_last_minute', 'Last minute — Column', 'DerniereMinute', 'SQL column')],
      ],
    },
    {
      label: t('Level 4 — Not arrived details'),
      expanded: false,
      controlSetRows: [
        [labelControl('label_missed', 'Missed — Title', 'Ratés')],
        [columnSelector('col_missed', 'Missed — Column', 'BagagesRates', 'SQL column')],
        [labelControl('label_recirculation', 'Recirculation — Title', 'Rebuts recirculation')],
        [
          columnSelector(
            'col_recirculation',
            'Recirculation — Column',
            'RebutRecirculation',
            'SQL column',
          ),
        ],
        [labelControl('label_ultimate_control', 'Ultimate control — Title', 'Controle ultime')],
        [
          columnSelector(
            'col_ultimate_control',
            'Ultimate control — Column',
            'ControleUltime',
            'SQL column',
          ),
        ],
        [labelControl('label_other_rejects', 'Other rejects — Title', 'Autres rebuts')],
        [
          columnSelector(
            'col_other_rejects',
            'Other rejects — Column',
            'AutresRebut',
            'SQL column',
          ),
        ],
      ],
    },
    {
      label: t('Level 4 — Stock details'),
      expanded: false,
      controlSetRows: [
        [labelControl('label_passed_stock', 'Passed to stock — Title', 'Passés au stock')],
        [
          columnSelector(
            'col_passed_stock',
            'Passed to stock — Column',
            'PassesAuStock',
            'SQL column',
          ),
        ],
      ],
    },
  ],
};

export default config;
