import React, { ChangeEvent, PureComponent } from 'react';
import { IconButton, LegacyForms } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { ConfigSection, DataSourceDescription } from '@grafana/plugin-ui';
import { JDBCSettings, SecureJDBCSettings } from '../types';
import { css } from '@emotion/css';
import { Components } from './selectors';
import { settings } from './settings';

const { FormField } = LegacyForms;

export interface Props extends DataSourcePluginOptionsEditorProps<JDBCSettings> {}

interface State {
  fields: string[];
  editing: boolean;
  name: string;
  value: string;
  secure: boolean;
}

const Divider = () => <hr style={{ marginTop: '32px', marginBottom: '32px' }} />;

export class ConfigEditor extends PureComponent<Props, State> {
  onChangeSettingName = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({ ...(this.state || {}), name: event.target.value });
  };

  onChangeSettingValue = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({ ...(this.state || {}), value: event.target.value });
  };

  onChange = (event: ChangeEvent<HTMLInputElement>, prop: string) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      [prop]: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  // Secure field (only sent to the backend)
  onSecureChange = (event: ChangeEvent<HTMLInputElement>, prop: string) => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonData: {
        [prop]: event.target.value,
      },
    });
  };

  onResetSecure = (prop: string) => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        [prop]: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        [prop]: '',
      },
    });
  };

  onOptionsChange = () => {};

  onAddSetting = () => {
    this.setState({ ...(this.state || {}), editing: true });
  };

  onChangeSetting = (event: ChangeEvent<HTMLInputElement>, prop: string) => {
    const { onOptionsChange, options } = this.props;
    // const settings = settings || [];
    const update = settings.map((s) => {
      if (s.name === prop) {
        return { name: prop, value: event.target.value, secure: s.secure };
      }
      return s;
    });
    const jsonData = {
      ...options.jsonData,
      settings: update,
    };
    onOptionsChange({ ...options, jsonData });
  };

  onSaveSetting = () => {
    const { onOptionsChange, options } = this.props;
    const settings = options.jsonData.settings || [];
    if (!this.state.secure) {
      const updated = [...settings, { name: this.state.name, value: this.state.value, secure: this.state.secure }];
      const jsonData = {
        ...options.jsonData,
        settings: updated,
      };
      onOptionsChange({ ...options, jsonData });
    } else {
      const updated = [...settings, { name: this.state.name, secure: this.state.secure }];
      const jsonData = {
        ...options.jsonData,
        settings: updated,
      };
      const secureJsonData = (options.secureJsonData || {}) as SecureJDBCSettings;
      const updatedSecure = {
        ...secureJsonData,
        [this.state.name]: this.state.value,
      };
      onOptionsChange({ ...options, jsonData, secureJsonData: updatedSecure });
    }

    this.setState({ ...(this.state || {}), editing: false, name: '', value: '', secure: false });
  };

  onRemoveSetting = (prop: string) => {
    const { onOptionsChange, options } = this.props;
    const settings = options.jsonData.settings || [];
    const updated = settings.filter((s) => s.name !== prop);

    if (options.secureJsonFields[prop]) {
      const jsonData = {
        ...options.jsonData,
        settings: updated,
        secureJsonFields: {
          ...options.secureJsonFields,
          [prop]: false,
        },
        secureJsonData: {
          ...options.secureJsonData,
          [prop]: '',
        },
      };
      onOptionsChange({ ...options, jsonData });
      return;
    }
    const jsonData = {
      ...options.jsonData,
      settings: updated,
    };
    onOptionsChange({ ...options, jsonData });
  };

  inputIcon = css`
    input {
      padding-right: 25px;
    }
  `;

  render() {
    const { options } = this.props;
    const { jsonData } = options;
    const secureJsonData = (options.secureJsonData || {}) as SecureJDBCSettings;

    const settings = jsonData.settings || [];

    const editor = Components.ConfigEditor;

    return (
      <div className="gf-form-group">
        <DataSourceDescription
          dataSourceName="Sql Connect"
          docsLink="https://grafana.com/grafana/plugins/grafana-sqlconnect-datasource/"
          hasRequiredFields
        />

        <Divider />

        <ConfigSection
          title="Connection Settings"
          description="These settings will be parsed into key value pairs and concatenated to create the Connection string the plugin will use. For additional settings, please check the keys match exactly what your database requires in a connection string."
        >
          <div style={{ display: 'flex', padding: '5px', marginTop: '16px' }}>
            <h5>Driver Settings</h5>
            <IconButton
              aria-label={editor.AddSettingButton.ariaLabel}
              type="button"
              name="plus"
              size="lg"
              style={{ marginLeft: '5px', marginTop: '2px' }}
              onClick={this.onAddSetting}
            ></IconButton>
          </div>

          {this.state?.editing && (
            <div style={{ display: 'flex', marginBottom: '15px', position: 'relative' }}>
              <FormField
                aria-label={editor.SettingName.ariaLabel}
                label={editor.SettingName.label}
                labelWidth={3}
                inputWidth={10}
                onChange={this.onChangeSettingName}
                value={this.state?.name || ''}
                placeholder={editor.SettingName.placeholder}
              />
              <div style={{ position: 'relative' }}>
                <FormField
                  aria-label={editor.SettingValue.ariaLabel}
                  label={editor.SettingValue.label}
                  className={this.inputIcon}
                  labelWidth={3}
                  inputWidth={16}
                  onChange={this.onChangeSettingValue}
                  value={this.state?.value || ''}
                  placeholder={editor.SettingValue.placeholder}
                  type={this.state.secure ? 'password' : 'text'}
                />
                <IconButton
                  type="button"
                  name={this.state.secure ? 'unlock' : 'lock'}
                  size="sm"
                  style={{ marginLeft: '5px', marginTop: '8px', position: 'absolute', right: '5px', top: '0' }}
                  onClick={() => {
                    this.setState({ ...this.state, secure: !this.state.secure });
                  }}
                  aria-label=""
                ></IconButton>
              </div>
              <IconButton
                aria-label={editor.SaveButton.label}
                type="button"
                name="save"
                size="lg"
                style={{ marginLeft: '5px', marginTop: '5px' }}
                onClick={this.onSaveSetting}
              ></IconButton>
            </div>
          )}

          {settings.map((s) => {
            return (
              <div key={s.name} style={{ display: 'flex', marginBottom: '5px' }}>
                {!s.secure && (
                  <FormField
                    label={s.name}
                    labelWidth={10}
                    inputWidth={30}
                    onChange={(e) => this.onChangeSetting(e, s.name)}
                    value={s.value || ''}
                    placeholder="Setting value"
                  />
                )}
                {s.secure && (
                  <FormField
                    label={s.name}
                    labelWidth={10}
                    inputWidth={30}
                    onChange={(e) => this.onSecureChange(e, s.name)}
                    value={secureJsonData[s.name] === undefined ? '************' : secureJsonData[s.name]}
                    type="password"
                  />
                )}
                <IconButton
                  type="button"
                  name="trash-alt"
                  size="lg"
                  style={{ marginLeft: '5px', marginTop: '5px' }}
                  onClick={() => this.onRemoveSetting(s.name)}
                  aria-label=""
                ></IconButton>
              </div>
            );
          })}
        </ConfigSection>
      </div>
    );
  }
}
