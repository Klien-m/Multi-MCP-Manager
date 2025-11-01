import React from 'react';
import MCPDataList from '../components/MCPDataList';
import { useMcpCollections } from '../services/useDataQueries';
import { useT } from '../i18n';

export const MCPManager: React.FC = () => {
  const { data: mcpCollections = [], isLoading, error } = useMcpCollections();
  const t = useT();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('mcpManager.title')}</h1>
        <p className="text-gray-600 mt-1">{t('mcpManager.description')}</p>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{t('errors.loadMCPError', { message: error.message })}</p>
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