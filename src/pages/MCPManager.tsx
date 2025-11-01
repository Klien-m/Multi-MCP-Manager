import React from 'react';
import MCPDataList from '../components/MCPDataList';
import { useMcpCollections } from '../services/useDataQueries';

export const MCPManager: React.FC = () => {
  const { data: mcpCollections = [], isLoading, error } = useMcpCollections();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">MCP Manager</h1>
        <p className="text-gray-600 mt-1">管理您的MCP数据集合</p>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">加载MCP数据时出错: {error.message}</p>
        </div>
      )}
      
      <MCPDataList
        mcpData={mcpCollections}
        loading={isLoading}
        error={error?.message}
      />
    </div>
  );
};