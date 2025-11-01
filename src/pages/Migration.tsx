import React, { useState } from 'react';
import { MigrationWorkflow } from '../components/MigrationWorkflow';
import { useAppStore } from '../store/appStore';
import { useT } from '../i18n';

export const Migration: React.FC = () => {
  const { mcpCollections, toolConfigs } = useAppStore();
  const [selectedSourceTool, setSelectedSourceTool] = useState<string>('');
  const [selectedTargetTool, setSelectedTargetTool] = useState<string>('');
  const [selectedMcpIds, setSelectedMcpIds] = useState<string[]>([]);
  const t = useT();

  const handleStartMigration = () => {
    // 开始迁移流程
  };

  const handleMigrationComplete = () => {
    // 处理迁移完成
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('migration.title')}</h1>
        <p className="text-gray-600 mt-1">{t('migration.description')}</p>
      </div>
      
      <MigrationWorkflow
        onMigrationComplete={handleMigrationComplete}
      />
    </div>
  );
};