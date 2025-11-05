import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { localToolScannerService, ScanResult, FoundMCPConfig } from '../services/LocalToolScannerService';
import { mcpConfigService } from '../services/MCPConfigService';
import { AITool } from '../types';

/**
 * 扫描进度信息
 */
export interface ScanProgress {
  current: number;
  total: number;
  status: string;
  toolId?: string;
}

/**
 * 扫描结果汇总
 */
export interface ScanSummary {
  totalTools: number;
  successfulScans: number;
  partialScans: number;
  failedScans: number;
  totalConfigsFound: number;
  newConfigs: FoundMCPConfig[];
}

/**
 * 本地工具扫描管理 Hook
 */
export const useLocalToolScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);
  const [lastScanResults, setLastScanResults] = useState<ScanResult[]>([]);
  const [scanHistory, setScanHistory] = useState<ScanResult[][]>([]);

  /**
   * 开始扫描所有支持的工具
   */
  const startScan = useCallback(async (supportedTools: AITool[]): Promise<ScanResult[]> => {
    if (isScanning) {
      throw new Error('扫描正在进行中，请稍后再试');
    }

    try {
      setIsScanning(true);
      setScanProgress({
        current: 0,
        total: supportedTools.length,
        status: '开始扫描本地AI工具...'
      });

      // 设置扫描器的工具列表
      localToolScannerService.setSupportedTools(supportedTools);

      // 执行扫描
      const results = await localToolScannerService.scanAllTools((progress) => {
        setScanProgress(progress);
      });

      // 更新状态
      setLastScanResults(results);
      setScanHistory(prev => [results, ...prev.slice(0, 4)]); // 保留最近5次扫描记录

      // 生成扫描摘要
      const summary = generateScanSummary(results);
      
      // 显示扫描结果通知
      showScanResultsNotification(summary);

      return results;
    } catch (error) {
      console.error('扫描失败:', error);
      toast.error('扫描本地AI工具失败，请检查日志获取详细信息');
      throw error;
    } finally {
      setIsScanning(false);
      setScanProgress(null);
    }
  }, [isScanning]);

  /**
   * 扫描单个工具
   */
  const scanSingleTool = useCallback(async (tool: AITool): Promise<ScanResult> => {
    try {
      // 设置扫描器的工具列表（只包含当前工具）
      localToolScannerService.setSupportedTools([tool]);

      const results = await localToolScannerService.scanAllTools();
      return results[0];
    } catch (error) {
      console.error(`扫描工具 ${tool.name} 失败:`, error);
      throw error;
    }
  }, []);

  /**
   * 将扫描结果转换为MCP配置
   */
  const convertScanResultsToConfigs = useCallback((scanResults: ScanResult[]): any[] => {
    try {
      const mcpConfigs = localToolScannerService.convertToMCPConfigs(scanResults);
      
      // 检测重复配置
      const duplicates = localToolScannerService.detectDuplicates(mcpConfigs);
      
      // 显示重复配置信息
      if (duplicates.length > 0) {
        showDuplicatesNotification(duplicates);
      }

      return mcpConfigs;
    } catch (error) {
      console.error('转换扫描结果失败:', error);
      toast.error('转换扫描结果时发生错误');
      throw error;
    }
  }, []);

  /**
   * 自动扫描（应用启动时）
   */
  const autoScan = useCallback(async (supportedTools: AITool[]): Promise<ScanResult[]> => {
    // 检查是否需要自动扫描（例如：用户设置、上次扫描时间等）
    const shouldAutoScan = checkShouldAutoScan();
    
    if (shouldAutoScan) {
      console.log('执行自动扫描...');
      return await startScan(supportedTools);
    }
    
    return [];
  }, [startScan]);

  /**
   * 保存扫描配置到MCP管理器
   */
  const saveScanConfigs = useCallback(async (
    scanResults: ScanResult[],
    confirmConfigs: FoundMCPConfig[]
  ): Promise<boolean> => {
    try {
      console.log('useLocalToolScanner: saveScanConfigs called with:', { scanResults, confirmConfigs });
      
      // 转换为MCP配置
      const allConfigs = localToolScannerService.convertToMCPConfigs(scanResults);
      console.log('useLocalToolScanner: converted configs:', allConfigs);
      
      // 只保存用户确认的配置
      const configsToSave = allConfigs.filter(config =>
        confirmConfigs.some(confirmed =>
          confirmed.name === config.name
        )
      );
      console.log('useLocalToolScanner: configs to save:', configsToSave);

      // 从扫描结果创建AI工具
      const toolsToSave = localToolScannerService.createAIToolsFromScanResults(scanResults);
      console.log('useLocalToolScanner: tools to save:', toolsToSave);

      // 保存工具到MCP配置服务
      for (const tool of toolsToSave) {
        mcpConfigService.addToolWithId(tool);
      }

      // 保存配置到MCP配置服务
      for (const config of configsToSave) {
        mcpConfigService.addConfig(config);
      }

      console.log('useLocalToolScanner: saveScanConfigs completed successfully');
      toast.success(`成功保存 ${toolsToSave.length} 个AI工具和 ${configsToSave.length} 个MCP配置`);
      return true;
    } catch (error) {
      console.error('useLocalToolScanner: 保存扫描配置失败:', error);
      toast.error('保存配置时发生错误');
      return false;
    }
  }, []);

  /**
   * 生成扫描摘要
   */
  const generateScanSummary = useCallback((results: ScanResult[]): ScanSummary => {
    const totalTools = results.length;
    const successfulScans = results.filter(r => r.scanStatus === 'success').length;
    const partialScans = results.filter(r => r.scanStatus === 'partial').length;
    const failedScans = results.filter(r => r.scanStatus === 'failed').length;
    const totalConfigsFound = results.reduce((sum, result) => sum + result.foundConfigs.length, 0);
    const newConfigs = results.flatMap(result => result.foundConfigs);

    return {
      totalTools,
      successfulScans,
      partialScans,
      failedScans,
      totalConfigsFound,
      newConfigs
    };
  }, []);

  /**
   * 显示扫描结果通知
   */
  const showScanResultsNotification = useCallback((summary: ScanSummary) => {
    const { totalTools, successfulScans, partialScans, failedScans, totalConfigsFound } = summary;
    
    let message = `扫描完成：${totalTools} 个工具`;
    
    if (successfulScans > 0) {
      message += `，成功 ${successfulScans} 个`;
    }
    
    if (partialScans > 0) {
      message += `，部分成功 ${partialScans} 个`;
    }
    
    if (failedScans > 0) {
      message += `，失败 ${failedScans} 个`;
    }
    
    if (totalConfigsFound > 0) {
      message += `，发现 ${totalConfigsFound} 个MCP配置`;
    }

    toast.info(message, {
      duration: 5000
    });
  }, []);

  /**
   * 显示重复配置通知
   */
  const showDuplicatesNotification = useCallback((duplicates: Array<{ original: any; duplicates: any[] }>) => {
    const totalDuplicates = duplicates.reduce((sum, item) => sum + item.duplicates.length, 0);
    
    if (totalDuplicates > 0) {
      toast.warning(`发现 ${totalDuplicates} 个重复配置，已自动去重处理`, {
        duration: 4000
      });
    }
  }, []);

  /**
   * 检查是否需要自动扫描
   */
  const checkShouldAutoScan = useCallback(() => {
    // 这里可以添加自动扫描的逻辑
    // 例如：检查上次扫描时间、用户设置等
    const lastScanTime = localStorage.getItem('lastAutoScanTime');
    const now = Date.now();
    
    // 如果距离上次自动扫描超过24小时，则执行自动扫描
    if (!lastScanTime || now - parseInt(lastScanTime) > 24 * 60 * 60 * 1000) {
      localStorage.setItem('lastAutoScanTime', now.toString());
      return true;
    }
    
    return false;
  }, []);

  /**
   * 清除扫描历史
   */
  const clearScanHistory = useCallback(() => {
    setScanHistory([]);
    setLastScanResults([]);
    toast.success('扫描历史已清除');
  }, []);

  /**
   * 获取扫描统计信息
   */
  const getScanStats = useCallback(() => {
    return {
      totalScans: scanHistory.length,
      lastScanTime: scanHistory.length > 0 ? new Date().toISOString() : null,
      averageConfigsPerScan: scanHistory.length > 0 
        ? scanHistory.reduce((sum, scan) => 
            sum + scan.reduce((configSum, result) => configSum + result.foundConfigs.length, 0), 0
          ) / scanHistory.length
        : 0
    };
  }, [scanHistory]);

  return {
    // 状态
    isScanning,
    scanProgress,
    lastScanResults,
    scanHistory,
    
    // 扫描操作
    startScan,
    scanSingleTool,
    autoScan,
    clearScanHistory,
    
    // 配置操作
    convertScanResultsToConfigs,
    saveScanConfigs,
    
    // 工具方法
    generateScanSummary,
    getScanStats
  };
};