import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold text-gray-900">
          MCP统一管理器
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            欢迎使用MCP数据管理工具
          </div>
        </div>
      </div>
    </header>
  );
};