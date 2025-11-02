import React from 'react';
import { useAppContext } from './providers/AppProvider';
import { useAppLogic } from './hooks/useAppLogic';
import { ConfigCard } from './components/ConfigCard';
import { ConfigEditor } from './components/ConfigEditor';
import { CopyConfigDialog } from './components/CopyConfigDialog';
import { ToolSelector } from './components/ToolSelector';
import { ToolManager } from './components/ToolManager';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Alert, AlertDescription } from './components/ui/alert';
import {
  Plus,
  Search,
  Download,
  Upload,
  Server,
  Settings
} from 'lucide-react';

export function MainApp() {
  const { tools, selectedToolId, configs, setSelectedToolId, setTools, exportData, importData, isLoading, error, clearError } = useAppContext();
  const {
    // State
    searchQuery,
    editingConfig,
    isEditorOpen,
    isNewConfig,
    copyingConfig,
    isCopyDialogOpen,
    isToolManagerOpen,
    currentToolConfigs,
    filteredConfigs,
    configCounts,
    enabledCount,
    currentTool,

    // Actions
    setSearchQuery,
    setEditingConfig,
    setIsEditorOpen,
    setIsNewConfig,
    setCopyingConfig,
    setIsCopyDialogOpen,
    setIsToolManagerOpen,

    // Handlers
    handleToggle,
    handleEdit,
    handleSave,
    handleDelete,
    handleCopy,
    handleCopyConfirm,
    handleNewConfig,
    handleExport,
    handleExportCurrentTool,
    handleImport,
    handleSaveTools
  } = useAppLogic();

  return (
    <div className="min-h-screen bg-background">
      
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-primary flex items-center justify-center">
                <Settings className="size-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="flex items-center gap-2">
                  MCP 配置管理器
                </h1>
                <p className="text-muted-foreground">
                  管理多个 AI 工具的 Model Context Protocol 配置
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={async () => {
                const result = await exportData();
                if (result) {
                  const dataBlob = new Blob([result], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `mcp-${currentTool?.name}-${Date.now()}.json`;
                  link.click();
                  URL.revokeObjectURL(url);
                }
              }} disabled={isLoading}>
                <Upload className="size-4 mr-2" />
                {isLoading ? '导出中...' : '导出当前'}
              </Button>
              <Button variant="outline" size="sm" onClick={async () => {
                const result = await exportData();
                if (result) {
                  const dataBlob = new Blob([result], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `mcp-all-configs-${Date.now()}.json`;
                  link.click();
                  URL.revokeObjectURL(url);
                }
              }} disabled={isLoading}>
                <Upload className="size-4 mr-2" />
                {isLoading ? '导出中...' : '导出全部'}
              </Button>
              <Button variant="outline" size="sm" asChild>
                <label>
                  <Download className="size-4 mr-2" />
                  导入
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const dataString = event.target?.result as string;
                        const success = await importData(dataString);
                        if (success) {
                          alert('导入成功');
                        } else {
                          alert('导入失败');
                        }
                      };
                      reader.readAsText(file);
                      e.target.value = '';
                    }}
                  />
                </label>
              </Button>
              <Button onClick={handleNewConfig} size="sm">
                <Plus className="size-4 mr-2" />
                新建配置
              </Button>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
              <Button variant="outline" size="sm" onClick={clearError}>
                清除
              </Button>
            </Alert>
          )}

          {/* Stats */}
          <div className="flex gap-4">
            <Alert className="w-32">
              <Server className="size-4" />
              <AlertDescription>
                <span className="block text-muted-foreground">总配置数</span>
                <span className="block mt-1">{currentToolConfigs.length}</span>
              </AlertDescription>
            </Alert>
            <Alert className="w-32">
              <Server className="size-4 text-green-600" />
              <AlertDescription>
                <span className="block text-muted-foreground">已启用</span>
                <span className="block mt-1 text-green-600">{enabledCount}</span>
              </AlertDescription>
            </Alert>
            <Alert className="w-32">
              <Server className="size-4 text-muted-foreground" />
              <AlertDescription>
                <span className="block text-muted-foreground">已停用</span>
                <span className="block mt-1">{currentToolConfigs.length - enabledCount}</span>
              </AlertDescription>
            </Alert>
            {currentTool?.defaultPath && (
              <Alert className="flex-1">
                <AlertDescription>
                  <span className="block text-muted-foreground">配置文件路径</span>
                  <code className="block mt-1 text-sm truncate">{currentTool.defaultPath}</code>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>

      {/* Tool Selector */}
      <ToolSelector
        tools={tools}
        selectedToolId={selectedToolId}
        onSelectTool={setSelectedToolId}
        onManageTools={() => setIsToolManagerOpen(true)}
        configCounts={configCounts}
      />

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="搜索配置..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Config list */}
        {filteredConfigs.length === 0 ? (
          <div className="text-center py-12">
            <Server className="size-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-muted-foreground mb-2">
              {searchQuery ? "未找到匹配的配置" : `${currentTool?.name} 还没有配置`}
            </h3>
            {!searchQuery && (
              <Button onClick={handleNewConfig} variant="outline">
                <Plus className="size-4 mr-2" />
                创建第一个配置
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConfigs.map(config => (
              <ConfigCard
                key={config.id}
                config={config}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onCopy={handleCopy}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <ConfigEditor
        config={editingConfig}
        open={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSave}
        isNew={isNewConfig}
        currentToolId={selectedToolId}
      />

      <CopyConfigDialog
        sourceConfig={copyingConfig}
        allConfigs={configs}
        tools={tools}
        open={isCopyDialogOpen}
        onClose={() => setIsCopyDialogOpen(false)}
        onCopy={handleCopyConfirm}
      />

      <ToolManager
        tools={tools}
        open={isToolManagerOpen}
        onClose={() => setIsToolManagerOpen(false)}
        onSave={handleSaveTools}
      />
    </div>
  );
}