import React, { useState, useEffect } from 'react';
import { ToolConfig, AIConfig } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Check,
  AlertCircle,
  Folder,
  Settings,
  Monitor,
  PlusCircle
} from 'lucide-react';
import { useT } from '../i18n';

interface ToolConfigManagerProps {
  aiConfig: AIConfig;
  onConfigChange: (config: AIConfig) => void;
  onToolAdd: (tool: ToolConfig) => void;
  onToolUpdate: (tool: ToolConfig) => void;
  onToolDelete: (toolId: string) => void;
}

interface ToolFormProps {
  tool: Partial<ToolConfig>;
  onSave: (tool: Partial<ToolConfig>) => void;
  onCancel: () => void;
  isEditing: boolean;
}

const ToolForm: React.FC<ToolFormProps> = ({ tool, onSave, onCancel, isEditing }) => {
  const t = useT();
  const [formData, setFormData] = useState<Partial<ToolConfig>>({
    name: '',
    displayName: '',
    defaultPath: '',
    customPath: '',
    supportedFormats: ['json'],
    isActive: true,
    ...tool
  });

  const handleChange = (field: keyof ToolConfig, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  const defaultPaths: Record<string, string> = {
    'cursor': '~/Library/Application Support/Cursor/User/mcp.json',
    'github-copilot': '~/.config/gh-copilot/mcp.json',
    'tabnine': '~/.config/tabnine/mcp.json',
    'codex': '~/.config/openai-codex/mcp.json',
    'kilocode': '~/.config/kilocode/mcp.json'
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{isEditing ? t('toolForm.editTitle') : t('toolForm.addTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('toolForm.toolName')}</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder={t('toolForm.toolNamePlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('toolForm.displayName')}</label>
            <input
              type="text"
              value={formData.displayName || ''}
              onChange={(e) => handleChange('displayName', e.target.value)}
              placeholder={t('toolForm.displayNamePlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('toolForm.defaultPath')}</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.defaultPath || ''}
                onChange={(e) => handleChange('defaultPath', e.target.value)}
                placeholder={t('toolForm.defaultPathPlaceholder')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                onChange={(e) => handleChange('defaultPath', defaultPaths[e.target.value] || '')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">选择预设路径</option>
                {Object.entries(defaultPaths).map(([key, path]) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('toolForm.customPath')}</label>
            <input
              type="text"
              value={formData.customPath || ''}
              onChange={(e) => handleChange('customPath', e.target.value)}
              placeholder={t('toolForm.customPathPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('toolForm.supportedFormats')}</label>
            <input
              type="text"
              value={formData.supportedFormats?.join(', ') || ''}
              onChange={(e) => handleChange('supportedFormats', e.target.value.split(',').map(f => f.trim()))}
              placeholder={t('toolForm.supportedFormatsPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive || false}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              {t('toolForm.enableTool')}
            </label>
          </div>

          <div className="flex gap-2">
            <Button variant="primary" onClick={handleSubmit}>
              <Save className="h-4 w-4 mr-2" />
              {t('toolForm.save')}
            </Button>
            <Button variant="secondary" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              {t('toolForm.cancel')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ToolConfigManager: React.FC<ToolConfigManagerProps> = ({
  aiConfig,
  onConfigChange,
  onToolAdd,
  onToolUpdate,
  onToolDelete
}) => {
  const t = useT();
  const [editingTool, setEditingTool] = useState<Partial<ToolConfig> | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddTool = () => {
    setEditingTool({
      id: `tool_${Date.now()}`,
      name: '',
      displayName: '',
      defaultPath: '',
      supportedFormats: ['json'],
      isActive: true
    });
    setShowAddForm(true);
  };

  const handleEditTool = (tool: ToolConfig) => {
    setEditingTool(tool);
    setShowAddForm(false);
  };

  const handleSaveTool = (toolData: Partial<ToolConfig>) => {
    if (showAddForm) {
      onToolAdd(toolData as ToolConfig);
    } else {
      onToolUpdate(toolData as ToolConfig);
    }
    setEditingTool(null);
    setShowAddForm(false);
  };

  const handleCancelEdit = () => {
    setEditingTool(null);
    setShowAddForm(false);
  };

  const handleConfigChange = (field: keyof AIConfig, value: any) => {
    onConfigChange({
      ...aiConfig,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      {/* AI配置设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            {t('toolConfigManager.aiConfigTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('toolConfigManager.defaultTool')}</label>
              <select
                value={aiConfig.defaultTool || ''}
                onChange={(e) => handleConfigChange('defaultTool', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('toolConfigManager.selectDefaultTool')}</option>
                {aiConfig.tools.map(tool => (
                  <option key={tool.id} value={tool.id}>{tool.displayName || tool.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('toolConfigManager.autoSync')}</label>
                <p className="text-sm text-gray-500">{t('toolConfigManager.autoSyncDescription')}</p>
              </div>
              <input
                type="checkbox"
                checked={aiConfig.autoSync}
                onChange={(e) => handleConfigChange('autoSync', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('toolConfigManager.backupEnabled')}</label>
                <p className="text-sm text-gray-500">{t('toolConfigManager.backupEnabledDescription')}</p>
              </div>
              <input
                type="checkbox"
                checked={aiConfig.backupEnabled}
                onChange={(e) => handleConfigChange('backupEnabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('toolConfigManager.backupInterval')}</label>
              <input
                type="number"
                value={aiConfig.backupInterval}
                onChange={(e) => handleConfigChange('backupInterval', parseInt(e.target.value))}
                min="1"
                max="24"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 工具列表 */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Monitor className="h-5 w-5 mr-2" />
            {t('toolConfigManager.toolConfigTitle')}
          </CardTitle>
          <Button variant="primary" onClick={handleAddTool}>
            <PlusCircle className="h-4 w-4 mr-2" />
            {t('toolConfigManager.addTool')}
          </Button>
        </CardHeader>
        <CardContent>
          {editingTool && (
            <ToolForm
              tool={editingTool}
              onSave={handleSaveTool}
              onCancel={handleCancelEdit}
              isEditing={!!editingTool.id}
            />
          )}

          <div className="space-y-4">
            {aiConfig.tools.map(tool => (
              <div key={tool.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900">{tool.displayName || tool.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        tool.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {tool.isActive ? t('toolConfigManager.enabled') : t('toolConfigManager.disabled')}
                      </span>
                      {tool.error && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>{t('toolConfigManager.toolName')}: {tool.name}</div>
                      <div>{t('toolConfigManager.defaultPath')}: {tool.defaultPath}</div>
                      {tool.customPath && (
                        <div>{t('toolConfigManager.customPath')}: {tool.customPath}</div>
                      )}
                      <div>{t('toolConfigManager.supportedFormats')}: {tool.supportedFormats.join(', ')}</div>
                      {tool.lastSync && (
                        <div>{t('toolConfigManager.lastSync')}: {new Date(tool.lastSync).toLocaleString('zh-CN')}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditTool(tool)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onToolDelete(tool.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {aiConfig.tools.length === 0 && !editingTool && (
              <div className="text-center py-8">
                <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('toolConfigManager.noToolsTitle')}</h3>
                <p className="text-gray-600 mb-4">{t('toolConfigManager.noToolsDescription')}</p>
                <Button variant="primary" onClick={handleAddTool}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('toolConfigManager.addFirstTool')}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ToolConfigManager;