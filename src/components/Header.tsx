import React from 'react';
import { useT } from '../i18n';

export const Header: React.FC = () => {
  const t = useT();
  
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold text-gray-900">
          MCP统一管理器
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {t('mcpManager.description')}
          </div>
        </div>
      </div>
    </header>
  );
};