/**
 * 默认配置测试数据
 * 这些数据用于初始化工具和服务的默认配置
 */

import { AITool, MCPConfig } from '../types';

// 默认支持的工具列表
export const DEFAULT_TOOLS: AITool[] = [
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
  },
  {
    id: "kilocode",
    name: "KiloCode",
    icon: "kilocode",
    configPath: "~/.kilocode/mcp.json"
  }
];

// 默认的MCP配置列表
export const DEFAULT_MCP_CONFIGS: MCPConfig[] = [
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
  },
  {
    id: "mcp-5",
    name: "local-server",
    enabled: true,
    toolId: "kilocode",
    config: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-local", "/path/to/workspace"],
      env: {}
    },
    lastModified: new Date().toISOString()
  }
];

// 默认工具ID列表（用于判断是否为默认工具）
export const DEFAULT_TOOL_IDS: string[] = ['cursor', 'claude', 'kilocode'];

// MCP配置建议模板
export const MCP_CONFIG_SUGGESTIONS = {
  cursor: [
    {
      name: 'filesystem-server',
      description: '文件系统服务器',
      config: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem', '/path/to/allowed/files'],
        env: {}
      }
    },
    {
      name: 'github-server',
      description: 'GitHub 服务器',
      config: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-github'],
        env: {
          GITHUB_PERSONAL_ACCESS_TOKEN: '<YOUR_TOKEN>'
        }
      }
    }
  ],
  claude: [
    {
      name: 'postgres-server',
      description: 'PostgreSQL 数据库服务器',
      config: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-postgres', 'postgresql://localhost/mydb'],
        env: {}
      }
    },
    {
      name: 'brave-search',
      description: 'Brave 搜索服务器',
      config: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-brave-search'],
        env: {
          BRAVE_API_KEY: '<YOUR_API_KEY>'
        }
      }
    }
  ],
  kilocode: [
    {
      name: 'local-server',
      description: '本地开发服务器',
      config: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-local', '/path/to/workspace'],
        env: {}
      }
    },
    {
      name: 'git-server',
      description: 'Git 服务器',
      config: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-git', '/path/to/repo'],
        env: {}
      }
    }
  ]
};