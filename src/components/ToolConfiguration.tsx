import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  Folder,
  Settings
} from 'lucide-react';
import { useT } from '../i18n';
import { ToolConfig, ValidationResult } from '../types';
import { ToolConfigManager } from '../services/toolConfigManager';
import { CustomDirectoryService } from '../services/customDirectoryService';
import { ConfigValidationService } from '../services/configValidationService';
import { fileScannerService } from '../services/fileScanner';

interface ToolConfigurationProps {
  onConfigChange?: (tools: ToolConfig[]) => void;
}

export const ToolConfiguration: React.FC<ToolConfigurationProps> = ({ onConfigChange }) => {
  const t = useT();
  const [tools, setTools] = useState<ToolConfig[]>([]);
  const [customDirectories, setCustomDirectories] = useState<{ [toolName: string]: string[] }>({});
  const [validationResults, setValidationResults] = useState<{ [toolName: string]: ValidationResult }>({});
  const [healthReport, setHealthReport] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 加载配置
  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 加载工具配置
      const toolConfigs = await ToolConfigManager.getToolConfigs();
      setTools(toolConfigs);
      
      // 加载自定义目录
      const customConfig = await CustomDirectoryService.getCustomDirectories();
      setCustomDirectories(customConfig.customPaths);
      
      // 验证配置
      await validateAllConfigs(toolConfigs);
      
      // 生成健康报告
      const report = await ConfigValidationService.generateHealthReport(toolConfigs);
      setHealthReport(report);
      
    } catch (err) {
      setError(`加载配置失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const validateAllConfigs = async (toolConfigs: ToolConfig[]) => {
    const results: { [toolName: string]: ValidationResult } = {};
    
    for (const tool of toolConfigs) {
      const result = await ConfigValidationService.validateToolConfig(tool);
      results[tool.name] = result;
    }
    
    setValidationResults(results);
  };

  const handleToolChange = (toolName: string, field: keyof ToolConfig, value: any) => {
    const updatedTools = tools.map(tool => 
      tool.name === toolName ? { ...tool, [field]: value } : tool
    );
    setTools(updatedTools);
    
    // 实时验证
    const tool = updatedTools.find(t => t.name === toolName);
    if (tool) {
      ConfigValidationService.validateToolConfig(tool).then(result => {
        setValidationResults(prev => ({
          ...prev,
          [toolName]: result
        }));
      });
    }
  };

  const addCustomDirectory = async (toolName: string, directory: string) => {
    if (!directory.trim()) return;
    
    try {
      await CustomDirectoryService.addCustomDirectory(
        tools.find(t => t.name === toolName)!,
        directory
      );
      
      // 重新加载自定义目录
      const customConfig = await CustomDirectoryService.getCustomDirectories();
      setCustomDirectories(customConfig.customPaths);
      
      setSuccessMessage('自定义目录添加成功');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(`添加自定义目录失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  const removeCustomDirectory = async (toolName: string, directory: string) => {
    try {
      await CustomDirectoryService.removeCustomDirectory(
        tools.find(t => t.name === toolName)!,
        directory
      );
      
      // 重新加载自定义目录
      const customConfig = await CustomDirectoryService.getCustomDirectories();
      setCustomDirectories(customConfig.customPaths);
      
      setSuccessMessage('自定义目录删除成功');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(`删除自定义目录失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  const scanCustomDirectories = async () => {
    try {
      setIsScanning(true);
      setError(null);
      
      const results = await CustomDirectoryService.scanCustomDirectories();
      
      // 更新工具的最后同步时间
      const updatedTools = tools.map(tool => ({
        ...tool,
        lastSync: results[tool.name] ? new Date().toISOString() : tool.lastSync
      }));
      setTools(updatedTools);
      
      setSuccessMessage(`扫描完成，发现 ${Object.keys(results).length} 个工具的MCP文件`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(`扫描自定义目录失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setIsScanning(false);
    }
  };

  const saveConfiguration = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 验证所有配置
      const configResult = await ConfigValidationService.validateAllToolConfigs(tools);
      if (!configResult.isValid) {
        setError(`配置验证失败: ${configResult.errors.join(', ')}`);
        return;
      }
      
      // 保存工具配置
      await ToolConfigManager.saveToolConfigs(tools);
      
      setSuccessMessage('配置保存成功');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // 通知父组件
      if (onConfigChange) {
        onConfigChange(tools);
      }
      
    } catch (err) {
      setError(`保存配置失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshHealthReport = async () => {
    try {
      const report = await ConfigValidationService.generateHealthReport(tools);
      setHealthReport(report);
      setSuccessMessage('健康报告已更新');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(`更新健康报告失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  const getValidationIcon = (result: ValidationResult) => {
    if (!result) return null;
    
    if (result.isValid && result.errors.length === 0 && result.warnings.length === 0) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    if (result.errors.length > 0) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  const getValidationStatus = (result: ValidationResult) => {
    if (!result) return '未知';
    
    if (result.isValid && result.errors.length === 0 && result.warnings.length === 0) {
      return '正常';
    }
    
    if (result.errors.length > 0) {
      return '错误';
    }
    
    return '警告';
  };

  return (
    <div className="space-y-6 p-6">
      {/* 顶部操作栏 */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('toolConfig.title')}</h1>
        <div className="flex space-x-2">
          <Button onClick={scanCustomDirectories}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? '扫描中...' : '扫描自定义目录'}
          </Button>
          <Button onClick={saveConfiguration}>
            <Save className="h-4 w-4 mr-2" />
            {t('toolConfig.saveConfig')}
          </Button>
        </div>
      </div>

      {/* 错误和成功消息 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            <span className="text-green-700">{successMessage}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 健康报告 */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              {t('toolConfig.healthReport')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {healthReport.map((report, index) => (
                <div key={index} className="text-sm">
                  {report}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 工具配置列表 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('toolConfig.toolConfig')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {tools.map((tool) => (
                <div key={tool.name} className="border border-gray-200 rounded-md p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{tool.displayName}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        validationResults[tool.name]?.isValid ? 'bg-green-100 text-green-800' : 
                        validationResults[tool.name]?.errors.length > 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {getValidationStatus(validationResults[tool.name])}
                      </span>
                    </div>
                    {getValidationIcon(validationResults[tool.name])}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor={`defaultPath-${tool.name}`} className="block text-sm font-medium text-gray-700 mb-1">
                        默认路径
                      </label>
                      <input
                        id={`defaultPath-${tool.name}`}
                        type="text"
                        value={tool.defaultPath}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleToolChange(tool.name, 'defaultPath', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={t('toolConfig.enterDefaultPath')}
                      />
                    </div>
                    <div>
                      <label htmlFor={`customPath-${tool.name}`} className="block text-sm font-medium text-gray-700 mb-1">
                        {t('toolConfig.customPath')}
                      </label>
                      <input
                        id={`customPath-${tool.name}`}
                        type="text"
                        value={tool.customPath || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleToolChange(tool.name, 'customPath', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={t('toolConfig.optionalUseDefault')}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('toolConfig.activeStatus')}</label>
                      <input
                        type="checkbox"
                        checked={tool.isActive}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleToolChange(tool.name, 'isActive', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('toolConfig.supportedFormats')}</label>
                      <div className="text-sm text-gray-600">
                        {tool.supportedFormats.join(', ')}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('toolConfig.lastSync')}</label>
                      <div className="text-sm text-gray-600">
                        {tool.lastSync ? new Date(tool.lastSync).toLocaleDateString() : t('toolConfig.never')}
                      </div>
                    </div>
                  </div>

                  {/* 自定义目录管理 */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('toolConfig.customDirectories')}</label>
                    {customDirectories[tool.name] && customDirectories[tool.name].length > 0 ? (
                      <div className="space-y-2">
                        {customDirectories[tool.name].map((directory, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Folder className="h-4 w-4 text-blue-500" />
                            <span className="text-sm flex-1">{directory}</span>
                            <button
                              onClick={() => removeCustomDirectory(tool.name, directory)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">{t('toolConfig.noCustomDirectories')}</div>
                    )}
                    
                    <div className="flex space-x-2 mt-2">
                      <input
                        type="text"
                        placeholder={t('toolConfig.addCustomDirectory')}
                        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === 'Enter') {
                            addCustomDirectory(tool.name, e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          const input = document.querySelector(`input[placeholder="${t('toolConfig.addCustomDirectory')}"]`) as HTMLInputElement;
                          if (input) {
                            addCustomDirectory(tool.name, input.value);
                            input.value = '';
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* 验证结果详情 */}
                  {validationResults[tool.name] && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      {validationResults[tool.name].errors.length > 0 && (
                        <div className="mb-2">
                          <div className="text-sm font-semibold text-red-600 mb-1">{t('toolConfig.errors')}:</div>
                          <ul className="text-sm text-red-500 space-y-1">
                            {validationResults[tool.name].errors.map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {validationResults[tool.name].warnings.length > 0 && (
                        <div>
                          <div className="text-sm font-semibold text-yellow-600 mb-1">{t('toolConfig.warnings')}:</div>
                          <ul className="text-sm text-yellow-500 space-y-1">
                            {validationResults[tool.name].warnings.map((warning, index) => (
                              <li key={index}>• {warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 底部状态栏 */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <div>
          {t('toolConfig.totalTools', { total: tools.length, active: tools.filter(t => t.isActive).length })}
        </div>
        <div>
          {t('toolConfig.lastUpdated')}: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
};