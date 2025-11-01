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

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    
    try {
      // 模拟保存设置
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('设置保存成功！');
    } catch (error) {
      setSaveStatus('保存设置时出错，请重试。');
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
          设置
        </h1>
        <p className="text-gray-600 mt-1">配置MCP统一管理器的偏好设置</p>
      </div>

      {saveStatus && (
        <div className={`mb-4 p-4 rounded-lg ${
          saveStatus.includes('成功') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          <div className="flex items-center">
            {saveStatus.includes('成功') ? (
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
              常规设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">主题</label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleChange('theme', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">浅色主题</option>
                  <option value="dark">深色主题</option>
                  <option value="system">跟随系统</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">默认导出格式</label>
                <select
                  value={settings.defaultExportFormat}
                  onChange={(e) => handleChange('defaultExportFormat', e.target.value as 'json' | 'yaml')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="json">JSON</option>
                  <option value="yaml">YAML</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">显示高级选项</label>
                <p className="text-sm text-gray-500">启用更多高级配置选项</p>
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
              备份设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">自动备份</label>
                <p className="text-sm text-gray-500">定期自动创建数据备份</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">备份间隔 (小时)</label>
                <select
                  value={settings.backupInterval}
                  onChange={(e) => handleChange('backupInterval', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>每小时</option>
                  <option value={6}>每6小时</option>
                  <option value={12}>每12小时</option>
                  <option value={24}>每天</option>
                  <option value={48}>每2天</option>
                  <option value={168}>每周</option>
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
              通知设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">启用通知</label>
                <p className="text-sm text-gray-500">接收重要事件的通知</p>
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
                高级设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">启用遥测</label>
                  <p className="text-sm text-gray-500">发送匿名使用数据以帮助改进产品</p>
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
            {isSaving ? '保存中...' : '保存设置'}
          </Button>
          
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            重置
          </Button>
        </div>
      </div>
    </div>
  );
};