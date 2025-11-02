import React, { useState } from 'react';
import { useTauriDataPersistence } from '../hooks/useTauriDataPersistence';
import { ToolConfig } from '../types';

export interface MCPConfig {
  id: string;
  name: string;
  enabled: boolean;
  config: Record<string, any>;
  lastModified: string;
  toolId: string; // 所属的 AI 工具
}

export interface AITool {
  id: string;
  name: string;
  icon: string;
  configPath?: string;
}

interface AppContextType {
  tools: ToolConfig[];
  selectedToolId: string;
  configs: MCPConfig[];
  setTools: (tools: ToolConfig[]) => void;
  setSelectedToolId: (id: string) => void;
  setConfigs: (configs: MCPConfig[]) => void;
  addConfig: (config: MCPConfig) => Promise<boolean>;
  updateConfig: (config: MCPConfig) => Promise<boolean>;
  deleteConfig: (id: string) => Promise<boolean>;
  toggleConfig: (id: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  exportData: () => Promise<string | null>;
  importData: (dataString: string) => Promise<boolean>;
  resetData: () => Promise<boolean>;
  clearError: () => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [selectedToolId, setSelectedToolId] = useState<string>("");
  const {
    tools,
    configs,
    setTools,
    setConfigs,
    addConfig,
    updateConfig,
    deleteConfig,
    toggleConfig,
    isLoading,
    error,
    exportData,
    importData,
    resetData,
    clearError
  } = useTauriDataPersistence();

  const contextValue: AppContextType = {
    tools,
    selectedToolId,
    configs,
    setTools,
    setSelectedToolId,
    setConfigs,
    addConfig,
    updateConfig,
    deleteConfig,
    toggleConfig,
    isLoading,
    error,
    exportData,
    importData,
    resetData,
    clearError
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the app context
export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};