import { useState, useEffect } from 'react';

export interface MCPConfig {
  id: string;
  name: string;
  enabled: boolean;
  config: Record<string, any>;
  lastModified: string;
  toolId: string;
}

export interface AITool {
  id: string;
  name: string;
  icon: string;
  configPath?: string;
}

// 初始 AI 工具
const INITIAL_TOOLS: AITool[] = [
  {
    id: "cursor",
    name: "Cursor",
    icon: "cursor",
    configPath: "~/.cursor/mcp.json"
  },
  {
    id: "claude",
    name: "Claude Desktop",
    icon: "claude",
    configPath: "~/Library/Application Support/Claude/claude_desktop_config.json"
  }
];

// 示例初始数据
const INITIAL_CONFIGS: MCPConfig[] = [
  {
    id: "mcp-1",
    name: "filesystem-server",
    enabled: true,
    toolId: "cursor",
    config: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/files"],
      env: {}
    },
    lastModified: new Date().toISOString()
  },
  {
    id: "mcp-2",
    name: "github-server",
    enabled: false,
    toolId: "cursor",
    config: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-github"],
      env: {
        GITHUB_PERSONAL_ACCESS_TOKEN: "<YOUR_TOKEN>"
      }
    },
    lastModified: new Date().toISOString()
  },
  {
    id: "mcp-3",
    name: "postgres-server",
    enabled: true,
    toolId: "claude",
    config: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-postgres", "postgresql://localhost/mydb"],
      env: {}
    },
    lastModified: new Date().toISOString()
  },
  {
    id: "mcp-4",
    name: "brave-search",
    enabled: true,
    toolId: "claude",
    config: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-brave-search"],
      env: {
        BRAVE_API_KEY: "<YOUR_API_KEY>"
      }
    },
    lastModified: new Date().toISOString()
  }
];

export const useDataPersistence = () => {
  const [tools, setTools] = useState<AITool[]>([]);
  const [configs, setConfigs] = useState<MCPConfig[]>([]);

  // 从 localStorage 加载数据
  useEffect(() => {
    // 加载工具
    const savedTools = localStorage.getItem("mcp-tools");
    if (savedTools) {
      try {
        const parsedTools = JSON.parse(savedTools);
        setTools(parsedTools);
      } catch (e) {
        console.error("Failed to parse saved tools", e);
        setTools(INITIAL_TOOLS);
      }
    } else {
      setTools(INITIAL_TOOLS);
    }

    // 加载配置
    const savedConfigs = localStorage.getItem("mcp-configs");
    if (savedConfigs) {
      try {
        setConfigs(JSON.parse(savedConfigs));
      } catch (e) {
        console.error("Failed to parse saved configs", e);
        setConfigs(INITIAL_CONFIGS);
      }
    } else {
      setConfigs(INITIAL_CONFIGS);
    }
  }, []);

  // 保存数据到 localStorage
  useEffect(() => {
    if (tools.length > 0) {
      localStorage.setItem("mcp-tools", JSON.stringify(tools));
    }
  }, [tools]);

  useEffect(() => {
    if (configs.length > 0) {
      localStorage.setItem("mcp-configs", JSON.stringify(configs));
    }
  }, [configs]);

  const addConfig = (config: MCPConfig) => {
    setConfigs(prev => [...prev, config]);
  };

  const updateConfig = (updatedConfig: MCPConfig) => {
    setConfigs(prev =>
      prev.map(config =>
        config.id === updatedConfig.id ? { ...updatedConfig, lastModified: new Date().toISOString() } : config
      )
    );
  };

  const deleteConfig = (id: string) => {
    setConfigs(prev => prev.filter(config => config.id !== id));
  };

  const toggleConfig = (id: string) => {
    setConfigs(prev =>
      prev.map(config =>
        config.id === id
          ? { ...config, enabled: !config.enabled, lastModified: new Date().toISOString() }
          : config
      )
    );
  };

  return {
    tools,
    configs,
    setTools,
    setConfigs,
    addConfig,
    updateConfig,
    deleteConfig,
    toggleConfig
  };
};