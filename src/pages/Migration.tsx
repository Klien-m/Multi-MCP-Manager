import React, { useState } from 'react';
import { MigrationWorkflow } from '../components/MigrationWorkflow';
import { useAppStore } from '../store/appStore';

export const Migration: React.FC = () => {
  const { mcpCollections, toolConfigs } = useAppStore();
  const [selectedSourceTool, setSelectedSourceTool] = useState<string>('');
  const [selectedTargetTool, setSelectedTargetTool] = useState<string>('');
  const [selectedMcpIds, setSelectedMcpIds] = useState<string[]>([]);

  const handleStartMigration = () => {
    // 开始迁移流程
  };

  const handleMigrationComplete = () => {
    // 处理迁移完成
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">数据迁移</h1>
        <p className="text-gray-600 mt-1">跨工具MCP数据迁移和同步</p>
      </div>
      
      <MigrationWorkflow
        onMigrationComplete={handleMigrationComplete}
      />
    </div>
  );
};