import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Loader2, Scan, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useLocalToolScanner } from '../hooks/useLocalToolScanner';
import { useMCPManager } from '../hooks/useMCPManager';
import { ScanConfirmationDialog } from './ScanConfirmationDialog';
import { AITool } from '../types';

interface ToolScanToolbarProps {
  supportedTools: AITool[];
}

/**
 * 工具扫描工具栏
 */
export function ToolScanToolbar({ supportedTools }: ToolScanToolbarProps) {
  const {
    isScanning,
    scanProgress,
    lastScanResults,
    startScan,
    convertScanResultsToConfigs,
    saveScanConfigs
  } = useLocalToolScanner();
  
  const { reloadData } = useMCPManager();
  
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [scanResults, setScanResults] = useState<any[]>([]);
  const [isSavingConfigs, setIsSavingConfigs] = useState(false);

  /**
   * 开始扫描
   */
  const handleStartScan = async () => {
    try {
      const results = await startScan(supportedTools);
      setScanResults(results);
      setShowConfirmationDialog(true);
    } catch (error) {
      console.error('扫描失败:', error);
    }
  };

  /**
   * 确认并保存配置
   */
  const handleConfirmConfigs = async (confirmedConfigs: any[]) => {
    try {
      setIsSavingConfigs(true);
      
      // 转换扫描结果为MCP配置
      const mcpConfigs = convertScanResultsToConfigs(scanResults);
      
      // 保存配置到MCP管理器
      const success = await saveScanConfigs(scanResults, confirmedConfigs);
      
      if (success) {
        setShowConfirmationDialog(false);
        reloadData();
        setScanResults([]);
      }
    } catch (error) {
      console.error('保存配置失败:', error);
    } finally {
      setIsSavingConfigs(false);
    }
  };

  /**
   * 重新扫描
   */
  const handleRescan = async () => {
    await handleStartScan();
  };

  /**
   * 获取扫描状态信息
   */
  const getScanStatusInfo = () => {
    if (isScanning) {
      const progress = scanProgress ? (scanProgress.current / scanProgress.total) * 100 : 0;
      return {
        type: 'scanning' as const,
        message: scanProgress?.status || '正在扫描...',
        progress
      };
    }
    
    if (lastScanResults.length > 0) {
      const successful = lastScanResults.filter(r => r.scanStatus === 'success').length;
      const total = lastScanResults.length;
      const totalConfigs = lastScanResults.reduce((sum, r) => sum + r.foundConfigs.length, 0);
      
      return {
        type: 'completed' as const,
        message: `上次扫描：${successful}/${total} 个工具成功，发现 ${totalConfigs} 个配置`,
        successCount: successful,
        totalCount: total,
        configCount: totalConfigs
      };
    }
    
    return {
      type: 'idle' as const,
      message: '未进行过扫描',
      progress: 0
    };
  };

  const statusInfo = getScanStatusInfo();

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle>AI工具扫描</CardTitle>
            <Badge variant="secondary">本地扫描</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleRescan}
              disabled={isScanning || lastScanResults.length === 0}
              className="flex items-center space-x-1"
            >
              <RefreshCw className="h-4 w-4" />
              <span>重新扫描</span>
            </Button>
            <Button
              onClick={handleStartScan}
              disabled={isScanning}
              className="flex items-center space-x-1"
            >
              <Scan className="h-4 w-4" />
              <span>{isScanning ? '扫描中...' : '开始扫描'}</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* 扫描状态显示 */}
        <div className="space-y-3">
          {statusInfo.type === 'scanning' && (
            <Alert className="bg-blue-50 border-blue-200">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>{statusInfo.message}</span>
                  <span className="text-sm">{Math.round(statusInfo.progress || 0)}%</span>
                </div>
                {scanProgress && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${statusInfo.progress}%` }}
                    />
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          {statusInfo.type === 'completed' && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription>{statusInfo.message}</AlertDescription>
            </Alert>
          )}
          
          {statusInfo.type === 'idle' && (
            <Alert className="bg-gray-50 border-gray-200">
              <AlertCircle className="h-4 w-4 text-gray-500" />
              <AlertDescription>{statusInfo.message}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* 扫描摘要 */}
        {lastScanResults.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-3">扫描摘要</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">工具数量：</span>
                <span className="font-medium">{lastScanResults.length}</span>
              </div>
              <div>
                <span className="text-gray-500">成功扫描：</span>
                <span className="font-medium text-green-600">
                  {lastScanResults.filter(r => r.scanStatus === 'success').length}
                </span>
              </div>
              <div>
                <span className="text-gray-500">发现配置：</span>
                <span className="font-medium text-blue-600">
                  {lastScanResults.reduce((sum, r) => sum + r.foundConfigs.length, 0)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 扫描工具列表 */}
        <div className="mt-4">
          <h4 className="font-medium mb-2">支持的扫描工具</h4>
          <div className="flex flex-wrap gap-2">
            {supportedTools.map((tool) => (
              <Badge
                key={tool.id}
                variant="outline"
                className="text-xs py-1 px-2 whitespace-nowrap"
              >
                {tool.name}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>

      {/* 扫描确认对话框 */}
      <ScanConfirmationDialog
        open={showConfirmationDialog}
        onOpenChange={setShowConfirmationDialog}
        scanResults={scanResults}
        onConfirm={handleConfirmConfigs}
        isSaving={isSavingConfigs}
      />
    </Card>
  );
}