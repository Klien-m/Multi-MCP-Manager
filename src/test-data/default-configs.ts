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
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    icon: "github",
    configPath: "~/.config/gh/gh.json"
  },
  {
    id: "tabnine",
    name: "Tabnine",
    icon: "tabnine",
    configPath: "~/.tabnine/config.json"
  },
  {
    id: "continue",
    name: "Continue",
    icon: "continue",
    configPath: "~/.continue/config.json"
  },
  {
    id: "codeium",
    name: "Codeium",
    icon: "codeium",
    configPath: "~/.codeium/config.json"
  }
];

// 扩展的AI工具扫描配置
export const EXTENDED_TOOL_SCAN_CONFIGS = {
  // Cursor 相关配置
  cursor: {
    name: "Cursor",
    patterns: ["mcp.json", "cursor.json"],
    paths: [
      "~/.cursor/mcp.json",
      "~/.cursor/cursor.json",
      "~/Library/Application Support/Cursor/mcp.json"
    ],
    mcpPatterns: ["@modelcontextprotocol"]
  },
  
  // Claude Desktop 相关配置
  claude: {
    name: "Claude Desktop",
    patterns: ["claude_desktop_config.json", "claude.json"],
    paths: [
      "~/Library/Application Support/Claude/claude_desktop_config.json",
      "~/.claude/claude.json"
    ],
    mcpPatterns: ["mcpServers", "mcp-servers"]
  },
  
  // KiloCode 相关配置
  kilocode: {
    name: "KiloCode",
    patterns: ["mcp.json", "kilocode.json"],
    paths: [
      "~/.kilocode/mcp.json",
      "~/.kilocode/kilocode.json"
    ],
    mcpPatterns: ["@modelcontextprotocol"]
  },
  
  // GitHub Copilot 相关配置
  "github-copilot": {
    name: "GitHub Copilot",
    patterns: ["gh.json", "copilot.json"],
    paths: [
      "~/.config/gh/gh.json",
      "~/.config/github-copilot/copilot.json"
    ],
    mcpPatterns: ["mcp", "modelContextProtocol"]
  },
  
  // Tabnine 相关配置
  tabnine: {
    name: "Tabnine",
    patterns: ["config.json", "tabnine.json"],
    paths: [
      "~/.tabnine/config.json",
      "~/.config/tabnine/config.json"
    ],
    mcpPatterns: ["mcp", "modelContextProtocol"]
  },
  
  // Continue 相关配置
  continue: {
    name: "Continue",
    patterns: ["config.json", "continue.json"],
    paths: [
      "~/.continue/config.json",
      "~/.config/continue/config.json"
    ],
    mcpPatterns: ["mcpServers", "mcp-servers"]
  },
  
  // Codeium 相关配置
  codeium: {
    name: "Codeium",
    patterns: ["config.json", "codeium.json"],
    paths: [
      "~/.codeium/config.json",
      "~/.config/codeium/config.json"
    ],
    mcpPatterns: ["mcp", "modelContextProtocol"]
  }
};

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
export const DEFAULT_TOOL_IDS: string[] = ['cursor', 'claude', 'kilocode', 'github-copilot', 'tabnine', 'continue', 'codeium'];

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
  ],
  "github-copilot": [
    {
      name: 'github-server',
      description: 'GitHub 代码补全服务器',
      config: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-github'],
        env: {
          GITHUB_PERSONAL_ACCESS_TOKEN: '<YOUR_TOKEN>'
        }
      }
    },
    {
      name: 'copilot-server',
      description: 'Copilot 代码建议服务器',
      config: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-copilot'],
        env: {
          COPILOT_TOKEN: '<YOUR_TOKEN>'
        }
      }
    }
  ],
  tabnine: [
    {
      name: 'local-ai-server',
      description: '本地AI代码补全服务器',
      config: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-local-ai'],
        env: {}
      }
    },
    {
      name: 'cloud-ai-server',
      description: '云端AI代码补全服务器',
      config: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-cloud-ai'],
        env: {
          TABNINE_API_KEY: '<YOUR_API_KEY>'
        }
      }
    }
  ],
  continue: [
    {
      name: 'continue-server',
      description: 'Continue 代码补全服务器',
      config: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-continue'],
        env: {}
      }
    },
    {
      name: 'custom-server',
      description: '自定义代码补全服务器',
      config: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-custom'],
        env: {}
      }
    }
  ],
  codeium: [
    {
      name: 'codeium-server',
      description: 'Codeium 代码补全服务器',
      config: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-codeium'],
        env: {
          CODEIUM_API_KEY: '<YOUR_API_KEY>'
        }
      }
    },
    {
      name: 'enterprise-server',
      description: '企业版代码补全服务器',
      config: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-enterprise'],
        env: {
          ENTERPRISE_API_KEY: '<YOUR_API_KEY>'
        }
      }
    }
  ]
};