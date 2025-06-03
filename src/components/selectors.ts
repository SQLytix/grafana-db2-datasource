import { E2ESelectors } from '@grafana/e2e-selectors';

export const Components = {
  ConfigEditor: {
    Driver: {
      label: 'Driver',
      placeholder: 'Driver',
      ariaLabel: 'Driver',
    },
    Timeout: {
      label: 'Timeout (seconds)',
      placeholder: '10',
      ariaLabel: 'Timeout',
    },
    AddSettingButton: {
      label: 'Add Setting',
      ariaLabel: 'Add Setting',
    },
    SettingName: {
      label: 'Name',
      ariaLabel: 'Setting Name',
      placeholder: 'Setting name',
    },
    SettingValue: {
      label: 'Value',
      ariaLabel: 'Setting Value',
      placeholder: 'Setting value',
    },
    SaveButton: {
      ariaLabel: 'Save',
      label: 'Save',
    },
    ToolTip:
      "This field either accepts a Driver name or a JDBC URL. If you're using a JDBC URL, make sure to include the driver name in the URL.",
  },
  QueryEditor: {
    CodeEditor: {
      label: `SQL Query`,
      tip: 'Tip: To re-run the query while you are editing, press ctrl/cmd+s.',
      input: () => '.monaco-editor textarea',
    },
    FormatAs: {
      label: `Format as`,
    },
  },
};

export const selectors: { components: E2ESelectors<typeof Components> } = {
  components: Components,
};
