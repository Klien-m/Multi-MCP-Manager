import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Settings as SettingsIcon,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Database,
  FileText,
  Monitor,
  Code,
  Key
} from 'lucide-react';
import { useT } from '../i18n';

interface SettingsForm {
  autoBackup: boolean;
  backupInterval: number;
  defaultExportFormat: 'json' | 'yaml';
  theme: 'light' | 'dark' | 'system';
  showAdvancedOptions: boolean;
  notificationEnabled: boolean;
  telemetryEnabled: boolean;
}

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SettingsForm>({
    autoBackup: true,
    backupInterval: 24,
    defaultExportFormat: 'json',
    theme: 'system',
    showAdvancedOptions: false,
    notificationEnabled: true,
    telemetryEnabled: false
  });
  const t = useT();

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    
    try {
      // 模拟保存设置
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus(t('settings.saveSettingsSuccess'));
    } catch (error) {
      setSaveStatus(t('settings.saveSettingsError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // 重置为默认设置
    setSettings({
      autoBackup: true,
      backupInterval: 24,
      defaultExportFormat: 'json',
      theme: 'system',
      showAdvancedOptions: false,
      notificationEnabled: true,
      telemetryEnabled: false
    });
  };

  const handleChange = (field: keyof SettingsForm, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <SettingsIcon className="h-6 w-6 mr-2" />
          {t('settings.title')}
        </h1>
        <p className="text-gray-600 mt-1">{t('settings.description')}</p>
      </div>

      {saveStatus && (
        <div className={`mb-4 p-4 rounded-lg ${
          saveStatus.includes(t('common.success')) ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          <div className="flex items-center">
            {saveStatus.includes(t('common.success')) ? (
              <CheckCircle className="h-4 w-4 mr-2" />
            ) : (
              <AlertCircle className="h-4 w-4 mr-2" />
            )}
            {saveStatus}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* 常规设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Monitor className="h-5 w-5 mr-2" />
              {t('settings.general')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.theme')}</label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleChange('theme', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">{t('settings.light')}</option>
                  <option value="dark">{t('settings.dark')}</option>
                  <option value="system">{t('settings.system')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.defaultExportFormat')}</label>
                <select
                  value={settings.defaultExportFormat}
                  onChange={(e) => handleChange('defaultExportFormat', e.target.value as 'json' | 'yaml')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="json">{t('formats.json')}</option>
                  <option value="yaml">{t('formats.yaml')}</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('settings.showAdvancedOptions')}</label>
                <p className="text-sm text-gray-500">{t('settings.showAdvancedOptionsDescription')}</p>
              </div>
              <input
                type="checkbox"
                checked={settings.showAdvancedOptions}
                onChange={(e) => handleChange('showAdvancedOptions', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </CardContent>
        </Card>

        {/* 备份设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              {t('settings.backup')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('settings.autoBackup')}</label>
                <p className="text-sm text-gray-500">{t('settings.autoBackupDescription')}</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={(e) => handleChange('autoBackup', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            {settings.autoBackup && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.backupInterval')}</label>
                <select
                  value={settings.backupInterval}
                  onChange={(e) => handleChange('backupInterval', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>{t('settings.everyHour')}</option>
                  <option value={6}>{t('settings.every6Hours')}</option>
                  <option value={12}>{t('settings.every12Hours')}</option>
                  <option value={24}>{t('settings.daily')}</option>
                  <option value={48}>{t('settings.every2Days')}</option>
                  <option value={168}>{t('settings.weekly')}</option>
                </select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 通知设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              {t('settings.notifications')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('settings.enableNotifications')}</label>
                <p className="text-sm text-gray-500">{t('settings.enableNotificationsDescription')}</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notificationEnabled}
                onChange={(e) => handleChange('notificationEnabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </CardContent>
        </Card>

        {/* 高级设置 */}
        {settings.showAdvancedOptions && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="h-5 w-5 mr-2" />
                {t('settings.advanced')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('settings.enableTelemetry')}</label>
                  <p className="text-sm text-gray-500">{t('settings.telemetryDescription')}</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.telemetryEnabled}
                  onChange={(e) => handleChange('telemetryEnabled', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* 保存按钮 */}
        <div className="flex gap-4 pt-4 border-t">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? t('settings.saving') : t('settings.saveSettings')}
          </Button>
          
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            {t('settings.reset')}
          </Button>
        </div>
      </div>
    </div>
  );
};