// MCP Configuration Types (for configuration management)
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
  defaultPath?: string; // 兼容性属性
}
