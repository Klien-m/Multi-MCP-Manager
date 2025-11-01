import React from 'react';
import ToolConfigManager from '../components/ToolConfigManager';
import { useToolConfigs } from '../services/useDataQueries';
import { useAppStore } from '../store/appStore';

export const ToolConfig: React.FC = () => {
  const { data: toolConfigs = [], isLoading, error } = useToolConfigs();
  const { aiConfig } = useAppStore();

  const handleConfigChange = (config: any) => {
    // 更新AI配置
  };

  const handleToolAdd = (tool: any) => {
    // 添加工具配置
  };

  const handleToolUpdate = (tool: any) => {
    // 更新工具配置
  };

  const handleToolDelete = (toolId: string) => {
    // 删除工具配置
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">工具配置</h1>
        <p className="text-gray-600 mt-1">配置AI编程工具和MCP文件路径</p>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">加载工具配置时出错: {error.message}</p>
        </div>
      )}
      
      <ToolConfigManager
        aiConfig={aiConfig}
        onConfigChange={handleConfigChange}
        onToolAdd={handleToolAdd}
        onToolUpdate={handleToolUpdate}
        onToolDelete={handleToolDelete}
      />
    </div>
  );
};