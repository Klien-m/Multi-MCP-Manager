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
        <CardTitle>{isEditing ? '编辑工具配置' : '添加新工具'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">工具名称</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="例如: cursor"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">显示名称</label>
            <input
              type="text"
              value={formData.displayName || ''}
              onChange={(e) => handleChange('displayName', e.target.value)}
              placeholder="例如: Cursor"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">默认路径</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.defaultPath || ''}
                onChange={(e) => handleChange('defaultPath', e.target.value)}
                placeholder="默认MCP文件路径"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">自定义路径</label>
            <input
              type="text"
              value={formData.customPath || ''}
              onChange={(e) => handleChange('customPath', e.target.value)}
              placeholder="可选的自定义路径"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">支持格式</label>
            <input
              type="text"
              value={formData.supportedFormats?.join(', ') || ''}
              onChange={(e) => handleChange('supportedFormats', e.target.value.split(',').map(f => f.trim()))}
              placeholder="json, yaml, yml"
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
              启用此工具
            </label>
          </div>

          <div className="flex gap-2">
            <Button variant="primary" onClick={handleSubmit}>
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
            <Button variant="secondary" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              取消
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
            AI配置设置
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">默认工具</label>
              <select
                value={aiConfig.defaultTool || ''}
                onChange={(e) => handleConfigChange('defaultTool', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">选择默认工具</option>
                {aiConfig.tools.map(tool => (
                  <option key={tool.id} value={tool.id}>{tool.displayName || tool.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">自动同步</label>
                <p className="text-sm text-gray-500">自动检测和读取MCP文件更改</p>
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
                <label className="block text-sm font-medium text-gray-700">备份启用</label>
                <p className="text-sm text-gray-500">自动创建MCP数据备份</p>
              </div>
              <input
                type="checkbox"
                checked={aiConfig.backupEnabled}
                onChange={(e) => handleConfigChange('backupEnabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">备份间隔 (小时)</label>
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
            工具配置管理
          </CardTitle>
          <Button variant="primary" onClick={handleAddTool}>
            <PlusCircle className="h-4 w-4 mr-2" />
            添加工具
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
                        {tool.isActive ? '已启用' : '已禁用'}
                      </span>
                      {tool.error && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>工具名称: {tool.name}</div>
                      <div>默认路径: {tool.defaultPath}</div>
                      {tool.customPath && (
                        <div>自定义路径: {tool.customPath}</div>
                      )}
                      <div>支持格式: {tool.supportedFormats.join(', ')}</div>
                      {tool.lastSync && (
                        <div>最后同步: {new Date(tool.lastSync).toLocaleString('zh-CN')}</div>
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无配置的工具</h3>
                <p className="text-gray-600 mb-4">请添加工具配置以开始使用MCP统一管理器</p>
                <Button variant="primary" onClick={handleAddTool}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加第一个工具
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